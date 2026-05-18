/**
 * Central error code registry (v0.9+).
 *
 * Every script that fails should reach for one of these codes. Adding a code:
 *   1. Pick the next unused number in the relevant family (010=config, 020=backup, etc.).
 *   2. Add an entry below with a one-line title and a multi-line remedy.
 *   3. Document it in references/error-codes.md.
 *
 * Programmatic use:
 *   import { ERR, makeError } from './_errors.mjs';
 *   return fail(makeError(ERR.PARSER_MISSING, { detail: 'tried .tsx file' }));
 */

export const ERRORS = {
  // ── Detection (000–009) ────────────────────────────────────────────────
  'UMD-001': {
    title: 'Tailwind CSS not detected',
    remedy: 'Add `tailwindcss` to your dependencies. v3 or v4 both supported.\n  npm install -D tailwindcss',
    docs: 'references/tailwind-v4.md',
  },
  'UMD-002': {
    title: 'Unsupported runtime',
    remedy: 'ui-modernizer supports React, Vue, and Svelte. Add one of: `react`, `vue`, or `svelte` to your dependencies.',
    docs: 'README.md',
  },
  'UMD-003': {
    title: 'Meta-framework missing',
    remedy: 'For React, install Next.js. For Vue, install Nuxt or Vite. For Svelte, install SvelteKit or Vite.',
    docs: 'references/frameworks/vue.md',
  },

  // ── Config (010–019) ───────────────────────────────────────────────────
  'UMD-010': {
    title: '.ui-modernizer.json parse error',
    remedy: 'The config file has invalid JSON. Validate with `jq . .ui-modernizer.json` or paste into jsonlint.com.',
    docs: 'references/config-file.md',
  },
  'UMD-011': {
    title: 'Config validation failed',
    remedy: 'One or more fields have invalid values. See the error details for which fields; the schema is in references/config-file.md.',
    docs: 'references/config-file.md',
  },
  'UMD-012': {
    title: 'Unknown profile name',
    remedy: 'Profile must be one of the built-ins (linear / vercel / stripe / shadcn / notion / raycast / apple) or a path to a local .md file. See "Did you mean?" in the error details.',
    docs: 'references/profile-pluggability.md',
  },

  // ── Backup / rollback (020–029) ────────────────────────────────────────
  'UMD-020': {
    title: 'Backup directory missing',
    remedy: 'No `.ui-modernizer-backup/` directory found. The modernization run was never started, or it was already cleaned up.',
    docs: null,
  },
  'UMD-021': {
    title: 'Backup file not found in manifest',
    remedy: 'One or more files listed in the backup manifest are missing on disk. Backup may be corrupted; check `.ui-modernizer-backup/<stamp>/files/`.',
    docs: null,
  },

  // ── Visual regression (030–039) ────────────────────────────────────────
  'UMD-030': {
    title: 'Playwright not installed',
    remedy: 'Optional dependency. To enable visual regression / screenshots:\n  npm install -D playwright\n  npx playwright install chromium',
    docs: 'references/visual-regression.md',
  },
  'UMD-031': {
    title: 'Dev server failed to start',
    remedy: 'ui-modernizer tried to run your project but `npm run dev` did not respond within 90s. Check the dev log at `.ui-modernizer/snapshots/<phase>/dev-server.log` for the underlying error.',
    docs: 'references/visual-regression.md',
  },
  'UMD-032': {
    title: 'Snapshot pair missing',
    remedy: 'visual-diff needs both a "before" and "after" snapshot for each route. One side is missing — re-run `visual-snapshot.mjs` for both phases.',
    docs: 'references/visual-regression.md',
  },

  // ── AST safety (040–049) ───────────────────────────────────────────────
  'UMD-040': {
    title: '@babel/parser not installed',
    remedy: 'Optional dependency for AST safety. To install:\n  npm install -D @babel/parser @babel/traverse\nWithout it, the modernizer falls back to regex (less safe but still works).',
    docs: 'references/ast-safety.md',
  },
  'UMD-041': {
    title: 'Source file parse error',
    remedy: 'The file contains a syntax error or uses a JS extension the parser does not recognize. Check the file compiles in your normal build first.',
    docs: 'references/ast-safety.md',
  },

  // ── Profile system (050–059) ───────────────────────────────────────────
  'UMD-050': {
    title: 'Profile validation failed',
    remedy: 'See error details for the specific missing or invalid frontmatter / sections. Refer to the profile format spec.',
    docs: 'references/style-references/_PROFILE_FORMAT.md',
  },
  'UMD-051': {
    title: 'Profile missing required frontmatter',
    remedy: 'Profile YAML frontmatter must include: name, displayName, version, vibe, darkFirst, recommendedFonts, authors.',
    docs: 'references/style-references/_PROFILE_FORMAT.md',
  },
  'UMD-052': {
    title: 'Profile name does not match filename',
    remedy: 'The `name` field in frontmatter must equal the filename (without `.md`). Rename one to match the other.',
    docs: 'references/style-references/_PROFILE_FORMAT.md',
  },

  // ── Component substitution (060–069) ───────────────────────────────────
  'UMD-060': {
    title: 'shadcn components.json missing',
    remedy: 'Component substitution requires shadcn to be initialized. Run `npx shadcn@latest init` in your project (interactive), then re-run modernization.',
    docs: 'references/component-substitution.md',
  },
  'UMD-061': {
    title: 'shadcn install failed',
    remedy: 'The `npx shadcn add` command exited non-zero. Common causes: no network, version conflict, missing tsconfig path aliases. Check the command output and re-run manually.',
    docs: 'references/component-substitution.md',
  },
};

export const ERR = Object.fromEntries(Object.keys(ERRORS).map((k) => [k.replace('UMD-', 'E_').replace(/-/g, '_'), k]));
// Now ERR.E_001 === 'UMD-001', ERR.E_040 === 'UMD-040', etc.
// (Used so call sites read naturally without needing to memorize numbers.)

/**
 * Build a structured error object suitable for the unified response shape.
 *
 * @param {string} code     One of the keys in ERRORS (e.g. 'UMD-010')
 * @param {object} details  Free-form context (file path, line, etc.)
 */
export function makeError(code, details = {}) {
  const meta = ERRORS[code];
  if (!meta) {
    return { code: 'UMD-999', title: `Unknown error code: ${code}`, remedy: 'This is a bug — please file an issue.', details };
  }
  return {
    code,
    title: meta.title,
    remedy: meta.remedy,
    docs: meta.docs,
    details,
  };
}

/**
 * "Did you mean?" suggester. Returns the closest match from a list by simple
 * Levenshtein distance, or null if nothing is close enough.
 */
export function didYouMean(input, candidates, maxDistance = 3) {
  if (!input || !candidates?.length) return null;
  let best = null;
  let bestDist = Infinity;
  for (const c of candidates) {
    const d = levenshtein(String(input).toLowerCase(), String(c).toLowerCase());
    if (d < bestDist) { bestDist = d; best = c; }
  }
  return bestDist <= maxDistance ? { suggestion: best, distance: bestDist } : null;
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev = new Array(b.length + 1);
  const curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }
  return prev[b.length];
}
