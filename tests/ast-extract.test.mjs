import { describe, it, expect } from 'vitest';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { extractFile } from '../scripts/ast-extract.mjs';

const tmp = path.join(os.tmpdir(), `uim-ast-${Date.now()}`);
mkdirSync(tmp, { recursive: true });

function write(name, content) {
  const full = path.join(tmp, name);
  writeFileSync(full, content);
  return full;
}

describe('extractFile (graceful degradation)', () => {
  it('returns parser-missing for unsupported extension', async () => {
    const f = write('foo.txt', 'hello');
    const r = await extractFile(f);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('unsupported-extension');
  });

  it('returns file-not-found for missing file', async () => {
    const r = await extractFile(path.join(tmp, 'does-not-exist.tsx'));
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('file-not-found');
  });

  it('extracts class strings from Vue template (best-effort scanner)', async () => {
    const f = write('demo.vue', `
<template>
  <div class="bg-gray-100 p-4">
    <button :class="['rounded', isActive && 'bg-blue-500']">Go</button>
  </div>
</template>
<script setup>
const isActive = true;
const opaqueClasses = 'should-not-be-extracted';
</script>
`);
    const r = await extractFile(f);
    expect(r.ok).toBe(true);
    const values = r.strings.map((s) => s.value);
    expect(values).toContain('bg-gray-100 p-4');
    expect(values).toContain('rounded');
    expect(values).toContain('bg-blue-500');
    // Script content must be ignored
    expect(values).not.toContain('should-not-be-extracted');
  });

  it('extracts class strings from Svelte markup', async () => {
    const f = write('demo.svelte', `
<script>
  let active = true;
  const ignored = 'never extracted';
</script>

<div class="bg-gray-100 p-4">
  <button class:active>Go</button>
</div>

<style>
  .raw-css { color: red; }
</style>
`);
    const r = await extractFile(f);
    expect(r.ok).toBe(true);
    const editable = r.strings.filter((s) => s.editable);
    const directives = r.strings.filter((s) => !s.editable);
    expect(editable.map((s) => s.value)).toContain('bg-gray-100 p-4');
    // class:active is a directive — present but not editable
    expect(directives.length).toBeGreaterThan(0);
  });
});

// Clean up after all tests complete
import { afterAll } from 'vitest';
afterAll(() => rmSync(tmp, { recursive: true, force: true }));
