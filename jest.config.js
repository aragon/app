/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
    testEnvironment: 'jsdom',
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
    },
    transform: {
        '^.+\\.(svg|css)$': '<rootDir>/src/test/fileTransform.js',
        '^.+\\.m?[tj]sx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' }, isolatedModules: true }],
    },
    transformIgnorePatterns: ['node_modules/(?!(@aragon/gov-ui-kit|wagmi|@wagmi)/)'],
};

module.exports = config;
