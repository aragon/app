const { baseConfig, createTsJestTransform } = require('../../jest.config.base');

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
    ...baseConfig,
    testEnvironment: 'jsdom',
    collectCoverageFrom: ['./src/**/*.{ts,tsx}'],
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    coveragePathIgnorePatterns: ['.d.ts', '.api.ts', 'index.ts', '.stories.tsx', './src/core/test/*'],
    setupFilesAfterEnv: ['<rootDir>/src/core/test/setup.ts'],
    globalSetup: '<rootDir>/src/core/test/globalSetup.ts',
    transform: {
        '^.+\\.svg$': '<rootDir>/src/core/test/svgTransform.js',
        // ES2020 mirrors this package's tsconfig target (the published bundle's browser floor),
        // not the ES2022 default of the shared transform.
        ...createTsJestTransform({ target: 'ES2020', allowJs: true }),
    },
    // Allow transforming specific ESM deps even under pnpm's nested layout
    // e.g. node_modules/.pnpm/<pkg>@<ver>/node_modules/<pkg>/...
    transformIgnorePatterns: [
        // Transform only wagmi-related ESM; leave viem/abitype in CJS to avoid downlevel issues.
        // htmlparser2 and its dom* / entities helpers are ESM-only deps of sanitize-html.
        'node_modules/(?!(?:\\.pnpm/[^/]+/node_modules/)?(wagmi|@wagmi|use-sync-external-store|react-merge-refs|htmlparser2|domhandler|domutils|dom-serializer|domelementtype|entities)(/|$))',
    ],
};

module.exports = config;
