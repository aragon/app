const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const { generateSummary } = require('./generateVersionSummary');
const { extractChangelogSection } = require('./readChangelog');

const createWorkspaceRepository = () => {
    const directory = fs.realpathSync(
        fs.mkdtempSync(path.join(os.tmpdir(), 'version-summary-')),
    );
    execFileSync('git', ['init', '--initial-branch=main'], {
        cwd: directory,
        stdio: 'ignore',
    });
    writeFile(
        directory,
        'package.json',
        '{"name":"fixture-root","private":true}',
    );
    writeFile(
        directory,
        'pnpm-workspace.yaml',
        'packages:\n  - "apps/*"\n  - "packages/*"\n',
    );

    return directory;
};

const git = (repository, args) =>
    execFileSync(
        'git',
        [
            '-c',
            'user.name=Version Summary Test',
            '-c',
            'user.email=version-summary@example.com',
            ...args,
        ],
        { cwd: repository, stdio: ['ignore', 'pipe', 'pipe'] },
    );

const writeFile = (repository, file, content) => {
    const target = path.join(repository, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
};

const writePackage = (repository, workspacePath, name, version) =>
    writeFile(
        repository,
        path.join(workspacePath, 'package.json'),
        JSON.stringify({ name, version }),
    );

test('summarizes the scoped packages bumped by changeset version', () => {
    const repository = createWorkspaceRepository();

    try {
        writePackage(
            repository,
            'apps/assistant',
            '@aragon/assistant',
            '0.1.0',
        );
        writePackage(
            repository,
            'packages/assistant-chat',
            '@aragon/assistant-chat',
            '0.0.1',
        );
        writePackage(repository, 'apps/app', '@aragon/app', '1.0.0');
        git(repository, ['add', '--all']);
        git(repository, ['commit', '-m', 'chore: scaffold workspaces']);

        // Simulate `changeset version`: assistant and chat bump; app bumps too but is
        // outside the scope; contracts is in scope but has no pending changesets.
        writePackage(
            repository,
            'apps/assistant',
            '@aragon/assistant',
            '0.2.0',
        );
        writeFile(
            repository,
            'apps/assistant/CHANGELOG.md',
            '# @aragon/assistant\n\n## 0.2.0\n\n### Minor Changes\n\n- abc123: add support intake\n\n## 0.1.0\n\n### Patch Changes\n\n- old entry\n',
        );
        writePackage(
            repository,
            'packages/assistant-chat',
            '@aragon/assistant-chat',
            '0.1.0',
        );
        writeFile(
            repository,
            'packages/assistant-chat/CHANGELOG.md',
            '# @aragon/assistant-chat\n\n## 0.1.0\n\n### Minor Changes\n\n- def456: add chat widget\n',
        );
        writePackage(repository, 'apps/app', '@aragon/app', '1.1.0');

        const outputs = {};
        generateSummary({
            core: { setOutput: (name, value) => (outputs[name] = value) },
            scope: [
                '@aragon/assistant',
                '@aragon/assistant-contracts',
                '@aragon/assistant-chat',
            ],
            cwd: repository,
        });

        assert.equal(
            outputs.summary,
            '## @aragon/assistant@0.2.0\n\n### Minor Changes\n\n- abc123: add support intake\n\n' +
                '## @aragon/assistant-chat@0.1.0\n\n### Minor Changes\n\n- def456: add chat widget',
        );
    } finally {
        fs.rmSync(repository, { recursive: true, force: true });
    }
});

test('reports when no scoped package was bumped', () => {
    const repository = createWorkspaceRepository();

    try {
        writePackage(
            repository,
            'apps/assistant',
            '@aragon/assistant',
            '0.1.0',
        );
        git(repository, ['add', '--all']);
        git(repository, ['commit', '-m', 'chore: scaffold workspaces']);

        const outputs = {};
        generateSummary({
            core: { setOutput: (name, value) => (outputs[name] = value) },
            scope: ['@aragon/assistant'],
            cwd: repository,
        });

        assert.equal(outputs.summary, 'No packages bumped.');
    } finally {
        fs.rmSync(repository, { recursive: true, force: true });
    }
});

test('extracts a single version section from a changesets changelog', () => {
    const changelog =
        '# @aragon/assistant\n\n## 1.2.0\n\n### Minor Changes\n\n- new entry\n\n## 1.1.9\n\n- previous entry\n';

    assert.equal(
        extractChangelogSection(changelog, '1.2.0'),
        '### Minor Changes\n\n- new entry',
    );
    assert.equal(extractChangelogSection(changelog, '9.9.9'), null);
});
