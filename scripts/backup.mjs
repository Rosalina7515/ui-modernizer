#!/usr/bin/env node
/**
 * Backup & restore for ui-modernizer.
 *
 * Usage:
 *   node backup.mjs <file1> <file2> ...      # back up specific files
 *   node backup.mjs --plan plan.json         # back up all files listed in plan.json (key: files[])
 *   node backup.mjs --restore-latest         # restore the latest backup set
 *   node backup.mjs --list                   # list available backup timestamps
 */

import { existsSync, mkdirSync, cpSync, readdirSync, statSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const ROOT = path.join(cwd, '.ui-modernizer-backup');

function isoStamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

function ensureRoot() { if (!existsSync(ROOT)) mkdirSync(ROOT, { recursive: true }); }

function listBackups() {
  if (!existsSync(ROOT)) return [];
  return readdirSync(ROOT).filter((n) => statSync(path.join(ROOT, n)).isDirectory()).sort();
}

const args = process.argv.slice(2);
const arg = (name) => args.includes(name);

if (arg('--list')) {
  const all = listBackups();
  if (all.length === 0) { console.log('(no backups)'); process.exit(0); }
  for (const b of all) {
    const manifest = path.join(ROOT, b, 'manifest.json');
    const count = existsSync(manifest) ? (JSON.parse(readFileSync(manifest, 'utf8')).files?.length ?? '?') : '?';
    console.log(`${b}  (${count} files)`);
  }
  process.exit(0);
}

if (arg('--restore-latest')) {
  const all = listBackups();
  if (all.length === 0) { console.error('No backups found.'); process.exit(2); }
  const latest = all[all.length - 1];
  const dir = path.join(ROOT, latest);
  const manifestPath = path.join(dir, 'manifest.json');
  if (!existsSync(manifestPath)) { console.error(`Backup ${latest} is missing manifest.json`); process.exit(2); }
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  let restored = 0;
  for (const rel of manifest.files) {
    const src = path.join(dir, 'files', rel);
    const dest = path.join(cwd, rel);
    if (!existsSync(src)) { console.warn(`! missing in backup: ${rel}`); continue; }
    mkdirSync(path.dirname(dest), { recursive: true });
    cpSync(src, dest);
    restored++;
  }
  console.log(`✓ Restored ${restored} files from backup ${latest}`);
  process.exit(0);
}

// Determine list of files to back up
let files = [];
if (arg('--plan')) {
  const idx = args.indexOf('--plan');
  const planPath = args[idx + 1];
  if (!planPath || !existsSync(planPath)) { console.error('Plan file not found'); process.exit(2); }
  const plan = JSON.parse(readFileSync(planPath, 'utf8'));
  files = plan.files ?? [];
} else {
  files = args.filter((a) => !a.startsWith('--'));
}

if (files.length === 0) { console.error('No files specified to back up. Pass files or --plan <plan.json>.'); process.exit(2); }

ensureRoot();
const stamp = isoStamp();
const dir = path.join(ROOT, stamp);
mkdirSync(path.join(dir, 'files'), { recursive: true });

const copied = [];
for (const rel of files) {
  const src = path.join(cwd, rel);
  if (!existsSync(src)) { console.warn(`! skip (not found): ${rel}`); continue; }
  const dest = path.join(dir, 'files', rel);
  mkdirSync(path.dirname(dest), { recursive: true });
  cpSync(src, dest);
  copied.push(rel);
}

writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify({ stamp, files: copied }, null, 2));
console.log(JSON.stringify({ ok: true, stamp, dir: path.relative(cwd, dir), count: copied.length }, null, 2));
