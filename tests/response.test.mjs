import { describe, it, expect } from 'vitest';
import { success, failure } from '../scripts/_response.mjs';

describe('success / failure envelope', () => {
  it('success returns ok:true with payload', () => {
    const r = success('test-cmd', { foo: 42 });
    expect(r.ok).toBe(true);
    expect(r.command).toBe('test-cmd');
    expect(r.version).toMatch(/\d+\.\d+\.\d+/);
    expect(r.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(r.payload).toEqual({ foo: 42 });
    expect(r.errors).toBeUndefined();
  });

  it('failure returns ok:false with errors array', () => {
    const r = failure('test-cmd', [{ code: 'UMD-001', title: 'x' }]);
    expect(r.ok).toBe(false);
    expect(r.command).toBe('test-cmd');
    expect(Array.isArray(r.errors)).toBe(true);
    expect(r.errors[0].code).toBe('UMD-001');
    expect(r.payload).toBeUndefined();
  });

  it('failure normalizes single error into array', () => {
    const r = failure('test-cmd', { code: 'UMD-001', title: 'x' });
    expect(Array.isArray(r.errors)).toBe(true);
    expect(r.errors.length).toBe(1);
  });

  it('warnings appear only when non-empty', () => {
    const r1 = success('t', {}, []);
    expect(r1.warnings).toBeUndefined();
    const r2 = success('t', {}, [{ message: 'hi' }]);
    expect(r2.warnings.length).toBe(1);
  });

  it('all envelopes have a stable timestamp shape', () => {
    const r = success('t', null);
    const parsed = new Date(r.timestamp);
    expect(parsed.getTime()).not.toBeNaN();
  });
});
