import { configDefaults, defineConfig } from 'vitest/config';
import baseConfig from './vitest.config';

/**
 * Runs only the contract suite in `test/contract`, which talks to a deployed
 * `aragon-indexer` and is excluded from the default `pnpm test` run. Used by
 * `pnpm test:contract`; coverage is off because the suite exercises the live
 * endpoint, not the library.
 */
export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    include: ['test/contract/**/*.test.ts'],
    exclude: configDefaults.exclude,
    coverage: { enabled: false },
  },
});
