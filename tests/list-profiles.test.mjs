import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.resolve(HERE, '..', 'scripts', 'list-profiles.mjs');

function runJSON() {
  const out = execFileSync('node', [SCRIPT], { encoding: 'utf8' });
  return JSON.parse(out);
}

describe('list-profiles', () => {
  it('runs successfully and returns envelope', () => {
    const r = runJSON();
    expect(r.ok).toBe(true);
    expect(r.command).toBe('list-profiles');
    expect(r.version).toMatch(/\d+\.\d+\.\d+/);
  });

  it('lists at least 7 built-in profiles', () => {
    const r = runJSON();
    expect(r.payload.count).toBeGreaterThanOrEqual(7);
    expect(r.payload.profiles.length).toBe(r.payload.count);
  });

  it('every profile has slug, displayName, vibe, darkFirst', () => {
    const r = runJSON();
    for (const p of r.payload.profiles) {
      expect(p.slug).toMatch(/^[a-z0-9-]+$/);
      expect(typeof p.displayName).toBe('string');
      expect(typeof p.vibe).toBe('string');
      expect(typeof p.darkFirst).toBe('boolean');
    }
  });

  it('profiles are sorted by slug', () => {
    const r = runJSON();
    const slugs = r.payload.profiles.map((p) => p.slug);
    const sorted = [...slugs].sort();
    expect(slugs).toEqual(sorted);
  });

  it('includes the 7 canonical built-ins', () => {
    const r = runJSON();
    const slugs = r.payload.profiles.map((p) => p.slug);
    for (const expected of ['linear', 'vercel', 'stripe', 'shadcn', 'notion', 'raycast', 'apple']) {
      expect(slugs).toContain(expected);
    }
  });
});
