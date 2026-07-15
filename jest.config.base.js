// Shared jest defaults for all workspaces: spread `baseConfig` into the workspace config and
// override what differs (testEnvironment, transforms, setup files, …).
const baseConfig = {
    testPathIgnorePatterns: ['/node_modules/'],
    maxWorkers: '70%',
};

// ts-jest transform shared by node-environment workspaces; pass tsconfig overrides when needed.
const createTsJestTransform = (tsconfig = {}) => ({
    '^.+\\.m?[tj]sx?$': [
        'ts-jest',
        {
            tsconfig: {
                isolatedModules: true,
                module: 'CommonJS',
                target: 'ES2022',
                ...tsconfig,
            },
        },
    ],
});

// Full config for node-environment workspaces (services, contracts); jsdom workspaces (widgets)
// spread `baseConfig` directly instead.
const createNodeConfig = ({ coveragePathIgnorePatterns = [] } = {}) => ({
    ...baseConfig,
    testEnvironment: 'node',
    collectCoverageFrom: ['./src/**/*.ts'],
    coveragePathIgnorePatterns: [
        '.d.ts',
        'index.ts',
        ...coveragePathIgnorePatterns,
    ],
    transform: createTsJestTransform(),
});

module.exports = { baseConfig, createTsJestTransform, createNodeConfig };
