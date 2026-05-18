#!/usr/bin/env node
/**
 * AST-based class-string extractor (v0.7).
 *
 * Lists every Tailwind class string in a JSX / TSX / Vue / Svelte file using a
 * real parser, so the modernizer never confuses a comment or template string
 * for actual className content.
 *
 * Output entries:
 *   {
 *     file:    <relative path>,
 *     line:    <1-based line>,
 *     col:     <0-based column>,
 *     kind:    'jsx-attr' | 'jsx-expr-string' | 'template-quasi' | 'cn-arg' | 'vue-class' | 'svelte-class',
 *     value:   <the class string itself>,
 *     attr:    'className' | 'class',
 *     editable: bool   // safe to mechanically substitute classes inside?
 *   }
 *
 * Usage:
 *   node scripts/ast-extract.mjs <file> [<file>...]
 *   node scripts/ast-extract.mjs <file> --pretty
 *   node scripts/ast-extract.mjs <file> --json     (default)
 *
 * Exit codes:
 *   0  successfully parsed (even if 0 strings found)
 *   1  parse failed
 *   2  usage error
 *
 * Parser dependency map:
 *   .jsx/.tsx  →  @babel/parser + @babel/traverse  (in optionalDependencies)
 *   .vue       →  best-effort template scan; full Vue AST is v0.8 stretch goal
 *   .svelte    →  best-effort markup scan; full Svelte AST is v0.8 stretch goal
 *
 * When @babel/parser is missing, this script exits 0 with `{ ok: false, reason }`
 * so callers can decide what to do (typically: fall back to regex extraction).
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const pretty = args.includes('--pretty');
const targets = args.filter((a) => !a.startsWith('--'));

if (targets.length === 0) {
  console.error('Usage: ast-extract.mjs <file> [<file>...] [--pretty]');
  process.exit(2);
}

const cwd = process.cwd();

// ──────────────────────────────────────────────────────────────────────────────
// JSX / TSX

async function extractJSX(filePath, code) {
  let parser, traverseMod;
  try {
    parser = await import('@babel/parser');
    traverseMod = await import('@babel/traverse');
  } catch {
    return {
      ok: false,
      reason: 'parser-missing',
      parser: 'babel',
      installHint: 'npm install --save-dev @babel/parser @babel/traverse',
      strings: [],
    };
  }
  const traverse = traverseMod.default ?? traverseMod;

  let ast;
  try {
    ast = parser.parse(code, {
      sourceType: 'module',
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      errorRecovery: true,
      plugins: ['jsx', 'typescript', 'decorators-legacy', 'classProperties'],
    });
  } catch (e) {
    return { ok: false, reason: 'parse-error', parser: 'babel', error: String(e?.message ?? e), strings: [] };
  }

  const out = [];
  const CN_CALLS = new Set(['cn', 'clsx', 'classNames', 'twMerge', 'twJoin', 'cva']);

  const visit = traverse.default ? traverse.default : traverse;
  visit(ast, {
    JSXAttribute(p) {
      const name = p.node.name?.name;
      if (name !== 'className' && name !== 'class') return;
      const val = p.node.value;
      if (!val) return;

      if (val.type === 'StringLiteral') {
        out.push({
          kind: 'jsx-attr',
          attr: name,
          value: val.value,
          line: val.loc?.start.line ?? 0,
          col: val.loc?.start.column ?? 0,
          editable: true,
        });
        return;
      }
      if (val.type === 'JSXExpressionContainer') {
        walkExpr(val.expression, name, out, CN_CALLS, /* topEditable */ true);
      }
    },
  });

  return { ok: true, parser: 'babel', strings: out };
}

