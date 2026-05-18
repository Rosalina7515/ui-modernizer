#!/usr/bin/env node
/**
 * Load and validate `.ui-modernizer.json` (v0.8).
 *
 * Read-only. Returns a fully-resolved config (project + defaults merged) as JSON.
 *
 * Usage (CLI):
 *   node scripts/load-config.mjs                 # JSON to stdout
 *   node scripts/load-config.mjs --pretty        # human-readable
 *   node scripts/load-config.mjs --root <dir>    # use <dir> instead of cwd
 *
 * Usage (programmatic):
 *   import { loadConfig, DEFAULTS } from './load-config.mjs';
 *   const cfg = loadConfig({ root: process.cwd() });
 *
 * Schema (.ui-modernizer.json):
 *   {
 *     "profile": "linear" | "vercel" | "stripe" | "shadcn" |
 *                "notion" | "raycast" | "apple" | "<path-to-local.md>" | null,
 *     "brand":   { "classPrefix": "brand" | "primary" | "accent" | "indigo" } | null,
 *     "ignore":  [<glob>, ...],
 *     "maxFiles": <int>,
 *     "strict":  bool,
 *     "screenshot": { "routes": [<route>, ...], "skip": bool },
 *     "substitution": {
 *       "enabled": bool,
 *       "components": ["button"|"input"|"textarea"|"label"|"badge"|"separator"|"avatar"],
 *       "skipIfNoComponentsJson": bool
 *     },
 *     "ast": { "required": bool }
 *   }
 */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const isMain = process.argv[1] === __filename || process.argv[1]?.endsWith('/load-config.mjs');

export const DEFAULTS = Object.freeze({
  profile: null,
  brand: null,
  ignore: ['**/node_modules/**', '**/.next/**', '**/.nuxt/**', '**/.svelte-kit/**', '**/.git/**', '**/dist/**', '**/build/**', '**/.ui-modernizer/**', '**/.ui-modernizer-backup/**'],
  maxFiles: 30,
  strict: false,
  screenshot: { routes: ['/'], skip: false },
  substitution: { enabled: false, components: ['button', 'input', 'textarea', 'label', 'badge', 'separator', 'avatar'], skipIfNoComponentsJson: true },
  ast: { required: false },
});

const VALID_PROFILES = new Set(['linear', 'vercel', 'stripe', 'shadcn', 'notion', 'raycast', 'apple']);
const VALID_BRAND_PREFIXES = new Set(['brand', 'primary', 'accent', 'indigo']);
const VALID_COMPONENTS = new Set(['button', 'input', 'textarea', 'label', 'badge', 'separator', 'avatar']);

function deepMerge(base, over) {
  if (over === undefined || over === null) return base;
  if (base === null || typeof base !== 'object' || Array.isArray(base) || typeof over !== 'object' || Array.isArray(over)) return over;
  const out = { ...base };
  for (const k of Object.keys(over)) out[k] = deepMerge(base[k], over[k]);
  return out;
}

