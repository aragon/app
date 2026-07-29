'use strict';
const {
    createNodeConfig,
    createTsJestTransform,
} = require('../../jest.config.base');

/** @type {import('@jest/types').Config.InitialOptions} */
const config = createNodeConfig({
    coveragePathIgnorePatterns: ['src/dev.ts', 'src/test/'],
});

// Silences the observability stdout/stderr transport so test output stays readable.
config.setupFilesAfterEnv = ['<rootDir>/src/test/setup.ts'];

// Resolve contracts to TypeScript source so jest does not depend on a prior `dist/` build.
config.moduleNameMapper = {
    '^@aragon/assistant-contracts$':
        '<rootDir>/../../packages/assistant-contracts/src/index.ts',
};

// ai (+ @ai-sdk) and file-type (+ its tokenizer graph) ship ESM only: compile them to CJS for
// jest. The optional `.pnpm/<pkg>/node_modules/` segment matches pnpm's nested store layout.
config.transform = createTsJestTransform({ allowJs: true });
config.transformIgnorePatterns = [
    'node_modules/(?!(?:\\.pnpm/[^/]+/node_modules/)?(ai|@ai-sdk|@workflow|file-type|strtok3|token-types|uint8array-extras|@tokenizer|@borewit|peek-readable)(/|$))',
];

module.exports = config;
