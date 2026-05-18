import { describe, it, expect } from 'vitest';
import { ERRORS, makeError, didYouMean } from '../scripts/_errors.mjs';

describe('error registry', () => {
  it('every code has a title and remedy', () => {
    for (const [code, meta] of Object.entries(ERRORS)) {
      expect(code).toMatch(/^UMD-\d{3}$/);
      expect(meta.title.length).toBeGreaterThan(5);
      expect(meta.remedy.length).toBeGreaterThan(10);
    }
  });

  it('makeError returns structured object for known code', () => {
    const e = makeError('UMD-001', { detail: 'test' });
    expect(e.code).toBe('UMD-001');
    expect(e.title).toBe('Tailwind CSS not detected');
    expect(e.details.detail).toBe('test');
  });

  it('makeError handles unknown code gracefully', () => {
    const e = makeError('UMD-XYZ');
    expect(e.code).toBe('UMD-999');
    expect(e.title).toContain('Unknown');
  });
});

describe('didYouMean', () => {
  it('finds close matches', () => {
    const r = didYouMean('lineer', ['linear', 'vercel', 'stripe']);
    expect(r?.suggestion).toBe('linear');
    expect(r?.distance).toBeLessThanOrEqual(2);
  });

  it('returns null when nothing is close', () => {
    expect(didYouMean('xyzzy', ['linear', 'vercel'])).toBeNull();
  });

  it('handles empty inputs', () => {
    expect(didYouMean('', ['a'])).toBeNull();
    expect(didYouMean('a', [])).toBeNull();
  });

  it('is case-insensitive', () => {
    expect(didYouMean('LINEAR', ['linear'])?.suggestion).toBe('linear');
  });
});
