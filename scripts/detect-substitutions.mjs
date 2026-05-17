#!/usr/bin/env node
/**
 * Scan UI files for native elements that can be substituted with shadcn primitives.
 *
 * Read-only by design. Produces a JSON plan listing every candidate. The Skill
 * (Claude) reads this plan, asks the user to confirm, then runs the install +
 * rewrites using its Edit tool — guided by `references/shadcn-component-map.md`.
 *
 * Usage:
 *   node scripts/detect-substitutions.mjs               # uses stack from detect-stack.mjs
 *   node scripts/detect-substitutions.mjs --files a.tsx,b.tsx
 *   node scripts/detect-substitutions.mjs --pretty      # human-readable table
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const args = process.argv.slice(2);
const pretty = args.includes('--pretty');

function arg(name) { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; }

// Discover UI files — reuse the same logic shape as detect-stack.mjs so output
// is consistent. Caller can override via --files.
const explicitFiles = (arg('--files') ?? '').split(',').map((s) => s.trim()).filter(Boolean);

const SKIP_DIRS = new Set(['node_modules', '.next', '.git', '.nuxt', '.svelte-kit', 'dist', 'build', 'out', 'coverage', '.ui-modernizer', '.ui-modernizer-backup']);
const UI_EXT = new Set(['.tsx', '.jsx', '.vue', '.svelte']);

function walk(dir, out, depth = 0) {
  if (depth > 8) return;
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (e.name.startsWith('.') && e.name !== '.well-known') continue;
    if (SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out, depth + 1);
    else if (UI_EXT.has(path.extname(e.name))) {
      out.push(path.relative(cwd, p));
      if (out.length >= 500) return;
    }
  }
}

let files = explicitFiles;
if (files.length === 0) {
  files = [];
  for (const root of ['app', 'components', 'src/app', 'src/components', 'src/pages', 'pages', 'layouts', 'src/routes', 'src/lib']) {
    const full = path.join(cwd, root);
    if (existsSync(full) && statSync(full).isDirectory()) walk(full, files);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Pattern rules — kept conservative. Each rule returns null or a candidate.

function classesOf(tagText) {
  // Match React `className="..."`, Vue/Svelte `class="..."` — pulls the string literal only.
  const m = tagText.match(/(?:className|class)\s*=\s*"([^"]*)"/);
  return m ? m[1] : '';
}

function hasAny(classes, words) { return words.some((w) => classes.includes(w)); }
function hasAll(classes, words) { return words.every((w) => classes.includes(w)); }

// Returns { component, variant?, size?, confidence } or null
function ruleButton(tagText) {
  if (!/^<button[\s>]/.test(tagText)) return null;
  const cs = classesOf(tagText);
  if (!cs) return null;
  const isFilled = /(bg-(indigo|blue|primary|brand|red|rose|emerald|amber|zinc)-(500|600|700))/.test(cs);
  const isOutlined = cs.includes('border') && /bg-(white|zinc-50|zinc-100)/.test(cs) && !isFilled;
  const isGhost = !isFilled && !isOutlined && /(hover:bg-(zinc-100|accent|zinc-50))/.test(cs);
  if (!isFilled && !isOutlined && !isGhost) return null;

  let variant = 'default';
  if (/(bg-(red|rose)-(500|600|700))/.test(cs)) variant = 'destructive';
  else if (/(bg-(zinc-100|zinc-200|secondary))(?!-)/.test(cs)) variant = 'secondary';
  else if (isOutlined) variant = 'outline';
  else if (isGhost) variant = 'ghost';
  else if (/underline/.test(cs) && /text-(indigo|primary|brand)-/.test(cs)) variant = 'link';

  let size;
  if (/(\bh-8\b|\btext-xs\b)/.test(cs)) size = 'sm';
  else if (/(\bh-10\b|\btext-base\b)/.test(cs)) size = 'lg';

  return { component: 'Button', variant, size, confidence: 'high' };
}

function ruleInput(tagText) {
  const m = tagText.match(/^<input[\s>]/);
  if (!m) return null;
  // Only safe input types
  const typeMatch = tagText.match(/\btype\s*=\s*"([^"]+)"/);
  const t = typeMatch ? typeMatch[1] : 'text';
  if (!['text', 'email', 'password', 'search', 'number', 'tel', 'url'].includes(t)) return null;
  const cs = classesOf(tagText);
  if (!cs) return null;
  // Must look modernized — at least padding + ring/border
  if (!/(ring-(zinc|border)|border-zinc|border)/.test(cs)) return null;
  if (!/(px-3|px-4)/.test(cs)) return null;
  return { component: 'Input', confidence: 'high' };
}

function ruleTextarea(tagText) {
  if (!/^<textarea[\s>]/.test(tagText)) return null;
  const cs = classesOf(tagText);
  if (!cs) return null;
  if (!/(ring-(zinc|border)|border-zinc|border)/.test(cs)) return null;
  return { component: 'Textarea', confidence: 'high' };
}

function ruleLabel(tagText) {
  if (!/^<label[\s>]/.test(tagText)) return null;
  const cs = classesOf(tagText);
  if (!cs) return null;
  if (!(cs.includes('text-sm') && cs.includes('font-medium'))) return null;
  return { component: 'Label', confidence: 'medium' };
}

function ruleBadge(tagText) {
  if (!/^<span[\s>]/.test(tagText)) return null;
  const cs = classesOf(tagText);
  if (!cs) return null;
  if (!cs.includes('rounded-full')) return null;
  if (!/(px-2|px-2\.5)/.test(cs)) return null;
  if (!/(text-xs|text-\[10px\]|text-\[11px\])/.test(cs)) return null;
  if (!/(bg-(emerald|rose|amber|indigo|zinc|blue|red|primary|brand)-(50|100)|bg-(emerald|rose|amber|indigo|zinc|blue|red|primary|brand)-500\/10)/.test(cs)) return null;

  let variant = 'default';
  if (/(bg-(red|rose)-)/.test(cs)) variant = 'destructive';
  else if (/(bg-(zinc-100|secondary))/.test(cs)) variant = 'secondary';
  return { component: 'Badge', variant, confidence: 'medium' };
}

function ruleSeparator(tagText) {
  if (/^<hr[\s/>]/.test(tagText)) return { component: 'Separator', confidence: 'high' };
  if (/^<div[\s>]/.test(tagText)) {
    const cs = classesOf(tagText);
    if (!cs) return null;
    if (!/\bh-px\b/.test(cs)) return null;
    if (!/(bg-(zinc-200|zinc-800|border))/.test(cs)) return null;
    return { component: 'Separator', confidence: 'medium' };
  }
  return null;
}

function ruleAvatar(tagText) {
  if (!/^<img[\s>]/.test(tagText)) return null;
  const cs = classesOf(tagText);
  if (!cs) return null;
  if (!cs.includes('rounded-full')) return null;
  if (!/\bh-(6|7|8|9|10|11|12)\b/.test(cs)) return null;
  if (!/\bw-(6|7|8|9|10|11|12)\b/.test(cs)) return null;
  return { component: 'Avatar', confidence: 'high' };
}

const RULES = [ruleButton, ruleInput, ruleTextarea, ruleLabel, ruleBadge, ruleSeparator, ruleAvatar];

// ──────────────────────────────────────────────────────────────────────────────
// Tag tokenizer — pulls every opening tag <... > from a file, with line number.
function* tagsIn(text) {
  // Greedy match: <tag ... > (single tag, not the full element)
  const re = /<([a-zA-Z][a-zA-Z0-9-]*)\b[\s\S]*?>/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const tagText = m[0];
    // Skip closing tags and JSX comments
    if (tagText.startsWith('</')) continue;
    // Compute 1-based line number
    const line = text.slice(0, m.index).split('\n').length;
    yield { tagText, line, tagName: m[1].toLowerCase() };
  }
}

const candidates = [];
const componentCounts = {};

for (const rel of files) {
  let text;
  try { text = readFileSync(path.join(cwd, rel), 'utf8'); } catch { continue; }
  for (const { tagText, line, tagName } of tagsIn(text)) {
    // Cheap pre-filter: only run rules for likely-target tags
    if (!['button', 'input', 'textarea', 'label', 'span', 'div', 'hr', 'img'].includes(tagName)) continue;
    for (const rule of RULES) {
      const hit = rule(tagText);
      if (!hit) continue;
      candidates.push({
        file: rel,
        line,
        match: tagText.slice(0, 100) + (tagText.length > 100 ? '…' : ''),
        suggestedComponent: hit.component,
        suggestedVariant: hit.variant ?? null,
        suggestedSize: hit.size ?? null,
        confidence: hit.confidence,
      });
      const key = hit.component.toLowerCase();
      componentCounts[key] = (componentCounts[key] ?? 0) + 1;
      break; // one rule per tag wins
    }
  }
}

const componentToInstallName = {
  button: 'button', input: 'input', textarea: 'textarea', label: 'label',
  badge: 'badge', separator: 'separator', avatar: 'avatar',
};
const installNeeded = Object.keys(componentCounts).map((c) => componentToInstallName[c]).filter(Boolean);

const output = {
  totalCandidates: candidates.length,
  filesScanned: files.length,
  byComponent: componentCounts,
  installNeeded,
  installCommand: installNeeded.length > 0 ? `npx shadcn@latest add ${installNeeded.join(' ')}` : null,
  perFile: candidates,
};

if (pretty) {
  console.log(`Scanned ${files.length} files. Found ${candidates.length} substitution candidate(s).\n`);
  if (candidates.length === 0) { process.exit(0); }
  console.log(`Components: ${Object.entries(componentCounts).map(([k, v]) => `${k}×${v}`).join(', ')}`);
  console.log(`Install:    ${output.installCommand}\n`);
  console.log(`  ${'file'.padEnd(40)}  ${'line'.padStart(4)}  component        variant    confidence`);
  console.log(`  ${'-'.repeat(40)}  ----  ---------------  ---------  ----------`);
  for (const c of candidates) {
    console.log(`  ${c.file.padEnd(40).slice(0, 40)}  ${String(c.line).padStart(4)}  ${c.suggestedComponent.padEnd(15)}  ${(c.suggestedVariant ?? '').padEnd(9)}  ${c.confidence}`);
  }
} else {
  console.log(JSON.stringify(output, null, 2));
}
