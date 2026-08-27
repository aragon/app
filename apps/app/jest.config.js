const { baseConfig, createTsJestTransform } = require('../../jest.config.base');

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
    ...baseConfig,
    testEnvironment: 'jsdom',
    testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
    collectCoverageFrom: ['./src/**/*.{ts,tsx}'],
    coveragePathIgnorePatterns: [
        '.d.ts',
        '.api.ts',
        'index.ts',
        '/src/app',
        '/src/test',
        '/src/shared/lib',
        '/testUtils/',
    ],
    setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
    globalSetup: '<rootDir>/src/test/globalSetup.ts',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        // The design-sync bundle build (.design-sync/build-css.mjs) drops
        // next/* shims into src/node_modules, which nearest-node_modules
        // resolution would pick over the real `next` package for anything
        // under src/. Pin next imports to the app's real package so tests are
        // unaffected by the shims' presence.
        '^next$': '<rootDir>/node_modules/next',
        '^next/navigation-original$': '<rootDir>/node_modules/next/navigation',
        '^next/(.*)$': '<rootDir>/node_modules/next/$1',
        // Package only exposes a `module` field (no `main`/`exports`), which Jest's
        // Node-style resolver doesn't understand unlike bundlers (webpack/Next.js).
        '^@plausible-analytics/tracker$':
            '<rootDir>/node_modules/@plausible-analytics/tracker/plausible.js',
    },
    transform: {
        '^.+\\.(svg|jpg|jpeg|css|mp4|png|webp)$':
            '<rootDir>/src/test/fileTransform.js',
        ...createTsJestTransform({
            target: 'ES2020',
            allowJs: true,
            jsx: 'react-jsx',
        }),
    },
    // Allow transforming specific ESM deps even under pnpm's nested layout
    // e.g. node_modules/.pnpm/<pkg>@<ver>/node_modules/<pkg>/...
    transformIgnorePatterns: [
        // Transform wagmi-related ESM and gov-ui-kit; avoid downleveling viem/abitype unless needed
        'node_modules/(?!(?:\\.pnpm/[^/]+/node_modules/)?(@aragon/gov-ui-kit|wagmi|@wagmi|use-sync-external-store|react-merge-refs|@plausible-analytics/tracker)(/|$))',
    ],
};

module.exports = config;
