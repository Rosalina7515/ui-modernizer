#!/usr/bin/env node
/**
 * Detect a project's existing brand / primary color so the modernizer can
 * preserve it instead of forcing indigo as the accent.
 *
 * Looks at, in order:
 *   1. tailwind.config.{js,ts,mjs}  — theme.extend.colors.{brand,primary,accent}
 *   2. globals.css                  — CSS variables  --brand / --primary / --accent
 *   3. globals.css                  — Tailwind v4 @theme block (--color-brand-* etc.)
 *
 * Output JSON to stdout:
 *   {
 *     found: boolean,
 *     name: 'brand' | 'primary' | 'accent' | null,   // the Tailwind/CSS name to use
 *     source: <relative path>,
 *     evidence: <short snippet>,
 *     classPrefix: 'brand' | 'primary' | 'accent' | 'indigo',  // what to plug into bg-<prefix>-600
 *     fallback: boolean,                              // true if nothing detected (uses indigo)
 *   }
 *
 * Regex-based — good enough for common Tailwind config shapes. Avoids requiring
 * a TS/JS parser for the v0.2 scope.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const NAMES = ['brand', 'primary', 'accent'];

function fileIfExists(rel) { return existsSync(path.join(cwd, rel)) ? rel : null; }

const configCandidates = [
  'tailwind.config.ts', 'tailwind.config.js', 'tailwind.config.mjs',
  'src/tailwind.config.ts', 'src/tailwind.config.js',
];
const cssCandidates = [
  // Next.js
  'app/globals.css', 'src/app/globals.css',
  'styles/globals.css', 'src/styles/globals.css',
  // Nuxt 3
  'assets/css/main.css', 'assets/main.css',
  // SvelteKit / Vite
  'src/app.css', 'src/app.postcss', 'src/styles/app.css',
  'src/style.css', 'src/styles/index.css', 'src/main.css',
];

function detectInTailwindConfig() {
  for (const rel of configCandidates) {
    const full = path.join(cwd, rel);
    if (!existsSync(full)) continue;
    const text = readFileSync(full, 'utf8');
    for (const name of NAMES) {
      // Object form:  brand: { 50: '#...', 600: '#...', ... }
      const objRe = new RegExp(`\\b${name}\\s*:\\s*\\{[^}]*\\}`, 'm');
      const objMatch = text.match(objRe);
      if (objMatch) {
        // Count numeric keys to gauge completeness.
        const keys = (objMatch[0].match(/\b(50|100|200|300|400|500|600|700|800|900|950)\b/g) ?? []).length;
        return {
          found: true,
          name,
          source: rel,
          evidence: objMatch[0].slice(0, 160).replace(/\s+/g, ' '),
          shape: keys >= 6 ? 'full-scale' : (keys >= 2 ? 'partial-scale' : 'single-value'),
        };
      }
      // String form:  brand: '#5e6ad2'
      const strRe = new RegExp(`\\b${name}\\s*:\\s*['"\`]#?[0-9a-zA-Z(,.\\s%/]+['"\`]`, 'm');
      const strMatch = text.match(strRe);
      if (strMatch) {
        return {
          found: true,
          name,
          source: rel,
          evidence: strMatch[0].slice(0, 160),
          shape: 'single-value',
        };
      }
    }
  }
  return null;
}

function detectInCSS() {
  for (const rel of cssCandidates) {
    const full = path.join(cwd, rel);
    if (!existsSync(full)) continue;
    const text = readFileSync(full, 'utf8');
    for (const name of NAMES) {
      // Tailwind v4 @theme:  --color-brand-600: ...
      const v4Re = new RegExp(`--color-${name}-(50|100|200|300|400|500|600|700|800|900|950)\\s*:`, 'm');
      if (v4Re.test(text)) {
        const matches = text.match(new RegExp(`--color-${name}-\\d+`, 'g')) ?? [];
        return {
          found: true,
          name,
          source: rel,
          evidence: `@theme defines ${matches.length} --color-${name}-* token(s)`,
          shape: matches.length >= 6 ? 'full-scale' : (matches.length >= 2 ? 'partial-scale' : 'single-value'),
          tailwindFlavor: 'v4',
        };
      }
      // Plain CSS var:  --brand: ...   or   --brand-600: ...
      const varRe = new RegExp(`--${name}(-\\d+)?\\s*:`, 'm');
      if (varRe.test(text)) {
        const matches = text.match(new RegExp(`--${name}(-\\d+)?`, 'g')) ?? [];
        return {
          found: true,
          name,
          source: rel,
          evidence: `CSS defines ${matches.length} --${name}* var(s)`,
          shape: matches.length >= 6 ? 'full-scale' : (matches.length >= 2 ? 'partial-scale' : 'single-value'),
        };
      }
    }
  }
  return null;
}

// v1.0: wrap output in unified envelope (success path only — brand detection
// always succeeds; the worst case is "not found → fallback to indigo").
import { success } from './_response.mjs';

const result = detectInTailwindConfig() ?? detectInCSS();

const payload = result
  ? {
      found: true,
      name: result.name,
      source: result.source,
      evidence: result.evidence,
      shape: result.shape,
      tailwindFlavor: result.tailwindFlavor ?? null,
      classPrefix: result.name,
      fallback: false,
    }
  : {
      found: false,
      name: null,
      source: null,
      evidence: 'No brand/primary/accent color detected in tailwind.config or globals.css',
      shape: null,
      tailwindFlavor: null,
      classPrefix: 'indigo',
      fallback: true,
    };

console.log(JSON.stringify(success('detect-brand', payload), null, 2));
process.exit(0);
