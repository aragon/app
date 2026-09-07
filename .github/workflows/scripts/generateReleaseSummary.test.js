const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const {
    collectScopedCommits,
    detectLatestPackageTag,
    generateSummary,
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

const commitFile = (repository, file, content, subject, body) => {
    const target = path.join(repository, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
    git(repository, ['add', file]);
    git(repository, ['commit', '-m', subject, ...(body ? ['-m', body] : [])]);
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
        // A release PR merged with GitHub's default merge subject only reveals its
        // release title in the body: it must be dropped after title resolution.
        git(repository, ['checkout', '-b', 'release/assistant/0.3.0']);
        commitFile(
            repository,
            'packages/assistant-chat/package.json',
            '{"version":"0.3.0"}',
            'version packages',
        );
        git(repository, ['checkout', 'main']);
        git(repository, [
            'merge',
            '--no-ff',
            'release/assistant/0.3.0',
            '-m',
            'Merge pull request #44 from release/assistant/0.3.0',
            '-m',
            'Release @aragon/assistant@0.3.0',
        ]);

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
            commits.map(({ title }) => title),
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

test('resolves merge-style titles from the body and keeps the PR number visible', () => {
    // No body to fall back to: the merge subject is all there is.
    assert.equal(
        resolveCommitTitle('Merge pull request #7 from feature/no-body', ''),
        'Merge pull request #7 from feature/no-body',
    );
    // Non-merge subjects pass through untouched.
    assert.equal(
        resolveCommitTitle('feat: squash subject (#8)', 'ignored body'),
        'feat: squash subject (#8)',
    );
    // The PR title from the body wins, with the PR number appended.
    assert.equal(
        resolveCommitTitle(
            'Merge pull request #9 from aragon/feature',
            'feat(APP-1): real title',
        ),
        'feat(APP-1): real title (#9)',
    );
    // A body line that already references a PR is not suffixed twice.
    assert.equal(
        resolveCommitTitle(
            'Merge pull request #9 from aragon/feature',
            '* feat: first commit (#9)\n* fix: second commit',
        ),
        'feat: first commit (#9)',
    );
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

// Runs generateSummary end-to-end inside a fixture repository with a mocked Linear API,
// capturing the summary output. Restores cwd, env and global.fetch afterwards.
const runGenerateSummary = async (
    repository,
    issuesById,
    { linearToken = 'test-token' } = {},
) => {
    const filterPath = path.join(repository, 'filters.yml');
    fs.writeFileSync(filterPath, 'app:\n  - "apps/app/**"\n');

    const originalCwd = process.cwd();
    const originalFetch = global.fetch;
    const originalEnvironment = { ...process.env };
    const outputs = {};

    try {
        process.chdir(repository);
        process.env.PACKAGE_NAME = '@aragon/app';
        process.env.PATH_FILTER = 'app';
        process.env.FILTERS_PATH = filterPath;
        process.env.GITHUB_REPOSITORY = 'aragon/app';
        delete process.env.BASE_REF;
        if (linearToken) {
            process.env.LINEAR_API_TOKEN = linearToken;
        } else {
            delete process.env.LINEAR_API_TOKEN;
        }

        global.fetch = async (_url, options) => {
            const { variables } = JSON.parse(options.body);
            return {
                json: async () => ({
                    data: { issue: issuesById[variables.id] ?? null },
                }),
            };
        };

        await generateSummary({
            core: {
                setOutput: (name, value) => {
                    outputs[name] = value;
                },
            },
        });
    } finally {
        process.chdir(originalCwd);
        global.fetch = originalFetch;
        process.env = originalEnvironment;
    }

    return outputs.summary;
};

test('warns about open Linear tickets and their current status', async () => {
    const repository = createRepository();

    try {
        commitFile(
            repository,
            'apps/app/open.ts',
            'open',
            'feat(APP-100): open work (#1)',
        );
        commitFile(
            repository,
            'apps/app/done.ts',
            'done',
            'fix(APP-200): finished work (#2)',
        );
        commitFile(
            repository,
            'apps/app/canceled.ts',
            'canceled',
            'fix(APP-300): canceled work (#3)',
        );
        commitFile(
            repository,
            'apps/app/phantom.ts',
            'phantom',
            'chore(APP-400): unresolvable id (#4)',
        );

        const summary = await runGenerateSummary(repository, {
            'APP-100': {
                title: 'Open feature',
                url: 'https://linear.app/aragon/issue/APP-100',
                state: { name: 'In Development', type: 'started' },
            },
            'APP-200': {
                title: 'Finished fix',
                url: 'https://linear.app/aragon/issue/APP-200',
                state: { name: 'Done', type: 'completed' },
            },
            'APP-300': {
                title: 'Canceled fix',
                url: 'https://linear.app/aragon/issue/APP-300',
                state: { name: 'Canceled', type: 'canceled' },
            },
        });

        const [warningSection] = summary.split('## Features');
        assert.match(warningSection, /## ⚠️ Open tickets/);
        assert.match(
            warningSection,
            /- \[APP-100: Open feature\]\(https:\/\/linear\.app\/aragon\/issue\/APP-100\) — In Development/,
        );
        // Finished, canceled and unresolvable tickets stay out of the warning section.
        assert.doesNotMatch(warningSection, /APP-200|APP-300|APP-400/);
        // Regular enrichment keeps linking every resolved ticket.
        assert.match(
            summary,
            /\[APP-200: Finished fix\]\(https:\/\/linear\.app\/aragon\/issue\/APP-200\)/,
        );
    } finally {
        fs.rmSync(repository, { recursive: true, force: true });
    }
});

test('omits the warning section when every ticket is finished', async () => {
    const repository = createRepository();

    try {
        commitFile(
            repository,
            'apps/app/done.ts',
            'done',
            'fix(APP-200): finished work (#2)',
        );

        const summary = await runGenerateSummary(repository, {
            'APP-200': {
                title: 'Finished fix',
                url: 'https://linear.app/aragon/issue/APP-200',
                state: { name: 'Done', type: 'completed' },
            },
        });

        assert.doesNotMatch(summary, /Open tickets/);
    } finally {
        fs.rmSync(repository, { recursive: true, force: true });
    }
});

test('groups every commit of a ticket into a single linked entry', async () => {
    const repository = createRepository();

    try {
        commitFile(
            repository,
            'apps/app/one.ts',
            'one',
            'feat(APP-500): part one (#10)',
        );
        commitFile(
            repository,
            'apps/app/two.ts',
            'two',
            'fix(APP-500): follow-up (#11)',
        );

        const summary = await runGenerateSummary(repository, {
            'APP-500': {
                title: 'Grouped feature',
                url: 'https://linear.app/aragon/issue/APP-500',
                state: { name: 'Done', type: 'completed' },
            },
        });

        // One entry for the ticket, in the strongest section among its commits
        // (feat > fix), carrying the PR links of every commit (newest first).
        assert.match(
            summary,
            /## Features\n- \[APP-500: Grouped feature\]\(https:\/\/linear\.app\/aragon\/issue\/APP-500\) \(\[#11\]\(https:\/\/github\.com\/aragon\/app\/pull\/11\), \[#10\]\(https:\/\/github\.com\/aragon\/app\/pull\/10\)\)/,
        );
        assert.doesNotMatch(summary, /## Fixes/);
        assert.equal(summary.match(/APP-500: Grouped feature/g).length, 1);
    } finally {
        fs.rmSync(repository, { recursive: true, force: true });
    }
});

test('harvests tickets from the body of a merge-titled squash', async () => {
    const repository = createRepository();

    try {
        // The v0.36.0 incident shape: a squash that kept the merge-style subject,
        // its real changes only listed in the body.
        commitFile(
            repository,
            'apps/app/squash.ts',
            'squash',
            'Merge pull request #1502 from aragon/feature-x',
            '* feat(APP-600): the real feature\n* fix(APP-601): a follow-up fix',
        );

        const summary = await runGenerateSummary(repository, {
            'APP-600': {
                title: 'Squashed feature',
                url: 'https://linear.app/aragon/issue/APP-600',
                state: { name: 'Done', type: 'completed' },
            },
            'APP-601': {
                title: 'Squashed fix',
                url: 'https://linear.app/aragon/issue/APP-601',
                state: { name: 'Done', type: 'completed' },
            },
        });

        // Both tickets surface as their own entries, linked to the squash PR; the
        // commit classifies as a feature (feat outranks fix within one message).
        assert.match(
            summary,
            /- \[APP-600: Squashed feature\]\(https:\/\/linear\.app\/aragon\/issue\/APP-600\) \(\[#1502\]\(https:\/\/github\.com\/aragon\/app\/pull\/1502\)\)/,
        );
        assert.match(
            summary,
            /- \[APP-601: Squashed fix\]\(https:\/\/linear\.app\/aragon\/issue\/APP-601\) \(\[#1502\]\(https:\/\/github\.com\/aragon\/app\/pull\/1502\)\)/,
        );
        assert.doesNotMatch(summary, /Merge pull request/);
    } finally {
        fs.rmSync(repository, { recursive: true, force: true });
    }
});

test('caps body ticket harvesting so bulk-sync squashes stay one entry', async () => {
    const repository = createRepository();

    try {
        const bulkBody = Array.from(
            { length: 9 },
            (_, index) => `* feat(APP-${index + 1}): bulk change ${index + 1}`,
        ).join('\n');
        commitFile(
            repository,
            'apps/app/bulk.ts',
            'bulk',
            'Merge pull request #99 from aragon/bulk-sync',
            bulkBody,
        );

        const summary = await runGenerateSummary(repository, {});

        // Too many body tickets to be a genuine PR: no harvesting, the commit falls
        // back to a single title entry built from the first body line.
        assert.match(
            summary,
            /- feat\(APP-1\): bulk change 1 \(\[#99\]\(https:\/\/github\.com\/aragon\/app\/pull\/99\)\)/,
        );
        assert.doesNotMatch(summary, /APP-2/);
    } finally {
        fs.rmSync(repository, { recursive: true, force: true });
    }
});

test('degrades to commit titles when no Linear token is provided', async () => {
    const repository = createRepository();

    try {
        commitFile(
            repository,
            'apps/app/tokenless.ts',
            'tokenless',
            'feat(APP-700): tokenless work (#5)',
        );

        const summary = await runGenerateSummary(
            repository,
            {},
            { linearToken: '' },
        );

        assert.match(
            summary,
            /## Features\n- feat\(APP-700\): tokenless work \(\[#5\]\(https:\/\/github\.com\/aragon\/app\/pull\/5\)\)/,
        );
        assert.doesNotMatch(summary, /linear\.app|Open tickets/);
    } finally {
        fs.rmSync(repository, { recursive: true, force: true });
    }
});

test('deduplicates repeated titles without tickets', async () => {
    const repository = createRepository();

    try {
        commitFile(repository, 'apps/app/dep-a.ts', 'a', 'chore: bump deps');
        commitFile(repository, 'apps/app/dep-b.ts', 'b', 'chore: bump deps');

        const summary = await runGenerateSummary(repository, {});

        assert.equal(summary.match(/- chore: bump deps/g).length, 1);
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
