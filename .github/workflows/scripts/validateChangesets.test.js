const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const { validateChangesets } = require('./validateChangesets');

const SCOPES_YAML =
    'app:\n  - "@aragon/app"\nassistant:\n  - "@aragon/assistant"\n  - "@aragon/assistant-chat"\n';

const createFixture = (changesets) => {
    const directory = fs.mkdtempSync(
        path.join(os.tmpdir(), 'validate-changesets-'),
    );
    const changesetDir = path.join(directory, '.changeset');
    fs.mkdirSync(changesetDir);

    const scopesPath = path.join(directory, 'release-scopes.yml');
    fs.writeFileSync(scopesPath, SCOPES_YAML);
    fs.writeFileSync(path.join(changesetDir, 'README.md'), '# changesets');
    for (const [file, packages] of Object.entries(changesets)) {
        const frontmatter = packages
            .map((name) => `"${name}": patch`)
            .join('\n');
        fs.writeFileSync(
            path.join(changesetDir, file),
            `---\n${frontmatter}\n---\n\nSome change\n`,
        );
    }

    return { directory, changesetDir, scopesPath };
};

test('accepts changesets that stay within one release scope', () => {
    const { directory, changesetDir, scopesPath } = createFixture({
        'app-change.md': ['@aragon/app'],
        'assistant-change.md': ['@aragon/assistant', '@aragon/assistant-chat'],
    });

    try {
        assert.deepEqual(validateChangesets({ changesetDir, scopesPath }), []);
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
});

test('rejects a changeset mixing packages from different release scopes', () => {
    const { directory, changesetDir, scopesPath } = createFixture({
        'mixed-change.md': ['@aragon/app', '@aragon/assistant-chat'],
    });

    try {
        const errors = validateChangesets({ changesetDir, scopesPath });
        assert.equal(errors.length, 1);
        assert.match(errors[0], /mixed-change\.md: mixes release scopes/);
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
});

test('rejects a changeset naming a package outside every release scope', () => {
    const { directory, changesetDir, scopesPath } = createFixture({
        'unknown-change.md': ['@aragon/new-package'],
    });

    try {
        const errors = validateChangesets({ changesetDir, scopesPath });
        assert.equal(errors.length, 1);
        assert.match(errors[0], /@aragon\/new-package missing from/);
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
});
