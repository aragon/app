const { createNodeConfig } = require('../../jest.config.base');

/** @type {import('@jest/types').Config.InitialOptions} */
const config = createNodeConfig({ coveragePathIgnorePatterns: ['src/dev.ts'] });

module.exports = config;