function walkExpr(expr, attrName, out, CN_CALLS, editable) {
  if (!expr) return;
  if (expr.type === 'StringLiteral') {
    out.push({
      kind: 'jsx-expr-string',
      attr: attrName,
      value: expr.value,
      line: expr.loc?.start.line ?? 0,
      col: expr.loc?.start.column ?? 0,
      editable,
    });
    return;
  }
  if (expr.type === 'TemplateLiteral') {
    for (const q of expr.quasis) {
      const v = q.value?.cooked ?? q.value?.raw ?? '';
      if (v.trim().length === 0) continue;
      out.push({
        kind: 'template-quasi',
        attr: attrName,
        value: v,
        line: q.loc?.start.line ?? 0,
        col: q.loc?.start.column ?? 0,
        editable, // safe — quasi is static text
      });
    }
    return;
  }
  if (expr.type === 'ConditionalExpression') {
    walkExpr(expr.consequent, attrName, out, CN_CALLS, editable);
    walkExpr(expr.alternate, attrName, out, CN_CALLS, editable);
    return;
  }
  if (expr.type === 'LogicalExpression') {
    // a && "foo bar" / a || "foo bar"
    walkExpr(expr.right, attrName, out, CN_CALLS, editable);
    walkExpr(expr.left, attrName, out, CN_CALLS, editable);
    return;
  }
  if (expr.type === 'CallExpression') {
    const calleeName =
      expr.callee?.type === 'Identifier' ? expr.callee.name :
      expr.callee?.type === 'MemberExpression' ? expr.callee.property?.name : null;
    if (calleeName && CN_CALLS.has(calleeName)) {
      for (const a of expr.arguments) walkExpr(a, attrName, out, CN_CALLS, editable);
      return;
    }
    // Unknown call — its return value is opaque; not editable
    return;
  }
  if (expr.type === 'ArrayExpression') {
    for (const el of expr.elements) walkExpr(el, attrName, out, CN_CALLS, editable);
    return;
  }
  if (expr.type === 'ObjectExpression') {
    // For `{ 'foo bar': cond }` — the *keys* are class strings, the values are bools.
    for (const p of expr.properties) {
      if (p.type !== 'ObjectProperty') continue;
      const k = p.key;
      if (k?.type === 'StringLiteral') {
        out.push({
          kind: 'cn-arg',
          attr: attrName,
          value: k.value,
          line: k.loc?.start.line ?? 0,
          col: k.loc?.start.column ?? 0,
          editable,
        });
      }
    }
    return;
  }
  // Identifiers, MemberExpressions, spread — opaque, skip.
}

// ──────────────────────────────────────────────────────────────────────────────
// Vue (best-effort — full Vue AST is v0.8 stretch)
//
// Strategy: isolate the <template> block, then regex-scan inside it for
// class="..." and :class="...".
async function extractVue(filePath, code) {
  // Strip <script> and <style> blocks
  let inTemplate = false;
  const lines = code.split('\n');
  const tplStartRe = /<template\b[^>]*>/i;
  const tplEndRe = /<\/template>/i;
  const scriptStartRe = /<script\b[^>]*>/i;
  const scriptEndRe = /<\/script>/i;
  const styleStartRe = /<style\b[^>]*>/i;
  const styleEndRe = /<\/style>/i;

  let mode = 'top';
  const tplLines = []; // { line, text }
  for (let i = 0; i < lines.length; i++) {
    const L = lines[i];
    if (mode === 'top') {
      if (tplStartRe.test(L)) { mode = 'template'; continue; }
      if (scriptStartRe.test(L)) { mode = 'script'; continue; }
      if (styleStartRe.test(L)) { mode = 'style'; continue; }
      continue;
    }
    if (mode === 'template') {
      if (tplEndRe.test(L)) { mode = 'top'; continue; }
      tplLines.push({ lineNo: i + 1, text: L });
      continue;
    }
    if (mode === 'script' && scriptEndRe.test(L)) { mode = 'top'; continue; }
    if (mode === 'style' && styleEndRe.test(L)) { mode = 'top'; continue; }
  }

  const out = [];
  const attrRe = /\b(class|:class|v-bind:class)\s*=\s*"([^"]*)"/g;
  for (const { lineNo, text } of tplLines) {
    let m;
    while ((m = attrRe.exec(text)) !== null) {
      const name = m[1];
      const raw = m[2];
      if (name === 'class') {
        out.push({ kind: 'vue-class', attr: 'class', value: raw, line: lineNo, col: m.index, editable: true });
      } else {
        // :class="[...]" or :class="{...}" — extract string literals inside
        const stringLits = [...raw.matchAll(/'([^']*)'|"([^"]*)"/g)].map((mm) => mm[1] ?? mm[2]);
        for (const s of stringLits) {
          out.push({ kind: 'vue-class', attr: ':class', value: s, line: lineNo, col: m.index, editable: true });
        }
      }
    }
  }
  return { ok: true, parser: 'vue-template-scan', strings: out };
}

