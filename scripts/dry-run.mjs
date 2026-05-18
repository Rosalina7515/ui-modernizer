#!/usr/bin/env node
/**
 * Dry-run modernization preview (v0.8).
 *
 * Read-only. Walks UI files, counts stale class patterns that v0.x rules would
 * modernize, outputs a plan. Never modifies files.
 *
 * Usage:
 *   node scripts/dry-run.mjs                       # JSON plan
 *   node scripts/dry-run.mjs --pretty              # human-readable
 *   node scripts/dry-run.mjs --ci                  # exit 1 if any candidates found
 *   node scripts/dry-run.mjs --root <dir>          # use <dir> instead of cwd
 *
 * Honors `.ui-modernizer.json`:
 *   - `ignore[]` — glob patterns to exclude
 *   - `maxFiles` — cap on files scanned
 *   - `strict`  — implies --ci behavior
 *
 * Detection accuracy: dry-run uses a SUBSET of mechanical class-substitution
 * rules (the obvious 1-to-1 stale-pattern detections). The real modernization
 * run, performed by Claude, applies the full ruleset including context-sensitive
 * decisions. So a "0 candidates" dry-run is the best signal the UI is already
 * modernized; a "47 candidates" dry-run is a lower bound on changes.
 */

import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig } from './load-config.mjs';
import { extractFile } from './ast-extract.mjs';

const __filename = fileURLToPath(import.meta.url);
const isMain = process.argv[1] === __filename || process.argv[1]?.endsWith('/dry-run.mjs');

// ──────────────────────────────────────────────────────────────────────────────
// Stale-pattern rules (subset of references/tailwind-modernization.md).
//
// Each rule's pattern matches a single full Tailwind class token (after
// tokenization on whitespace). The `(?:[a-z]+:)*` prefix consumes variant
// modifiers (sm:, md:, hover:, dark:, etc.) so a rule fires regardless of which
// variants are stacked in front.
const STALE_RULES = [
  { id: 'gray-palette',   pattern: /^(?:[a-z]+:)*(?:bg|text|border|ring|divide)-gray-(?:50|100|200|300|400|500|600|700|800|900|950)$/,        suggest: 'gray-* → zinc-*' },
  { id: 'blue-accent',    pattern: /^(?:[a-z]+:)*(?:bg|text)-blue-(?:500|600|700)$/,                                                            suggest: 'blue-* → indigo-* or brand' },
  { id: 'red-status',     pattern: /^(?:[a-z]+:)*text-red-(?:400|500|600)$/,                                                                    suggest: 'red-* → rose-* for status' },
  { id: 'green-status',   pattern: /^(?:[a-z]+:)*text-green-(?:400|500|600)$/,                                                                  suggest: 'green-* → emerald-* for status' },
  { id: 'rounded-bare',   pattern: /^(?:[a-z]+:)*rounded$/,                                                                                     suggest: 'rounded → rounded-md (or rounded-xl on cards)' },
  { id: 'shadow-bare',    pattern: /^(?:[a-z]+:)*shadow$/,                                                                                      suggest: 'shadow → shadow-sm + ring-1 ring-zinc-200' },
  { id: 'shadow-md-bare', pattern: /^shadow-md$/,                                                                                               suggest: 'shadow-md → shadow-sm resting + hover:shadow-md' }, // standalone only — hover:shadow-md is correct
  { id: 'font-bold',      pattern: /^(?:[a-z]+:)*font-bold$/,                                                                                   suggest: 'font-bold → font-semibold tracking-tight (headings)' },
];

// Tokenize a class string and check each token against the rules.
function scanString(value) {
  const tokens = String(value ?? '').split(/[\s\n]+/).filter(Boolean);
  const counts = {};
  for (const tok of tokens) {
    for (const rule of STALE_RULES) {
      if (rule.pattern.test(tok)) {
        counts[rule.id] = (counts[rule.id] ?? 0) + 1;
        break; // one rule per token
      }
    }
  }
  return Object.entries(counts).map(([ruleId, count]) => {
    const rule = STALE_RULES.find((r) => r.id === ruleId);
    return { ruleId, suggest: rule.suggest, count };
  });
}

// Quick glob match (only ** and * — keep it simple, no external deps)
function globToRegex(glob) {
  let s = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  s = s.replace(/\*\*\//g, '__DOUBLESTAR_SLASH__');
  s = s.replace(/\*\*/g, '__DOUBLESTAR__');
  s = s.replace(/\*/g, '[^/]*');
  s = s.replace(/__DOUBLESTAR_SLASH__/g, '(?:.*/)?');
  s = s.replace(/__DOUBLESTAR__/g, '.*');
  return new RegExp('^' + s + '$');
}
function matchAnyGlob(relPath, globs) {
  return globs.some((g) => globToRegex(g).test(relPath));
}

// Walk repo for UI files (capped, gitignore-naive but ignore-glob-aware)
function walkUI(root, ignoreGlobs) {
  const exts = new Set(['.tsx', '.jsx', '.vue', '.svelte']);
  const SKIP_BASE = new Set(['node_modules', '.git', '.next', '.nuxt', '.svelte-kit', 'dist', 'build', 'coverage', '.ui-modernizer', '.ui-modernizer-backup']);
  const found = [];
  function walk(dir, depth = 0) {
    if (depth > 12) return;
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (SKIP_BASE.has(e.name)) continue;
      if (e.name.startsWith('.') && e.name !== '.well-known') continue;
      const full = path.join(dir, e.name);
      const rel = path.relative(root, full);
      if (matchAnyGlob(rel, ignoreGlobs)) continue;
      if (e.isDirectory()) walk(full, depth + 1);
      else if (exts.has(path.extname(e.name))) found.push(rel);
    }
  }
  walk(root);
  return found;
}

