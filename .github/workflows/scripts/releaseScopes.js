const fs = require('node:fs');
const { parse } = require('yaml');

// Reads the central package→release-scope mapper (.github/release-scopes.yml): each scope is the
// set of packages one release flow versions together. Consumed by the release workflows (to
// resolve their changeset scoping) and by validateChangesets.js.
const readReleaseScopes = (scopesPath = '.github/release-scopes.yml') =>
    parse(fs.readFileSync(scopesPath, 'utf8'));

const resolveReleaseScope = (scopeName, scopesPath) => {
    const packages = readReleaseScopes(scopesPath)[scopeName];

    if (!Array.isArray(packages) || packages.length === 0) {
        throw new Error(`Unknown release scope: ${scopeName}`);
    }

    return packages;
};

module.exports = { readReleaseScopes, resolveReleaseScope };
