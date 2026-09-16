import { resolve } from 'node:path';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
    // The contract suite needs a live indexer; `pnpm test:contract` runs it
    // through `vitest.contract.config.ts` so the default run stays offline.
    exclude: [...configDefaults.exclude, 'test/contract/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        // Pure type-only modules — no executable JS is emitted, so
        // including them in coverage just produces phantom uncovered
        // lines.
        'src/**/index.ts',
        'src/domain/member-profile/MemberProfileStore.ts',
        'src/domain/primitives/units/EVMUnit.ts',
        'src/domain/member/MemberStore.ts',
        'src/infrastructure/controllers/AragonController/maps/domain/PageMap.ts',
      ],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
});
