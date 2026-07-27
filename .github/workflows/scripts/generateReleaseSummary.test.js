const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const {
    collectScopedCommits,
    detectLatestPackageTag,
    readPathFilter,
    resolveCommitTitle,
    runGit,
} = require('./generateReleaseSummary');

// Ignore the developer's git config: a global commit.gpgsign would make every
// fixture commit block on a pinentry prompt.
const gitEnvironment = {
    ...process.env,
    GIT_CONFIG_GLOBAL: os.devNull,
    GIT_CONFIG_SYSTEM: os.devNull,
};

const createRepository = () => {
    const directory = fs.mkdtempSync(
        path.join(os.tmpdir(), 'release-summary-'),
    );
    execFileSync('git', ['init', '--initial-branch=main'], {
        cwd: directory,
        stdio: 'ignore',
        env: gitEnvironment,
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
        {
            cwd: repository,
            stdio: ['ignore', 'pipe', 'pipe'],
            env: gitEnvironment,
        },
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

test('keeps release-window commits and excludes everything the tag already ships', () => {
    const repository = createRepository();

    try {
        commitFile(
            repository,
            'apps/app/base.txt',
            'base',
            'feat: initial app',
        );
        // The release branch is cut here; the tag points at the tested branch SHA.
        git(repository, ['checkout', '-b', 'release/app/1.0.0']);
        commitFile(
            repository,
            'apps/app/package.json',
            '{"version":"1.0.0"}',
            'Release @aragon/app@1.0.0',
        );
        git(repository, ['tag', '@aragon/app@1.0.0']);
        git(repository, ['checkout', 'main']);
        // Merged to main while the release branch was open: ships with the NEXT release and
        // must stay in its summary even though it sits below the integration commit.
        commitFile(
            repository,
            'apps/app/window.ts',
            'window',
            'feat(APP-9): merged during release window (#41)',
        );
        git(repository, [
            'merge',
            '--no-ff',
            'release/app/1.0.0',
            '-m',
            'Release @aragon/app@1.0.0 (#1)',
        ]);

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
        // A PR landed as a merge commit: GitHub puts the PR title into the commit body.
        git(repository, [
            'merge',
            '--no-ff',
            'feature/multi-commit',
            '-m',
            'Merge pull request #43 from feature/multi-commit',
            '-m',
            'feat(APP-77): multi-commit feature',
        ]);
        commitFile(
            repository,
            'apps/app/package.json',
            '{"version":"1.1.0"}',
            'Release @aragon/app@1.1.0',
        );

        const repositoryGit = (args) => runGit(args, { cwd: repository });
        const packageTag = detectLatestPackageTag('@aragon/app', repositoryGit);
        const commits = collectScopedCommits({
            baseRef: packageTag,
            patterns: [
                'apps/app/**',
                'packages/assistant-chat/**',
                'pnpm-lock.yaml',
            ],
            git: repositoryGit,
        });

        assert.equal(packageTag, '@aragon/app@1.0.0');
        assert.deepEqual(
            commits.map(({ subject }) => subject),
            [
                'feat(APP-77): multi-commit feature (#43)',
                'feat(APP-123): add app feature (#42)',
                'chore: update shared lockfile',
                'feat(APP-9): merged during release window (#41)',
            ],
        );
    } finally {
        fs.rmSync(repository, { recursive: true, force: true });
    }
});

test('keeps the subject of a merge commit without a PR title in its body', () => {
    const repository = createRepository();

    try {
        commitFile(repository, 'apps/app/a.txt', 'a', 'feat: base');
        git(repository, ['checkout', '-b', 'feature/no-body']);
        commitFile(repository, 'apps/app/b.txt', 'b', 'feat: branch work');
        git(repository, ['checkout', 'main']);
        git(repository, [
            'merge',
            '--no-ff',
            'feature/no-body',
            '-m',
            'Merge pull request #7 from feature/no-body',
        ]);

        const repositoryGit = (args) => runGit(args, { cwd: repository });
        const mergeCommit = repositoryGit(['rev-parse', 'HEAD']);

        assert.equal(
            resolveCommitTitle(
                mergeCommit,
                'Merge pull request #7 from feature/no-body',
                repositoryGit,
            ),
            'Merge pull request #7 from feature/no-body',
        );
        assert.equal(
            resolveCommitTitle('irrelevant', 'feat: squash subject (#8)'),
            'feat: squash subject (#8)',
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
