/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
    testEnvironment: 'jsdom',
    collectCoverageFrom: ['./src/**/*.{ts,tsx}'],
    coveragePathIgnorePatterns: ['.d.ts', '.api.ts', 'index.ts'],
    setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
    transform: {
        '^.+\\.svg$': '<rootDir>/src/test/svgTransform.js',
        '^.+\\.m?[tj]sx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }],
    },
};

module.exports = config;
