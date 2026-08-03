const { baseConfig, createTsJestTransform } = require('../../jest.config.base');

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
    ...baseConfig,
    // jsdom augmented with Node's WHATWG globals (fetch/Response/streams) that assistant-stream and
    // the AI SDK need at module load.
    testEnvironment: '<rootDir>/src/test/jsdomWithNode.js',
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
    // The assistant-ui packages and the react-markdown ecosystem (unified/remark/micromark/
    // mdast/hast/unist/vfile and their leaf helpers) ship ESM only, so they are transformed too.
    transformIgnorePatterns: [
        'node_modules/(?!(?:\\.pnpm/[^/]+/node_modules/)?(@aragon/gov-ui-kit|wagmi|@wagmi|use-sync-external-store|react-merge-refs|ai|@ai-sdk|@workflow|swr|throttleit|@vercel/blob|@vercel/oidc|jose|@assistant-ui|assistant-stream|assistant-cloud|safe-content-frame|@modelcontextprotocol|pkce-challenge|secure-json-parse|nanoid|react-markdown|unified|bail|is-plain-obj|trough|vfile[^/]*|unist-util-[^/]*|mdast-util-[^/]*|micromark[^/]*|decode-named-character-reference|character-entities[^/]*|property-information|hast-util-[^/]*|space-separated-tokens|comma-separated-tokens|html-url-attributes|trim-lines|devlop|estree-util-[^/]*|zwitch|longest-streak|ccount|markdown-table|escape-string-regexp|remark-[^/]*|rehype-[^/]*|@ungap/structured-clone)(/|$))',
    ],
};

module.exports = config;
