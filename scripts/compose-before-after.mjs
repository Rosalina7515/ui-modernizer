#!/usr/bin/env node
/**
 * Compose .ui-modernizer/before-after.png by placing matching screenshots
 * side-by-side. Pairs are matched by filename.
 *
 * Uses `sharp` if available; falls back to no-op (logs a message) if not.
 */

import { existsSync, readdirSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const beforeDir = path.join(cwd, '.ui-modernizer', 'screenshots', 'before');
const afterDir = path.join(cwd, '.ui-modernizer', 'screenshots', 'after');
const outDir = path.join(cwd, '.ui-modernizer');
mkdirSync(outDir, { recursive: true });

if (!existsSync(beforeDir) || !existsSync(afterDir)) {
  console.log(JSON.stringify({ ok: false, reason: 'screenshots missing', beforeDir, afterDir }, null, 2));
  process.exit(0);
}

let sharp;
try { sharp = (await import('sharp')).default; } catch {
  console.log(JSON.stringify({
    ok: false,
    skipped: true,
    reason: 'sharp not installed',
    installHint: 'npm install -D sharp',
  }, null, 2));
  process.exit(0);
}

const beforeFiles = readdirSync(beforeDir).filter((f) => f.endsWith('.png'));
const pairs = [];
for (const f of beforeFiles) {
  const b = path.join(beforeDir, f);
  const a = path.join(afterDir, f);
  if (existsSync(a)) pairs.push({ name: f, before: b, after: a });
}

if (pairs.length === 0) {
  console.log(JSON.stringify({ ok: false, reason: 'no matching pairs' }, null, 2));
  process.exit(0);
}

const composed = [];
for (const p of pairs) {
  const bMeta = await sharp(p.before).metadata();
  const aMeta = await sharp(p.after).metadata();
  // normalize heights
  const targetHeight = Math.min(bMeta.height ?? 900, aMeta.height ?? 900, 1400);
  const b = await sharp(p.before).resize({ height: targetHeight }).toBuffer();
  const a = await sharp(p.after).resize({ height: targetHeight }).toBuffer();
  const bResized = await sharp(b).metadata();
  const aResized = await sharp(a).metadata();
  const gap = 24;
  const totalW = (bResized.width ?? 0) + (aResized.width ?? 0) + gap;
  const out = await sharp({
    create: { width: totalW, height: targetHeight, channels: 4, background: { r: 24, g: 24, b: 27, alpha: 1 } },
  })
    .composite([
      { input: b, top: 0, left: 0 },
      { input: a, top: 0, left: (bResized.width ?? 0) + gap },
    ])
    .png()
    .toBuffer();
  const dest = path.join(outDir, `before-after-${p.name}`);
  await sharp(out).toFile(dest);
  composed.push(path.relative(cwd, dest));
}

// Pick the home view as the canonical before-after.png
const canonical = composed.find((p) => p.includes('home.png')) ?? composed[0];
if (canonical) {
  await (await import('node:fs/promises')).copyFile(path.join(cwd, canonical), path.join(outDir, 'before-after.png'));
}

console.log(JSON.stringify({ ok: true, composed, canonical: '.ui-modernizer/before-after.png' }, null, 2));
