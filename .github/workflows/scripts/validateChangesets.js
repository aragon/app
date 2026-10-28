const fs = require('node:fs');
const path = require('node:path');
const { parse } = require('yaml');
const { readReleaseScopes } = require('./releaseScopes');

// A changeset bumping packages from two different release scopes breaks every scoped release
// flow: `changeset version --ignore` refuses mixed ignored/not-ignored changesets. Validated in
// CI (`pnpm validate:changesets`, part of `pnpm test`) so the mix surfaces on the PR that adds
// it, not when a release later fails to start.

// The `ignore` list of the changesets config has to stay empty for the same reason: changesets
// refuses `--ignore` flags next to it, so a non-empty list fails every release start. Packages
// outside every scope (`@aragon/docs`) are already ignored by every flow.
const readConfigIgnore = (changesetDir) => {
    const configPath = path.join(changesetDir, 'config.json');
    return fs.existsSync(configPath)
        ? (JSON.parse(fs.readFileSync(configPath, 'utf8')).ignore ?? [])
        : [];
};

// A changeset's frontmatter names the bumped packages, e.g. `"@aragon/app": minor`.
const parseChangesetPackages = (content) => {
    const frontmatter = content.match(/^---\n([\s\S]*?)\n---/);
    return frontmatter ? Object.keys(parse(frontmatter[1]) ?? {}) : [];
};

const validateChangesets = ({ changesetDir, scopesPath }) => {
    const scopes = readReleaseScopes(scopesPath);
    const scopeByPackage = new Map(
        Object.entries(scopes).flatMap(([scope, packages]) =>
            packages.map((name) => [name, scope]),
        ),
    );

    const changesets = fs
        .readdirSync(changesetDir)
        .filter((file) => file.endsWith('.md') && file !== 'README.md');

    const configErrors =
        readConfigIgnore(changesetDir).length > 0
            ? [
                  'config.json: "ignore" must stay empty — the release flows pass every package outside their scope as `changeset version --ignore`, which changesets refuses next to a config ignore list.',
              ]
            : [];

    const changesetErrors = changesets.flatMap((file) => {
        const packages = parseChangesetPackages(
            fs.readFileSync(path.join(changesetDir, file), 'utf8'),
        );

        const unknown = packages.filter((name) => !scopeByPackage.has(name));
        if (unknown.length > 0) {
            return `${file}: ${unknown.join(', ')} missing from ${scopesPath} — every released package must belong to a release scope.`;
        }

        const usedScopes = [
            ...new Set(packages.map((name) => scopeByPackage.get(name))),
        ];
        if (usedScopes.length > 1) {
            return `${file}: mixes release scopes (${usedScopes.join(', ')}) — split it into one changeset per scope, changesets refuses mixed changesets under --ignore.`;
        }

        // The scope's first package is the one whose version names the release and whose tag
        // deploys it. A changeset bumping only a package it bundles leaves that version untouched:
        // the release is cut, finalize finds the tag already taken and nothing deploys.
        if (usedScopes.length === 1) {
            const [lead] = scopes[usedScopes[0]];
            if (!packages.includes(lead)) {
                return `${file}: bumps ${packages.join(', ')} without ${lead} — the ${usedScopes[0]} release is versioned by ${lead}, add it to the changeset (its bump is what ships the change).`;
            }
        }

        return [];
    });

    return [...configErrors, ...changesetErrors];
};

module.exports = { parseChangesetPackages, validateChangesets };

// Standalone runner
if (require.main === module) {
    const errors = validateChangesets({
        changesetDir: '.changeset',
        scopesPath: '.github/release-scopes.yml',
    });

    if (errors.length > 0) {
        for (const error of errors) {
            console.error(error);
        }
        process.exit(1);
    }
    console.log('Changesets are valid: no cross-scope mixes.');
}
