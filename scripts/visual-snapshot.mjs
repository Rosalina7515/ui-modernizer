#!/usr/bin/env node
/**
 * Capture a structural + computed-style snapshot of every route in the project.
 *
 * Output: .ui-modernizer/snapshots/<before|after>/<route>.json
 *
 * Each snapshot is a flat array of element records:
 *   {
 *     path: 'html>body>main[0]>section[0]>h1[0]',    // stable CSS path
 *     tag: 'h1',
 *     role: null | 'button' | ...,
 *     ariaLabeled: bool,
 *     text: string,                                   // first 40 chars
 *     style: { color, bg, fontSize, fontWeight, lineHeight, padding, borderRadius, display, opacity }
 *   }
 *
 * Usage:
 *   node scripts/visual-snapshot.mjs before
 *   node scripts/visual-snapshot.mjs after
 *   node scripts/visual-snapshot.mjs before --routes /,/dashboard,/settings
 *
 * Playwright is optional. Missing it = graceful skip (exits 0 with a notice).
 */

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import http from 'node:http';

const cwd = process.cwd();
const args = process.argv.slice(2);
const phase = args[0] === 'after' ? 'after' : 'before';

let routes = ['/'];
const ri = args.indexOf('--routes');
if (ri >= 0 && args[ri + 1]) routes = args[ri + 1].split(',').map((s) => s.trim()).filter(Boolean);

const outDir = path.join(cwd, '.ui-modernizer', 'snapshots', phase);
mkdirSync(outDir, { recursive: true });

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.log(JSON.stringify({
    ok: false,
    skipped: true,
    reason: 'playwright not installed',
    installHint: 'npm install -D playwright && npx playwright install chromium',
    phase,
  }, null, 2));
  process.exit(0);
}

function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.on('error', reject);
  });
}

function waitForServer(url, timeoutMs = 90000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      http.get(url, (res) => { res.resume(); resolve(true); })
        .on('error', () => {
          if (Date.now() - start > timeoutMs) reject(new Error('dev server timeout'));
          else setTimeout(tick, 500);
        });
    };
    tick();
  });
}

const port = await findFreePort();
const baseURL = `http://localhost:${port}`;

const pkg = JSON.parse(readFileSync(path.join(cwd, 'package.json'), 'utf8'));
const hasDevScript = pkg.scripts?.dev;
const cmd = hasDevScript ? 'npm' : 'npx';

// Pick correct dev arg per detected runtime — fallback to "next dev"
const cmdArgs = hasDevScript ? ['run', 'dev', '--', '-p', String(port)] : ['next', 'dev', '-p', String(port)];
const dev = spawn(cmd, cmdArgs, { cwd, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, PORT: String(port) } });
let devOutput = '';
dev.stdout.on('data', (d) => { devOutput += d.toString(); });
dev.stderr.on('data', (d) => { devOutput += d.toString(); });

const captured = [];
let success = false;
try {
  await waitForServer(baseURL, 90000);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();

  for (const route of routes) {
    const url = baseURL + route;
    try { await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }); }
    catch { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {}); }
    await page.waitForTimeout(800);

    const snapshot = await page.evaluate(() => {
      const out = [];
      const MAX = 5000;
      const walk = (el, parentPath, indexInParent) => {
        if (!el || !el.tagName) return;
        const tag = el.tagName.toLowerCase();
        if (['script', 'style', 'noscript', 'svg', 'path', 'g', 'defs'].includes(tag)) return;
        const cs = window.getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') return;
        const path = parentPath ? `${parentPath}>${tag}[${indexInParent}]` : tag;
        out.push({
          path,
          tag,
          role: el.getAttribute('role') || null,
          ariaLabeled: !!(el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')),
          text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40),
          style: {
            color: cs.color,
            bg: cs.backgroundColor,
            fontSize: cs.fontSize,
            fontWeight: cs.fontWeight,
            lineHeight: cs.lineHeight,
            padding: `${cs.paddingTop}|${cs.paddingRight}|${cs.paddingBottom}|${cs.paddingLeft}`,
            borderRadius: cs.borderRadius,
            display: cs.display,
            opacity: cs.opacity,
          },
        });
        if (out.length >= MAX) return;
        Array.from(el.children).forEach((c, i) => walk(c, path, i));
      };
      walk(document.documentElement, '', 0);
      return out;
    });

    const fname = route === '/' ? 'home' : route.replace(/^\//, '').replace(/\//g, '_');
    const dest = path.join(outDir, `${fname}.json`);
    writeFileSync(dest, JSON.stringify({ route, capturedAt: new Date().toISOString(), elementCount: snapshot.length, elements: snapshot }));
    captured.push({ route, file: `.ui-modernizer/snapshots/${phase}/${fname}.json`, elementCount: snapshot.length });
  }

  await browser.close();
  success = true;
} catch (e) {
  console.error('[ui-modernizer] visual snapshot failed:', e.message);
} finally {
  dev.kill('SIGTERM');
  setTimeout(() => { try { dev.kill('SIGKILL'); } catch {} }, 1500);
}

const logPath = path.join(outDir, 'dev-server.log');
writeFileSync(logPath, devOutput.slice(-8000));

console.log(JSON.stringify({ ok: success, phase, routes: captured, devLog: path.relative(cwd, logPath) }, null, 2));
process.exit(0); // never block the main flow
