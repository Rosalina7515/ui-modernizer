import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { loadConfig, DEFAULTS } from '../scripts/load-config.mjs';

let tmp;

beforeEach(() => {
  tmp = path.join(os.tmpdir(), `uim-test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  mkdirSync(tmp, { recursive: true });
});

afterEach(() => {
  rmSync(tmp, { recursive: true, force: true });
});

describe('loadConfig', () => {
  it('returns defaults when no config file exists', () => {
    const r = loadConfig({ root: tmp });
    expect(r.ok).toBe(true);
    expect(r.configFile).toBeNull();
    expect(r.config.maxFiles).toBe(DEFAULTS.maxFiles);
    expect(r.config.strict).toBe(false);
  });

  it('merges user config with defaults', () => {
    writeFileSync(path.join(tmp, '.ui-modernizer.json'), JSON.stringify({
      profile: 'linear',
      maxFiles: 50,
    }));
    const r = loadConfig({ root: tmp });
    expect(r.ok).toBe(true);
    expect(r.config.profile).toBe('linear');
    expect(r.config.maxFiles).toBe(50);
    expect(r.config.strict).toBe(false); // default preserved
  });

  it('additive ignore: user ignores ADD to defaults', () => {
    writeFileSync(path.join(tmp, '.ui-modernizer.json'), JSON.stringify({
      ignore: ['src/legacy/**'],
    }));
    const r = loadConfig({ root: tmp });
    expect(r.ok).toBe(true);
    expect(r.config.ignore).toContain('src/legacy/**');
    expect(r.config.ignore).toContain('**/node_modules/**'); // default still present
    expect(r.config.ignore.length).toBeGreaterThanOrEqual(DEFAULTS.ignore.length + 1);
  });

  it('rejects invalid JSON with UMD-010', () => {
    writeFileSync(path.join(tmp, '.ui-modernizer.json'), '{invalid json');
    const r = loadConfig({ root: tmp });
    expect(r.ok).toBe(false);
    expect(r.errors[0].code).toBe('UMD-010');
  });

  it('rejects bad profile with UMD-012 + did-you-mean', () => {
    writeFileSync(path.join(tmp, '.ui-modernizer.json'), JSON.stringify({
      profile: 'lineer',
    }));
    const r = loadConfig({ root: tmp });
    expect(r.ok).toBe(false);
    const err = r.errors.find((e) => e.code === 'UMD-012');
    expect(err).toBeDefined();
    expect(err.details.didYouMean).toBe('linear');
  });

  it('rejects bad brand.classPrefix with UMD-011 + suggestion', () => {
    writeFileSync(path.join(tmp, '.ui-modernizer.json'), JSON.stringify({
      brand: { classPrefix: 'brnd' },
    }));
    const r = loadConfig({ root: tmp });
    expect(r.ok).toBe(false);
    const err = r.errors.find((e) => e.code === 'UMD-011' && e.details.field === 'brand.classPrefix');
    expect(err).toBeDefined();
    expect(err.details.didYouMean).toBe('brand');
  });

  it('does not crash on null brand override (regression test)', () => {
    writeFileSync(path.join(tmp, '.ui-modernizer.json'), JSON.stringify({
      brand: { classPrefix: 'magenta' },
    }));
    expect(() => loadConfig({ root: tmp })).not.toThrow();
  });
});
