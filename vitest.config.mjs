import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Match both top-level (tests/foo.test.mjs) and nested (tests/sub/foo.test.mjs).
    // The default vitest include also catches these, but stating explicitly is safer.
    include: ['tests/*.test.mjs', 'tests/**/*.test.mjs'],
    environment: 'node',
    testTimeout: 10_000,
    // Coverage is off in the default config to avoid forcing @vitest/coverage-v8
    // as a dependency. Run with `vitest run --coverage --coverage.provider=v8`
    // after `npm install -D @vitest/coverage-v8` if you want it.
  },
});
