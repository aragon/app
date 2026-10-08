const {
    createNodeConfig,
    createTsJestTransform,
} = require('../../jest.config.base');

/** @type {import('@jest/types').Config.InitialOptions} */
const config = createNodeConfig({
    coveragePathIgnorePatterns: [
        // Rendered by Next, not by jest.
        'src/app/',
        'src/lib/source.ts',
        // Build-time CLIs: they run against the real knowledge base and the build output.
        'src/content/prepareContent.ts',
        'src/content/checkOutput.ts',
    ],
});

// The corpus loader ships as TypeScript source.
config.moduleNameMapper = {
    '^@aragon/docs-corpus$':
        '<rootDir>/../../packages/docs-corpus/src/index.ts',
};

// The knowledge base checkout and the generated content are not part of the module tree.
config.modulePathIgnorePatterns = [
    '<rootDir>/.docs-corpus/',
    '<rootDir>/.next/',
    '<rootDir>/content/',
    '<rootDir>/out/',
];

// The markdown parser the corpus loader reads links with (mdast/micromark and their leaf helpers)
// ships ESM only: compile it to CJS for jest. The optional `.pnpm/<pkg>/node_modules/` segment
// matches pnpm's nested store layout.
config.transform = createTsJestTransform({ allowJs: true });
config.transformIgnorePatterns = [
    'node_modules/(?!(?:\\.pnpm/[^/]+/node_modules/)?(mdast-util-[^/]*|micromark[^/]*|unist-util-[^/]*|decode-named-character-reference|character-entities[^/]*|devlop)(/|$))',
];

module.exports = config;