// ──────────────────────────────────────────────────────────────────────────────
// Svelte (best-effort)
//
// Strategy: strip <script>...</script> and <style>...</style> blocks, scan the
// remainder for class="..." (also `class:foo={bool}` directives are flagged as
// not-editable since they're conditional state).
async function extractSvelte(filePath, code) {
  // Remove script + style blocks entirely
  const stripped = code
    .replace(/<script\b[\s\S]*?<\/script>/gi, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/<style\b[\s\S]*?<\/style>/gi, (m) => m.replace(/[^\n]/g, ' '));

  const out = [];
  const lines = stripped.split('\n');
  const classRe = /\bclass\s*=\s*"([^"]*)"/g;
  const classDirRe = /\bclass:([a-zA-Z0-9_-]+)\b/g;

  for (let i = 0; i < lines.length; i++) {
    const L = lines[i];
    let m;
    while ((m = classRe.exec(L)) !== null) {
      out.push({ kind: 'svelte-class', attr: 'class', value: m[1], line: i + 1, col: m.index, editable: true });
    }
    while ((m = classDirRe.exec(L)) !== null) {
      out.push({ kind: 'svelte-directive', attr: `class:${m[1]}`, value: m[1], line: i + 1, col: m.index, editable: false });
    }
  }
  return { ok: true, parser: 'svelte-markup-scan', strings: out };
}

// ──────────────────────────────────────────────────────────────────────────────

async function extractFile(rel) {
  const full = path.isAbsolute(rel) ? rel : path.join(cwd, rel);
  if (!existsSync(full)) return { file: rel, ok: false, reason: 'file-not-found', strings: [] };
  const code = readFileSync(full, 'utf8');
  const ext = path.extname(full).toLowerCase();
  let result;
  if (ext === '.tsx' || ext === '.jsx') result = await extractJSX(full, code);
  else if (ext === '.vue') result = await extractVue(full, code);
  else if (ext === '.svelte') result = await extractSvelte(full, code);
  else return { file: rel, ok: false, reason: 'unsupported-extension', ext, strings: [] };
  return { file: rel, ext, ...result };
}

const results = [];
for (const t of targets) {
  results.push(await extractFile(t));
}

if (pretty) {
  for (const r of results) {
    console.log(`\n${r.file}  [${r.ext}]  ${r.ok ? `via ${r.parser}` : `FAILED: ${r.reason}`}`);
    if (!r.ok && r.installHint) console.log(`  install hint: ${r.installHint}`);
    if (r.error) console.log(`  error: ${r.error}`);
    if (r.strings?.length) {
      console.log(`  ${r.strings.length} class string(s):`);
      for (const s of r.strings) {
        const ed = s.editable ? '✓' : '✗';
        const preview = (s.value ?? '').slice(0, 80).replace(/\n/g, '⏎');
        console.log(`    L${String(s.line).padStart(3)}:${String(s.col).padStart(3)}  ${ed}  ${s.kind.padEnd(18)}  "${preview}"`);
      }
    }
  }
  const total = results.reduce((s, r) => s + (r.strings?.length ?? 0), 0);
  console.log(`\n${total} string(s) across ${results.length} file(s).`);
} else {
  console.log(JSON.stringify({
    ok: results.every((r) => r.ok),
    totalFiles: results.length,
    totalStrings: results.reduce((s, r) => s + (r.strings?.length ?? 0), 0),
    results,
  }, null, 2));
}

process.exit(results.every((r) => r.ok || r.reason === 'parser-missing') ? 0 : 1);
