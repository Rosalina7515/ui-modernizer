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
import { makeError, didYouMean } from './_errors.mjs';
import { success, failure } from './_response.mjs';

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
    if (typeof cfg.profile !== 'string') {
      errors.push(makeError('UMD-011', { field: 'profile', message: 'must be a string or null' }));
    } else if (!VALID_PROFILES.has(cfg.profile) && !cfg.profile.endsWith('.md') && !cfg.profile.includes('/')) {
      const hint = didYouMean(cfg.profile, [...VALID_PROFILES]);
      errors.push(makeError('UMD-012', {
        provided: cfg.profile,
        validBuiltins: [...VALID_PROFILES],
        didYouMean: hint?.suggestion ?? null,
      }));
    }
  }
  // brand
  if (cfg.brand) {
    if (typeof cfg.brand !== 'object') errors.push(makeError('UMD-011', { field: 'brand', message: 'must be an object or null' }));
    else if (cfg.brand.classPrefix && !VALID_BRAND_PREFIXES.has(cfg.brand.classPrefix)) {
      const hint = didYouMean(cfg.brand.classPrefix, [...VALID_BRAND_PREFIXES]);
      errors.push(makeError('UMD-011', {
        field: 'brand.classPrefix',
        message: `must be one of ${[...VALID_BRAND_PREFIXES].join(', ')}`,
        provided: cfg.brand.classPrefix,
        didYouMean: hint?.suggestion ?? null,
      }));
    }
  }
  // ignore
  if (!Array.isArray(cfg.ignore)) errors.push(makeError('UMD-011', { field: 'ignore', message: 'must be an array of glob strings' }));
  // maxFiles
  if (!Number.isInteger(cfg.maxFiles) || cfg.maxFiles < 1) errors.push(makeError('UMD-011', { field: 'maxFiles', message: 'must be a positive integer' }));
  if (cfg.maxFiles > 200) warnings.push({ message: `maxFiles ${cfg.maxFiles} is very high; recommended ≤ 100 for review-ability` });
  // strict
  if (typeof cfg.strict !== 'boolean') errors.push(makeError('UMD-011', { field: 'strict', message: 'must be a boolean' }));
  // screenshot
  if (cfg.screenshot) {
    if (!Array.isArray(cfg.screenshot.routes)) errors.push(makeError('UMD-011', { field: 'screenshot.routes', message: 'must be an array of route strings' }));
    else for (const r of cfg.screenshot.routes) if (typeof r !== 'string' || !r.startsWith('/')) errors.push(makeError('UMD-011', { field: 'screenshot.routes', message: `route "${r}" must start with /` }));
    if (typeof cfg.screenshot.skip !== 'boolean') errors.push(makeError('UMD-011', { field: 'screenshot.skip', message: 'must be boolean' }));
  }
  // substitution
  if (cfg.substitution) {
    if (typeof cfg.substitution.enabled !== 'boolean') errors.push(makeError('UMD-011', { field: 'substitution.enabled', message: 'must be boolean' }));
    if (!Array.isArray(cfg.substitution.components)) errors.push(makeError('UMD-011', { field: 'substitution.components', message: 'must be an array' }));
    else for (const c of cfg.substitution.components) if (!VALID_COMPONENTS.has(c)) {
      const hint = didYouMean(c, [...VALID_COMPONENTS]);
      errors.push(makeError('UMD-011', {
        field: 'substitution.components',
        message: `unknown component "${c}"`,
        valid: [...VALID_COMPONENTS],
        didYouMean: hint?.suggestion ?? null,
      }));
    }
    if (typeof cfg.substitution.skipIfNoComponentsJson !== 'boolean') errors.push(makeError('UMD-011', { field: 'substitution.skipIfNoComponentsJson', message: 'must be boolean' }));
  }
  // ast
  if (cfg.ast && typeof cfg.ast.required !== 'boolean') errors.push(makeError('UMD-011', { field: 'ast.required', message: 'must be boolean' }));
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
      errors.push(makeError('UMD-010', { file: path.relative(cwd, file), parserMessage: e.message }));
      return { ok: false, configFile: path.relative(cwd, file), config: DEFAULTS, warnings, errors };
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
    if (result.warnings.length) { console.log('\n  warnings:'); for (const w of result.warnings) console.log(`    ⚠ ${w.message ?? w}`); }
    if (result.errors.length) {
      console.log('\n  errors:');
      for (const e of result.errors) {
        console.log(`    ✗ ${e.code}  ${e.title}`);
        if (e.details?.field) console.log(`       field: ${e.details.field}  →  ${e.details.message}`);
        if (e.details?.didYouMean) console.log(`       did you mean: "${e.details.didYouMean}"?`);
      }
    }
  } else {
    const envelope = result.ok
      ? success('load-config', result, result.warnings)
      : failure('load-config', result.errors, result.warnings);
    // Keep `config` and `configFile` at the payload level for backward compat in non-ok case:
    if (!result.ok) envelope.payload = { config: result.config, configFile: result.configFile };
    console.log(JSON.stringify(envelope, null, 2));
  }
  process.exit(result.ok ? 0 : 1);
}
