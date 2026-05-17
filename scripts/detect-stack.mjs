#!/usr/bin/env node
/**
 * Detect the project's frontend stack.
 *
 * Emits a JSON payload to stdout describing what we found, and exits non-zero
 * if the project is not a supported stack (React + Next.js + Tailwind).
 *
 * Designed to be called by the SKILL.md workflow (Step 1).
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();

function readJSON(p) {
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; }
}

const pkgPath = path.join(cwd, 'package.json');
if (!existsSync(pkgPath)) {
  console.error('✗ No package.json found in', cwd);
  process.exit(2);
}

const pkg = readJSON(pkgPath) ?? {};
const allDeps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };

const has = (name) => Object.prototype.hasOwnProperty.call(allDeps, name);
const v = (name) => allDeps[name] ?? null;

const stack = {
  cwd,
  react: { present: has('react'), version: v('react') },
  next: { present: has('next'), version: v('next') },
  tailwind: { present: has('tailwindcss'), version: v('tailwindcss') },
  tailwindAnimate: has('tailwindcss-animate'),
  tailwindForms: has('@tailwindcss/forms'),
  typescript: has('typescript'),
  styledComponents: has('styled-components'),
  emotion: has('@emotion/react') || has('@emotion/styled'),
  router: null,        // 'app' | 'pages' | 'unknown'
  configFiles: {
    tailwindConfig: null,
    nextConfig: null,
    globalsCSS: null,
    layoutFile: null,
  },
  uiFiles: [],
};

// Router detection
if (existsSync(path.join(cwd, 'app'))) stack.router = 'app';
else if (existsSync(path.join(cwd, 'src', 'app'))) stack.router = 'app';
else if (existsSync(path.join(cwd, 'pages'))) stack.router = 'pages';
else stack.router = 'unknown';

// Config files
for (const candidate of ['tailwind.config.ts', 'tailwind.config.js', 'tailwind.config.mjs']) {
  if (existsSync(path.join(cwd, candidate))) { stack.configFiles.tailwindConfig = candidate; break; }
}
for (const candidate of ['next.config.ts', 'next.config.js', 'next.config.mjs']) {
  if (existsSync(path.join(cwd, candidate))) { stack.configFiles.nextConfig = candidate; break; }
}
for (const candidate of [
  'app/globals.css', 'src/app/globals.css',
  'styles/globals.css', 'src/styles/globals.css',
]) {
  if (existsSync(path.join(cwd, candidate))) { stack.configFiles.globalsCSS = candidate; break; }
}
for (const candidate of [
  'app/layout.tsx', 'app/layout.jsx', 'src/app/layout.tsx', 'src/app/layout.jsx',
  'pages/_app.tsx', 'pages/_app.jsx', 'src/pages/_app.tsx', 'src/pages/_app.jsx',
]) {
  if (existsSync(path.join(cwd, candidate))) { stack.configFiles.layoutFile = candidate; break; }
}

// Walk UI files (cap at 200; depth-limited)
const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'dist', 'build', 'out', 'coverage', '.ui-modernizer', '.ui-modernizer-backup']);
const UI_EXT = new Set(['.tsx', '.jsx']);
const UI_ROOTS = ['app', 'components', 'src/app', 'src/components', 'src/pages', 'pages'];

function walk(dir, depth = 0) {
  if (depth > 8) return;
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (e.name.startsWith('.') && e.name !== '.well-known') continue;
    if (SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, depth + 1);
    else if (UI_EXT.has(path.extname(e.name))) {
      if (stack.uiFiles.length < 200) stack.uiFiles.push(path.relative(cwd, p));
    }
  }
}
for (const root of UI_ROOTS) {
  const full = path.join(cwd, root);
  if (existsSync(full) && statSync(full).isDirectory()) walk(full);
}

// Verdict
const reasons = [];
if (!stack.react.present) reasons.push('React not in dependencies');
if (!stack.next.present) reasons.push('Next.js not in dependencies');
if (!stack.tailwind.present) reasons.push('Tailwind CSS not in dependencies');
const supported = reasons.length === 0;

console.log(JSON.stringify({ supported, reasons, stack }, null, 2));
process.exit(supported ? 0 : 1);
