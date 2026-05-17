#!/usr/bin/env node
/**
 * Take before/after screenshots of the project's dev server.
 *
 * Usage:
 *   node screenshot.mjs before
 *   node screenshot.mjs after
 *   node screenshot.mjs --routes /,/dashboard,/settings  (optional)
 *
 * Strategy:
 *   1. Pick a free port.
 *   2. Spawn `next dev -p <port>`.
 *   3. Wait for the dev server to respond (poll http://localhost:<port>).
 *   4. Launch Playwright, screenshot each route at desktop + dark variants.
 *   5. Kill the dev server.
 *
 * Playwright is optional. If it's not installed, this script prints an
 * informative message and exits 0 (we don't want screenshots to block
 * the main modernization flow).
 */

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import http from 'node:http';

const cwd = process.cwd();
const args = process.argv.slice(2);
const phase = args[0] === 'after' ? 'after' : 'before';

// Optional --routes flag
let routes = ['/'];
const ri = args.indexOf('--routes');
if (ri >= 0 && args[ri + 1]) {
  routes = args[ri + 1].split(',').map((s) => s.trim()).filter(Boolean);
}

const outDir = path.join(cwd, '.ui-modernizer', 'screenshots', phase);
mkdirSync(outDir, { recursive: true });

// Try loading Playwright; if missing, exit gracefully.
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

function waitForServer(url, timeoutMs = 60000) {
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

console.error(`[ui-modernizer] starting dev server on port ${port}...`);

// Spawn `npm run dev` if available, else `npx next dev`.
const pkg = JSON.parse((await import('node:fs')).readFileSync(path.join(cwd, 'package.json'), 'utf8'));
const hasDevScript = pkg.scripts?.dev;
const cmd = hasDevScript ? 'npm' : 'npx';
const cmdArgs = hasDevScript ? ['run', 'dev', '--', '-p', String(port)] : ['next', 'dev', '-p', String(port)];

const dev = spawn(cmd, cmdArgs, { cwd, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, PORT: String(port) } });
let devOutput = '';
dev.stdout.on('data', (d) => { devOutput += d.toString(); });
dev.stderr.on('data', (d) => { devOutput += d.toString(); });

let success = false;
const taken = [];
try {
  await waitForServer(baseURL, 90000);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  for (const route of routes) {
    const url = baseURL + route;
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    } catch {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
    }
    // small settle
    await page.waitForTimeout(800);
    const fname = route === '/' ? 'home' : route.replace(/^\//, '').replace(/\//g, '_');
    const dest = path.join(outDir, `${fname}.png`);
    await page.screenshot({ path: dest, fullPage: true });
    taken.push({ route, file: path.relative(cwd, dest) });
  }
  await browser.close();
  success = true;
} catch (e) {
  console.error('[ui-modernizer] screenshot failed:', e.message);
} finally {
  dev.kill('SIGTERM');
  // give it a moment, then SIGKILL if needed
  setTimeout(() => { try { dev.kill('SIGKILL'); } catch {} }, 1500);
}

// Log dev server tail for debugging
const logPath = path.join(outDir, 'dev-server.log');
writeFileSync(logPath, devOutput.slice(-8000));

console.log(JSON.stringify({ ok: success, phase, routes: taken, devLog: path.relative(cwd, logPath) }, null, 2));
process.exit(success ? 0 : 0); // never block the main flow
