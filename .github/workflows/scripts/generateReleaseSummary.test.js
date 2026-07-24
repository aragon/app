const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const {
    collectScopedCommits,
    detectLatestPackageTag,
    detectReleaseBaseFromTag,
    readPathFilter,
    runGit,
} = require('./generateReleaseSummary');

const createRepository = () => {
    const directory = fs.mkdtempSync(
        path.join(os.tmpdir(), 'release-summary-'),
    );
    execFileSync('git', ['init', '--initial-branch=main'], {
        cwd: directory,
        stdio: 'ignore',
    });

    return directory;
};

const git = (repository, args) =>
    execFileSync(
        'git',
        [
            '-c',
            'user.name=Release Summary Test',
            '-c',
            'user.email=release-summary@example.com',
            ...args,
        ],
        { cwd: repository, stdio: ['ignore', 'pipe', 'pipe'] },
    )
        .toString()
        .trim();

const commitFile = (repository, file, content, subject) => {
    const target = path.join(repository, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
    git(repository, ['add', file]);
    git(repository, ['commit', '-m', subject]);
};

test('uses the package tag integration commit and filters first-parent history', () => {
    const repository = createRepository();

    try {
        commitFile(
            repository,
            'apps/app/base.txt',
            'base',
            'feat: initial app',
        );
        git(repository, ['tag', 'v9.0.0']);
        git(repository, ['checkout', '-b', 'release/app/1.0.0']);
        commitFile(
            repository,
            'apps/app/package.json',
            '{"version":"1.0.0"}',
            'Release @aragon/app@1.0.0',
        );
        git(repository, ['tag', '@aragon/app@1.0.0']);
        git(repository, ['tag', '@aragon/assistant@9.0.0']);
        git(repository, ['checkout', 'main']);
        commitFile(
            repository,
            'apps/assistant/before-release-merge.ts',
            'main advanced',
            'feat: main advances while release is tested',
        );
        git(repository, [
            'merge',
            '--no-ff',
            'release/app/1.0.0',
            '-m',
            'Merge pull request #1 from release/app/1.0.0',
        ]);
        const integrationCommit = git(repository, ['rev-parse', 'HEAD']);

        commitFile(
            repository,
            'apps/assistant/index.ts',
            'assistant',
            'feat: assistant-only change',
        );
        commitFile(
            repository,
            'pnpm-lock.yaml',
            'lockfile',
            'chore: update shared lockfile',
        );
        commitFile(
            repository,
            'apps/app/feature.ts',
            'feature',
            'feat(APP-123): add app feature (#42)',
        );
        // Another workspace's release commit touches paths inside this filter's scope
        // (the app bundles assistant packages) and must not leak into the summary.
        commitFile(
            repository,
            'packages/assistant-chat/package.json',
            '{"version":"0.2.0"}',
            'Release @aragon/assistant@0.2.0',
        );

        git(repository, ['checkout', '-b', 'feature/multi-commit']);
        commitFile(
            repository,
            'apps/app/part-a.ts',
            'a',
            'feat: internal branch commit A',
        );
        commitFile(
            repository,
            'apps/app/part-b.ts',
            'b',
            'feat: internal branch commit B',
        );
        git(repository, ['checkout', 'main']);
        git(repository, [
            'merge',
            '--no-ff',
            'feature/multi-commit',
            '-m',
            'Merge pull request #43 from feature/multi-commit',
        ]);
        commitFile(
            repository,
            'apps/app/package.json',
            '{"version":"1.1.0"}',
            'Release @aragon/app@1.1.0',
        );

        const repositoryGit = (args) => runGit(args, { cwd: repository });
        const packageTag = detectLatestPackageTag('@aragon/app', repositoryGit);
        const baseRef = detectReleaseBaseFromTag(
            packageTag,
            'HEAD',
            repositoryGit,
        );
        const commits = collectScopedCommits({
            baseRef,
            patterns: [
                'apps/app/**',
                'packages/assistant-chat/**',
                'pnpm-lock.yaml',
            ],
            git: repositoryGit,
        });

        assert.equal(packageTag, '@aragon/app@1.0.0');
        assert.equal(baseRef, integrationCommit);
        assert.deepEqual(
            commits.map(({ subject }) => subject),
            [
                'Merge pull request #43 from feature/multi-commit',
                'feat(APP-123): add app feature (#42)',
                'chore: update shared lockfile',
            ],
        );
    } finally {
        fs.rmSync(repository, { recursive: true, force: true });
    }
});

test('treats a workspace without package tags as a first release', () => {
    const repository = createRepository();

    try {
        commitFile(
            repository,
            'apps/assistant/index.ts',
            'assistant',
            'feat: unrelated app',
        );
        commitFile(
            repository,
            'apps/new-app/index.ts',
            'new app',
            'feat: first new-app feature',
        );

        const repositoryGit = (args) => runGit(args, { cwd: repository });
        const packageTag = detectLatestPackageTag(
            '@aragon/new-app',
            repositoryGit,
        );
        const commits = collectScopedCommits({
            baseRef: '',
            packageName: '@aragon/new-app',
            patterns: ['apps/new-app/**'],
            git: repositoryGit,
        });

        assert.equal(packageTag, '');
        assert.deepEqual(
            commits.map(({ subject }) => subject),
            ['feat: first new-app feature'],
        );
    } finally {
        fs.rmSync(repository, { recursive: true, force: true });
    }
});

test('reads named path filters from the central mapper', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'release-filter-'));
    const filterPath = path.join(directory, 'filters.yml');

    try {
        fs.writeFileSync(
            filterPath,
            'app:\n  - "apps/app/**"\n  - "pnpm-lock.yaml"\n',
        );

        assert.deepEqual(readPathFilter(filterPath, 'app'), [
            'apps/app/**',
            'pnpm-lock.yaml',
        ]);
        assert.throws(
            () => readPathFilter(filterPath, 'assistant'),
            /missing or invalid/,
        );
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
});
