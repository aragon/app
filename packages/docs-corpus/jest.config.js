const {
    createNodeConfig,
    createTsJestTransform,
} = require('../../jest.config.base');

/** @type {import('@jest/types').Config.InitialOptions} */
const config = createNodeConfig({
    // The corpus ladder runs against the real repository and the environment of a build.
    coveragePathIgnorePatterns: ['src/resolveCorpus.ts', 'src/test/'],
});

// The markdown parser the loader reads links with (mdast/micromark and their leaf helpers) ships
// ESM only: compile it to CJS for jest. The optional `.pnpm/<pkg>/node_modules/` segment matches
// pnpm's nested store layout.
config.transform = createTsJestTransform({ allowJs: true });
config.transformIgnorePatterns = [
    'node_modules/(?!(?:\\.pnpm/[^/]+/node_modules/)?(mdast-util-[^/]*|micromark[^/]*|unist-util-[^/]*|decode-named-character-reference|character-entities[^/]*|devlop)(/|$))',
];

module.exports = config;
