import { describe, it, expect } from 'vitest';
import { runChecks } from '../scripts/health.mjs';

describe('health', () => {
  it('runs all checks and returns an array', async () => {
    const checks = await runChecks();
    expect(Array.isArray(checks)).toBe(true);
    expect(checks.length).toBeGreaterThanOrEqual(8);
  });

  it('every check has name, ok, detail', async () => {
    const checks = await runChecks();
    for (const c of checks) {
      expect(typeof c.name).toBe('string');
      expect(['boolean', 'string']).toContain(typeof c.ok); // true | false | 'warn'
      expect(typeof c.detail).toBe('string');
    }
  });

  it('package.json version check passes (we are inside the project)', async () => {
    const checks = await runChecks();
    const v = checks.find((c) => c.name === 'package.json version');
    expect(v.ok).toBe(true);
    expect(v.detail).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('skill structure check passes', async () => {
    const checks = await runChecks();
    const s = checks.find((c) => c.name === 'skill structure');
    expect(s.ok).toBe(true);
  });

  it('finds at least 7 built-in profiles', async () => {
    const checks = await runChecks();
    const p = checks.find((c) => c.name === 'style profiles');
    expect(p.ok).toBe(true);
    expect(p.detail).toMatch(/\d+ profiles loaded/);
  });
});