function validate(cfg, warnings, errors) {
  // profile
  if (cfg.profile !== null && cfg.profile !== undefined) {
    if (typeof cfg.profile !== 'string') errors.push('profile must be a string or null');
    else if (!VALID_PROFILES.has(cfg.profile) && !cfg.profile.endsWith('.md') && !cfg.profile.includes('/')) {
      warnings.push(`profile "${cfg.profile}" is not a built-in (linear/vercel/stripe/shadcn/notion/raycast/apple) — treated as a local path; verify the file exists`);
    }
  }
  // brand
  if (cfg.brand) {
    if (typeof cfg.brand !== 'object') errors.push('brand must be an object or null');
    else if (cfg.brand.classPrefix && !VALID_BRAND_PREFIXES.has(cfg.brand.classPrefix)) {
      errors.push(`brand.classPrefix must be one of ${[...VALID_BRAND_PREFIXES].join(', ')}`);
    }
  }
  // ignore
  if (!Array.isArray(cfg.ignore)) errors.push('ignore must be an array of glob strings');
  // maxFiles
  if (!Number.isInteger(cfg.maxFiles) || cfg.maxFiles < 1) errors.push('maxFiles must be a positive integer');
  if (cfg.maxFiles > 200) warnings.push(`maxFiles ${cfg.maxFiles} is very high; recommended ≤ 100 for review-ability`);
  // strict
  if (typeof cfg.strict !== 'boolean') errors.push('strict must be a boolean');
  // screenshot
  if (cfg.screenshot) {
    if (!Array.isArray(cfg.screenshot.routes)) errors.push('screenshot.routes must be an array of route strings');
    else for (const r of cfg.screenshot.routes) if (typeof r !== 'string' || !r.startsWith('/')) errors.push(`screenshot.route "${r}" must start with /`);
    if (typeof cfg.screenshot.skip !== 'boolean') errors.push('screenshot.skip must be boolean');
  }
  // substitution
  if (cfg.substitution) {
    if (typeof cfg.substitution.enabled !== 'boolean') errors.push('substitution.enabled must be boolean');
    if (!Array.isArray(cfg.substitution.components)) errors.push('substitution.components must be an array');
    else for (const c of cfg.substitution.components) if (!VALID_COMPONENTS.has(c)) errors.push(`substitution.components contains unknown "${c}"`);
    if (typeof cfg.substitution.skipIfNoComponentsJson !== 'boolean') errors.push('substitution.skipIfNoComponentsJson must be boolean');
  }
  // ast
  if (cfg.ast && typeof cfg.ast.required !== 'boolean') errors.push('ast.required must be boolean');
}

export function loadConfig({ root } = {}) {
  const cwd = root ?? process.cwd();
  const file = path.join(cwd, '.ui-modernizer.json');
  const exists = existsSync(file);
  let projectConfig = null;
  const errors = [];
  const warnings = [];

  if (exists) {
    try {
      projectConfig = JSON.parse(readFileSync(file, 'utf8'));
    } catch (e) {
      errors.push(`failed to parse .ui-modernizer.json: ${e.message}`);
      return { ok: false, source: file, errors, warnings, config: DEFAULTS };
    }
  }

  const merged = projectConfig ? deepMerge(DEFAULTS, projectConfig) : { ...DEFAULTS };
  // Special case: `ignore` should be additive (user-provided ignores are added to defaults),
  // because the defaults already cover noise dirs like node_modules.
  if (projectConfig?.ignore && Array.isArray(projectConfig.ignore)) {
    merged.ignore = [...new Set([...DEFAULTS.ignore, ...projectConfig.ignore])];
  }
  validate(merged, warnings, errors);

  return {
    ok: errors.length === 0,
    configFile: exists ? path.relative(cwd, file) : null,
    overrides: projectConfig ?? {},
    config: merged,
    warnings,
    errors,
  };
}

// CLI entry
if (isMain) {
  const args = process.argv.slice(2);
  const pretty = args.includes('--pretty');
  const rootIdx = args.indexOf('--root');
  const root = rootIdx >= 0 ? args[rootIdx + 1] : undefined;

  const result = loadConfig({ root });

  if (pretty) {
    console.log(`ui-modernizer config ${result.ok ? '✓' : '✗'}`);
    console.log(`  source:    ${result.configFile ?? '(defaults — no .ui-modernizer.json found)'}`);
    console.log(`  profile:   ${result.config.profile ?? '(default blend)'}`);
    console.log(`  brand:     ${result.config.brand?.classPrefix ?? '(auto-detect)'}`);
    console.log(`  maxFiles:  ${result.config.maxFiles}`);
    console.log(`  strict:    ${result.config.strict}`);
    console.log(`  ignore:    ${result.config.ignore.length} glob(s)`);
    console.log(`  substitution: ${result.config.substitution.enabled ? 'enabled' : 'disabled'}`);
    if (result.warnings.length) { console.log('\n  warnings:'); for (const w of result.warnings) console.log(`    ⚠ ${w}`); }
    if (result.errors.length) { console.log('\n  errors:'); for (const e of result.errors) console.log(`    ✗ ${e}`); }
  } else {
    console.log(JSON.stringify(result, null, 2));
  }
  process.exit(result.ok ? 0 : 1);
}
