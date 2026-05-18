import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { parseArgs, readPackageVersion, isMainScript } from '../scripts/_cli.mjs';

describe('parseArgs', () => {
  let originalExit;
  let logOutput;

  beforeEach(() => {
    originalExit = process.exit;
    logOutput = [];
    vi.spyOn(console, 'log').mockImplementation((...args) => logOutput.push(args.join(' ')));
  });
  afterEach(() => {
    vi.restoreAllMocks();
    process.exit = originalExit;
  });

  it('parses --version and signals exit', () => {
    const r = parseArgs(['--version'], { command: 'x' });
    expect(r.exit).toBe(true);
    expect(logOutput.join(' ')).toMatch(/\d+\.\d+\.\d+/);
  });

  it('parses -v as version', () => {
    const r = parseArgs(['-v'], { command: 'x' });
    expect(r.exit).toBe(true);
  });

  it('parses --help and signals exit', () => {
    const r = parseArgs(['--help'], { command: 'x', usage: 'Usage: x' });
    expect(r.exit).toBe(true);
    expect(logOutput.join('\n')).toContain('Usage: x');
  });

  it('separates flags from positional args', () => {
    const r = parseArgs(['--pretty', 'foo.tsx', 'bar.tsx'], {});
    expect(r.flags.pretty).toBe(true);
    expect(r.positional).toEqual(['foo.tsx', 'bar.tsx']);
    expect(r.exit).toBe(false);
  });

  it('parses --key=value syntax', () => {
    const r = parseArgs(['--routes=/a,/b'], {});
    expect(r.flags.routes).toBe('/a,/b');
  });

  it('parses --key value when declared as option taking a value', () => {
    const r = parseArgs(['--routes', '/a,/b'], {
      options: [['--routes <list>', 'routes']],
    });
    expect(r.flags.routes).toBe('/a,/b');
  });
});

describe('readPackageVersion', () => {
  it('returns a valid semver string', () => {
    const v = readPackageVersion();
    expect(v).toMatch(/^\d+\.\d+\.\d+/);
  });
});

describe('isMainScript', () => {
  it('returns boolean', () => {
    expect(typeof isMainScript(import.meta.url)).toBe('boolean');
  });
});
