#!/usr/bin/env node
/**
 * Diff before/after visual snapshots produced by visual-snapshot.mjs.
 * Outputs a Risks JSON to .ui-modernizer/risks.json.
 *
 * Risk categories:
 *   high    — interactive element vanished, role lost, aria removed, contrast dropped below WCAG AA
 *   medium  — tag changed, font-size shrunk > 20%, padding/border-radius wildly off
 *   info    — color/background shifted (likely intentional), element added (usually intentional)
 *
 * Usage:
 *   node scripts/visual-diff.mjs
 */

import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const beforeDir = path.join(cwd, '.ui-modernizer', 'snapshots', 'before');
const afterDir = path.join(cwd, '.ui-modernizer', 'snapshots', 'after');
const outFile = path.join(cwd, '.ui-modernizer', 'risks.json');
mkdirSync(path.dirname(outFile), { recursive: true });

if (!existsSync(beforeDir) || !existsSync(afterDir)) {
  console.log(JSON.stringify({ ok: false, reason: 'snapshots missing', beforeDir, afterDir }, null, 2));
  process.exit(0);
}

// ──────────────────────────────────────────────────────────────────────────────
// Color contrast helpers (WCAG)
function parseRGB(str) {
  // Matches "rgb(0, 0, 0)" / "rgba(0, 0, 0, 0.5)"
  const m = String(str).match(/rgba?\((\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)/);
  return m ? { r: +m[1], g: +m[2], b: +m[3] } : null;
}
function relLum({ r, g, b }) {
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrastRatio(fg, bg) {
  const a = parseRGB(fg), b = parseRGB(bg);
  if (!a || !b) return null;
  const L1 = relLum(a), L2 = relLum(b);
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}
function parsePx(str) { const m = String(str).match(/(\d+(?:\.\d+)?)px/); return m ? +m[1] : null; }

// ──────────────────────────────────────────────────────────────────────────────
const interactiveTags = new Set(['button', 'a', 'input', 'textarea', 'select', 'form', 'label']);
const beforeFiles = readdirSync(beforeDir).filter((f) => f.endsWith('.json'));
const perRoute = [];

for (const file of beforeFiles) {
  const a = path.join(beforeDir, file);
  const b = path.join(afterDir, file);
  if (!existsSync(b)) continue;
  const before = JSON.parse(readFileSync(a, 'utf8'));
  const after = JSON.parse(readFileSync(b, 'utf8'));

  const bMap = new Map(before.elements.map((e) => [e.path, e]));
  const aMap = new Map(after.elements.map((e) => [e.path, e]));

  const findings = [];

  // Missing (in before, gone in after)
  for (const [path, el] of bMap) {
    if (!aMap.has(path)) {
      const sev = interactiveTags.has(el.tag) ? 'high' : (el.ariaLabeled ? 'high' : 'medium');
      findings.push({
        severity: sev,
        kind: 'missing-element',
        path,
        message: `${el.tag}${el.role ? `[role=${el.role}]` : ''} ${el.ariaLabeled ? 'with aria label' : ''} disappeared`.trim(),
        textBefore: el.text,
      });
    }
  }

  // Added (in after, new)
  for (const [path, el] of aMap) {
    if (!bMap.has(path)) {
      findings.push({
        severity: 'info',
        kind: 'added-element',
        path,
        message: `new ${el.tag} appeared`,
        textAfter: el.text,
      });
    }
  }

  // Kept — compare attributes + style
  for (const [path, bEl] of bMap) {
    const aEl = aMap.get(path);
    if (!aEl) continue;

    if (bEl.tag !== aEl.tag) {
      findings.push({ severity: 'medium', kind: 'tag-changed', path, message: `tag changed: ${bEl.tag} → ${aEl.tag}` });
    }
    if (bEl.role !== aEl.role) {
      findings.push({
        severity: bEl.role && !aEl.role ? 'high' : 'medium',
        kind: 'role-changed',
        path,
        message: `role changed: ${bEl.role ?? '(none)'} → ${aEl.role ?? '(none)'}`,
      });
    }
    if (bEl.ariaLabeled && !aEl.ariaLabeled) {
      findings.push({ severity: 'high', kind: 'aria-lost', path, message: 'aria-label/aria-labelledby was present, now missing' });
    }

    // Contrast (only worth checking for elements that have text + visible foreground/background)
    if (bEl.text && aEl.text && aEl.text.length > 0) {
      const beforeContrast = contrastRatio(bEl.style.color, bEl.style.bg);
      const afterContrast = contrastRatio(aEl.style.color, aEl.style.bg);
      if (beforeContrast && afterContrast && beforeContrast >= 4.5 && afterContrast < 4.5) {
        findings.push({
          severity: 'high',
          kind: 'contrast-regression',
          path,
          message: `text contrast dropped below WCAG AA (4.5): ${beforeContrast.toFixed(2)} → ${afterContrast.toFixed(2)}`,
        });
      } else if (beforeContrast && afterContrast && (beforeContrast - afterContrast) > 1.5) {
        findings.push({
          severity: 'medium',
          kind: 'contrast-drop',
          path,
          message: `text contrast dropped notably: ${beforeContrast.toFixed(2)} → ${afterContrast.toFixed(2)} (still above AA)`,
        });
      }
    }

    // Font size shrink > 20%
    const bFS = parsePx(bEl.style.fontSize), aFS = parsePx(aEl.style.fontSize);
    if (bFS && aFS && (bFS - aFS) / bFS > 0.2) {
      findings.push({
        severity: 'medium',
        kind: 'font-size-shrunk',
        path,
        message: `font-size shrunk: ${bFS}px → ${aFS}px (-${Math.round((1 - aFS / bFS) * 100)}%)`,
      });
    }

    // Color / background shifted (info — usually intentional)
    if (bEl.style.color !== aEl.style.color || bEl.style.bg !== aEl.style.bg) {
      // Only surface if it's a heading or large text — otherwise too noisy
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(bEl.tag) || (bFS && bFS >= 18)) {
        findings.push({
          severity: 'info',
          kind: 'color-shifted',
          path,
          message: `color: ${bEl.style.color} → ${aEl.style.color}; bg: ${bEl.style.bg} → ${aEl.style.bg}`,
        });
      }
    }
  }

  perRoute.push({
    route: before.route,
    elementCount: { before: before.elementCount, after: after.elementCount },
    counts: {
      high: findings.filter((f) => f.severity === 'high').length,
      medium: findings.filter((f) => f.severity === 'medium').length,
      info: findings.filter((f) => f.severity === 'info').length,
    },
    findings,
  });
}

const totals = perRoute.reduce(
  (s, r) => ({ high: s.high + r.counts.high, medium: s.medium + r.counts.medium, info: s.info + r.counts.info }),
  { high: 0, medium: 0, info: 0 }
);

const output = {
  ok: true,
  routesCompared: perRoute.length,
  totals,
  perRoute,
};

writeFileSync(outFile, JSON.stringify(output, null, 2));
console.log(JSON.stringify({ ok: true, risks: path.relative(cwd, outFile), totals }, null, 2));