async function runDryRun({ root, ci }) {
  const cfgRes = loadConfig({ root });
  if (!cfgRes.ok) return { ok: false, errors: cfgRes.errors, config: cfgRes.config };
  const cfg = cfgRes.config;
  const effectiveCI = ci || cfg.strict;

  const allFiles = walkUI(root, cfg.ignore);
  const files = allFiles.slice(0, cfg.maxFiles);
  const truncated = allFiles.length > cfg.maxFiles;

  let astAvailable = null;
  const perFile = [];
  let totalCandidates = 0;
  const byRuleTotals = {};

  for (const rel of files) {
    const result = await extractFile(rel);
    if (astAvailable === null) astAvailable = result.ok || result.reason !== 'parser-missing';

    // Fallback to whole-file regex if AST missing or extraction failed
    let strings;
    if (result.ok && result.strings?.length) {
      strings = result.strings.filter((s) => s.editable !== false);
    } else {
      const raw = readFileSync(path.join(root, rel), 'utf8');
      // crude fallback: capture content of class= / className= attributes
      const re = /(?:className|class)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{["']([^"']*)["']\})/g;
      strings = [];
      let m;
      while ((m = re.exec(raw)) !== null) {
        strings.push({ value: m[1] ?? m[2] ?? m[3] ?? '', kind: 'regex-fallback', editable: true });
      }
    }

    let fileCandidates = 0;
    const byRule = {};
    for (const s of strings) {
      const hits = scanString(s.value);
      for (const h of hits) {
        fileCandidates += h.count;
        byRule[h.ruleId] = (byRule[h.ruleId] ?? 0) + h.count;
        byRuleTotals[h.ruleId] = (byRuleTotals[h.ruleId] ?? 0) + h.count;
      }
    }
    if (fileCandidates > 0) perFile.push({ file: rel, candidates: fileCandidates, byRule });
    totalCandidates += fileCandidates;
  }

  return {
    ok: true,
    config: { profile: cfg.profile, strict: cfg.strict, maxFiles: cfg.maxFiles },
    configFile: cfgRes.configFile,
    astAvailable,
    filesScanned: files.length,
    filesTotal: allFiles.length,
    truncated,
    filesWithChanges: perFile.length,
    totalCandidateChanges: totalCandidates,
    byRule: byRuleTotals,
    perFile,
    effectiveCI,
    exitCode: effectiveCI && totalCandidates > 0 ? 1 : 0,
  };
}

if (isMain) {
  const args = process.argv.slice(2);
  const pretty = args.includes('--pretty');
  const ci = args.includes('--ci');
  const rootIdx = args.indexOf('--root');
  const root = rootIdx >= 0 ? path.resolve(args[rootIdx + 1]) : process.cwd();

  const result = await runDryRun({ root, ci });

  if (!result.ok) {
    console.error('Dry-run failed:');
    for (const e of result.errors) console.error(`  ✗ ${e}`);
    process.exit(2);
  }

  if (pretty) {
    console.log(`ui-modernizer dry-run (${result.configFile ?? 'no config file'})`);
    console.log('');
    console.log(`  AST available:           ${result.astAvailable ? 'yes (@babel/parser found)' : 'no (regex fallback)'}`);
    console.log(`  Files scanned:           ${result.filesScanned}${result.truncated ? ` of ${result.filesTotal} (truncated by maxFiles)` : ''}`);
    console.log(`  Files with candidates:   ${result.filesWithChanges}`);
    console.log(`  Total candidate changes: ${result.totalCandidateChanges}`);
    if (Object.keys(result.byRule).length) {
      console.log('');
      console.log('  By rule:');
      for (const [id, c] of Object.entries(result.byRule).sort((a, b) => b[1] - a[1])) {
        console.log(`    ${String(c).padStart(4)}  ${id}`);
      }
    }
    if (result.perFile.length) {
      console.log('');
      console.log('  Top files:');
      for (const f of result.perFile.sort((a, b) => b.candidates - a.candidates).slice(0, 10)) {
        const rules = Object.keys(f.byRule).join(', ');
        console.log(`    ${String(f.candidates).padStart(4)}  ${f.file.padEnd(50)}  (${rules})`);
      }
    }
    console.log('');
    if (result.totalCandidateChanges === 0) console.log('  ✓ No stale patterns detected. UI looks modernized.');
    else if (result.effectiveCI) console.log(`  ✗ CI mode: exit ${result.exitCode} (set strict: false to make this non-fatal)`);
    else console.log(`  ⚠ Found ${result.totalCandidateChanges} candidate change(s). Run "modernize this UI" in Claude Code to apply.`);
  } else {
    console.log(JSON.stringify(result, null, 2));
  }

  process.exit(result.exitCode);
}

export { runDryRun };
