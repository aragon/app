const { baseConfig, createTsJestTransform } = require('../../jest.config.base');

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
    ...baseConfig,
    testEnvironment: 'jsdom',
    collectCoverageFrom: ['./src/**/*.{ts,tsx}'],
    coveragePathIgnorePatterns: ['.d.ts', '.api.ts', 'index.ts', '/src/test'],
    setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
    transform: createTsJestTransform({
        target: 'ES2020',
        allowJs: true,
        jsx: 'react-jsx',
    }),
    // Allow transforming specific ESM deps even under pnpm's nested layout
    // e.g. node_modules/.pnpm/<pkg>@<ver>/node_modules/<pkg>/...
    transformIgnorePatterns: [
        'node_modules/(?!(?:\\.pnpm/[^/]+/node_modules/)?(@aragon/gov-ui-kit|wagmi|@wagmi|use-sync-external-store|react-merge-refs|ai|@ai-sdk|@workflow|swr|throttleit|react-dropzone|file-selector|@vercel/blob|@vercel/oidc|jose)(/|$))',
    ],
};

module.exports = config;
