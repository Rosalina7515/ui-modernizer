import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.mjs'],
    environment: 'node',
    coverage: {
      enabled: false, // enable via --coverage flag
      provider: 'v8',
      include: ['scripts/**/*.mjs'],
      exclude: ['scripts/_*.mjs'], // helpers — covered transitively
    },
    testTimeout: 10_000,
  },
});
