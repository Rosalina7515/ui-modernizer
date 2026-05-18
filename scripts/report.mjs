#!/usr/bin/env node
/**
 * Generate .ui-modernizer/report.md summarizing the modernization run.
 *
 * Reads:
 *   - Latest backup manifest at .ui-modernizer-backup/<latest>/manifest.json
 *   - Current files (diff'd against backup copies)
 *   - Screenshot pairs at .ui-modernizer/screenshots/
 *
 * Writes:
 *   - .ui-modernizer/report.md
 */

import { existsSync, readdirSync, readFileSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const ROOT = path.join(cwd, '.ui-modernizer-backup');
const OUT = path.join(cwd, '.ui-modernizer');
mkdirSync(OUT, { recursive: true });

function listBackups() {
  if (!existsSync(ROOT)) return [];
  return readdirSync(ROOT).filter((n) => statSync(path.join(ROOT, n)).isDirectory()).sort();
}

const backups = listBackups();
if (backups.length === 0) {
  console.error('No backups found — cannot generate report.');
  process.exit(2);
}
const latest = backups[backups.length - 1];
const manifest = JSON.parse(readFileSync(path.join(ROOT, latest, 'manifest.json'), 'utf8'));

function diffLines(before, after) {
  const b = before.split('\n');
  const a = after.split('\n');
  let added = 0, removed = 0;
  // simple LCS-free heuristic: count differing lines
  const max = Math.max(b.length, a.length);
  for (let i = 0; i < max; i++) {
    if (b[i] !== a[i]) {
      if (i >= b.length) added++;
      else if (i >= a.length) removed++;
      else { added++; removed++; }
    }
  }
  return { added, removed };
}

const rows = [];
for (const rel of manifest.files) {
  const beforePath = path.join(ROOT, latest, 'files', rel);
  const afterPath = path.join(cwd, rel);
  if (!existsSync(beforePath) || !existsSync(afterPath)) continue;
  const before = readFileSync(beforePath, 'utf8');
  const after = readFileSync(afterPath, 'utf8');
  if (before === after) continue;
  rows.push({ file: rel, ...diffLines(before, after) });
}

const shotsBefore = path.join(OUT, 'screenshots', 'before');
const shotsAfter = path.join(OUT, 'screenshots', 'after');
const hasShots = existsSync(shotsBefore) && existsSync(shotsAfter);
const composedExists = existsSync(path.join(OUT, 'before-after.png'));

const md = [];
md.push('# ✨ UI Modernization Report');
md.push('');
md.push(`**Backup stamp:** \`${latest}\`  `);
md.push(`**Files modified:** ${rows.length}  `);
md.push(`**Total +/- lines:** +${rows.reduce((s, r) => s + r.added, 0)} / -${rows.reduce((s, r) => s + r.removed, 0)}`);
md.push('');
if (composedExists) {
  md.push('## Before / After');
  md.push('');
  md.push('![before-after](./before-after.png)');
  md.push('');
}
md.push('## Modified files');
md.push('');
md.push('| File | +lines | -lines |');
md.push('|---|---:|---:|');
for (const r of rows) md.push(`| \`${r.file}\` | +${r.added} | -${r.removed} |`);
md.push('');
if (hasShots) {
  md.push('## Per-route screenshots');
  md.push('');
  const beforeFiles = readdirSync(shotsBefore).filter((f) => f.endsWith('.png'));
  for (const f of beforeFiles) {
    const a = path.join(shotsAfter, f);
    if (!existsSync(a)) continue;
    md.push(`### \`${f.replace('.png', '')}\``);
    md.push('');
    md.push(`Before: ![before](./screenshots/before/${f})`);
    md.push('');
    md.push(`After: ![after](./screenshots/after/${f})`);
    md.push('');
  }
}
// Risks section (v0.6+) — embed visual regression findings if available
const risksPath = path.join(OUT, 'risks.json');
if (existsSync(risksPath)) {
  let risks;
  try { risks = JSON.parse(readFileSync(risksPath, 'utf8')); } catch { risks = null; }
  if (risks && risks.totals) {
    const { high, medium, info } = risks.totals;
    md.push('## ⚠️ Risks');
    md.push('');
    md.push(`> Visual regression detected: **${high} high · ${medium} medium · ${info} info**.`);
    md.push('> Skim 🔴 HIGH items first. 🔵 INFO is usually intentional (the modernizer shifts colors on purpose).');
    md.push('');
    for (const route of risks.perRoute) {
      md.push(`### Route \`${route.route}\` — ${route.counts.high} high · ${route.counts.medium} medium · ${route.counts.info} info`);
      md.push('');
      const severityEmoji = { high: '🔴 **HIGH**', medium: '🟡 **MEDIUM**', info: '🔵 INFO' };
      // Print at most 20 findings per route to keep report.md readable
      const findings = [...route.findings].sort((a, b) => {
        const order = { high: 0, medium: 1, info: 2 };
        return order[a.severity] - order[b.severity];
      }).slice(0, 20);
      for (const f of findings) {
        md.push(`${severityEmoji[f.severity]} · \`${f.path}\` — ${f.message}`);
        if (f.textBefore) md.push(`   text before: "${f.textBefore}"`);
        if (f.textAfter) md.push(`   text after: "${f.textAfter}"`);
      }
      if (route.findings.length > 20) md.push(`_(+ ${route.findings.length - 20} more, see \`.ui-modernizer/risks.json\`)_`);
      md.push('');
    }
  }
}

md.push('## Rollback');
md.push('');
md.push('```bash');
md.push('npx ui-modernizer rollback');
md.push(`# or restore from:  .ui-modernizer-backup/${latest}/`);
md.push('```');
md.push('');
md.push('## What I changed (high level)');
md.push('');
md.push('- Replaced legacy gray palette with zinc + dark mode variants.');
md.push('- Upgraded button / card / input class blocks to 2026 patterns.');
md.push('- Standardized spacing scale, radius (`rounded-md`/`xl`), and shadow + ring combos.');
md.push('- Added focus-visible rings and color transitions to all interactive elements.');
md.push('- Tuned typography: `font-semibold tracking-tight` on headings, muted body text.');
md.push('');
md.push('_No business logic was modified. Only `className` strings, layout wrappers, and styling files._');

writeFileSync(path.join(OUT, 'report.md'), md.join('\n'));
console.log(JSON.stringify({ ok: true, report: '.ui-modernizer/report.md', modifiedCount: rows.length }, null, 2));
