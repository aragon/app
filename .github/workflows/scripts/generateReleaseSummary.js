const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { parse } = require('yaml');

// Run git via execFile (no shell) so user-controlled inputs (BASE_REF, tag names)
// cannot be interpreted as shell metacharacters. Inputs are still validated below.
const runGit = (args, options = {}) => {
    try {
        return execFileSync('git', args, {
            cwd: options.cwd,
            stdio: ['ignore', 'pipe', 'pipe'],
            maxBuffer: 64 * 1024 * 1024,
        })
            .toString()
            .trim();
    } catch (error) {
        console.error(`Failed to run git ${args.join(' ')}`, error.message);
        return '';
    }
};

// Allow only characters valid in git refs we accept here: tags, SHAs, branch names.
const GIT_REF_RE = /^[A-Za-z0-9@._/-]{1,255}$/;
const isSafeGitRef = (ref) => typeof ref === 'string' && GIT_REF_RE.test(ref);

const detectLatestPackageTag = (packageName, git = runGit) => {
    const out = git(['tag', '--list', `${packageName}@*`, '--sort=-v:refname']);
    return out.split('\n')[0]?.trim() ?? '';
};

// Some release flows tag the tested release-branch SHA. Once that branch is merged, the first
// mainline commit containing the tag is the integration commit and the real release boundary.
const detectReleaseBaseFromTag = (tag, headRef = 'HEAD', git = runGit) => {
    if (!tag || !isSafeGitRef(tag) || !isSafeGitRef(headRef)) {
        return '';
    }

    const tagSha = git(['rev-list', '-n', '1', tag]);
    const mergeBase = git(['merge-base', tag, headRef]);
    if (!(tagSha && mergeBase)) {
        return '';
    }

    const firstParentHistory = git(['rev-list', '--first-parent', headRef])
        .split('\n')
        .filter(Boolean);
    if (firstParentHistory.includes(tagSha)) {
        return tagSha;
    }

    if (mergeBase === tagSha) {
        const candidates = git([
            'rev-list',
            '--first-parent',
            '--reverse',
            `${tag}..${headRef}`,
        ])
            .split('\n')
            .filter(Boolean);

        return (
            candidates.find(
                (candidate) => git(['merge-base', tag, candidate]) === tagSha,
            ) ?? ''
        );
    }

    // A divergent tag (for example an unmerged hotfix) falls back to its common cut point.
    return mergeBase;
};

const readPathFilter = (filterPath, filterName) => {
    const filters = parse(fs.readFileSync(filterPath, 'utf8'));
    const patterns = filters?.[filterName];

    if (
        !Array.isArray(patterns) ||
        patterns.length === 0 ||
        patterns.some((pattern) => typeof pattern !== 'string')
    ) {
        throw new Error(
            `Path filter "${filterName}" is missing or invalid in ${filterPath}.`,
        );
    }

    return patterns;
};

const commitMatchesPathFilter = (commit, patterns, git = runGit) => {
    const parents = git(['show', '-s', '--format=%P', commit])
        .split(' ')
        .filter(Boolean);
    const files =
        parents.length === 0
            ? git(['show', '--pretty=format:', '--name-only', commit])
            : git(['diff', '--name-only', parents[0], commit]);

    return files
        .split('\n')
        .filter(Boolean)
        .some((file) =>
            patterns.some((pattern) => path.matchesGlob(file, pattern)),
        );
};

const collectScopedCommits = ({
    baseRef,
    headRef = 'HEAD',
    packageName,
    patterns,
    git = runGit,
}) => {
    const range = baseRef ? `${baseRef}..${headRef}` : headRef;
    const log = git([
        'log',
        '--first-parent',
        range,
        '--pretty=format:%H%x00%s',
    ]);
    const releasePrefix = `Release ${packageName}@`;

    return log
        .split('\n')
        .filter(Boolean)
        .map((line) => {
            const [commit, subject] = line.split('\0');
            return { commit, subject };
        })
        .filter(
            ({ commit, subject }) =>
                !subject.startsWith(releasePrefix) &&
                commitMatchesPathFilter(commit, patterns, git),
        );
};

// Helper to fetch Linear issue details
const fetchLinearIssue = async (issueId, token) => {
    if (!token) {
        console.error('No Linear API token provided.');
        return null;
    }

    try {
        const response = await fetch('https://api.linear.app/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
            body: JSON.stringify({
                query: `
          query Issue($id: String!) {
            issue(id: $id) {
              title
              url
            }
          }
        `,
                variables: { id: issueId },
            }),
        });

        const data = await response.json();
        return data?.data?.issue ? { ...data.data.issue, id: issueId } : null;
    } catch (err) {
        console.error(`Failed to fetch Linear issue ${issueId}:`, err);
        return null;
    }
};

const generateSummary = async ({ core }) => {
    const linearToken = process.env.LINEAR_API_TOKEN;
    const packageName = process.env.PACKAGE_NAME;
    const pathFilter = process.env.PATH_FILTER;
    const filterPath = process.env.FILTERS_PATH || '.github/filters.yml';
    let baseRef = process.env.BASE_REF;

    if (!(packageName && pathFilter)) {
        throw new Error('PACKAGE_NAME and PATH_FILTER are required.');
    }

    if (!isSafeGitRef(packageName)) {
        throw new Error(`Refusing unsafe package name: ${packageName}`);
    }

    if (!baseRef) {
        const latestTag = detectLatestPackageTag(packageName);
        if (latestTag) {
            const releaseBase = detectReleaseBaseFromTag(latestTag, 'HEAD');
            if (releaseBase) {
                baseRef = releaseBase;
                console.log(`Auto-detected base from ${latestTag}: ${baseRef}`);
            } else {
                console.log(
                    `Found tag ${latestTag} but its release base could not be resolved. Using full scoped history.`,
                );
            }
        } else {
            console.log(
                `No ${packageName}@* tags found. Treating this as the first release.`,
            );
        }
    } else if (!isSafeGitRef(baseRef)) {
        throw new Error(`Refusing unsafe BASE_REF: ${baseRef}`);
    }

    if (baseRef && !isSafeGitRef(baseRef)) {
        throw new Error(`Refusing unsafe resolved base ref: ${baseRef}`);
    }

    const range = baseRef ? `${baseRef}..HEAD` : 'HEAD';
    const patterns = readPathFilter(filterPath, pathFilter);
    const commits = collectScopedCommits({
        baseRef,
        packageName,
        patterns,
    });
    console.log(
        `Generating ${packageName} release summary for range ${range} with path filter "${pathFilter}".`,
    );

    const categories = {
        features: [],
        fixes: [],
        others: [],
    };

    const linearRegex = /([a-zA-Z]{2,}-\d+)/g;
    const issuesFound = new Set();

    for (const { subject: line } of commits) {
        const lower = line.toLowerCase();
        const linearMatches = line.match(linearRegex);

        let category = 'others';
        if (lower.startsWith('feat')) {
            category = 'features';
        } else if (lower.startsWith('fix')) {
            category = 'fixes';
        }

        // Clean line prefix
        let cleanLine = line
            .replace(
                /^(feat|fix|chore|docs|style|refactor|perf|test)(\(.*\))?:/,
                '',
            )
            .trim();

        // Linkify PR numbers (#123 -> [#123](url))
        const repository = process.env.GITHUB_REPOSITORY || 'aragon/app';
        cleanLine = cleanLine.replace(
            /\(#(\d+)\)/g,
            `([#$1](https://github.com/${repository}/pull/$1))`,
        );

        // Extract linear issues
        let additionalInfo = '';
        if (linearMatches && linearToken) {
            const addedIssues = new Set();
            for (const issueId of linearMatches) {
                if (issuesFound.has(issueId) || addedIssues.has(issueId)) {
                    continue;
                }
                issuesFound.add(issueId);
                addedIssues.add(issueId);

                const issue = await fetchLinearIssue(issueId, linearToken);
                if (issue) {
                    additionalInfo += ` [${issueId}: ${issue.title}](${issue.url})`;
                } else {
                    additionalInfo += ` ${issueId}`;
                }
            }
        }

        const entry = additionalInfo
            ? `${cleanLine} —${additionalInfo}`
            : cleanLine;
        categories[category].push(entry);
    }

    // 2. Format Output
    let summary = '';

    if (categories.features.length > 0) {
        summary += '## Features\n';
        categories.features.forEach((item) => (summary += `- ${item}\n`));
        summary += '\n';
    }

    if (categories.fixes.length > 0) {
        summary += '## Fixes\n';
        categories.fixes.forEach((item) => (summary += `- ${item}\n`));
        summary += '\n';
    }

    if (categories.others.length > 0) {
        summary += '## Other Changes\n';
        categories.others.forEach((item) => (summary += `- ${item}\n`));
        summary += '\n';
    }

    if (!summary) {
        summary = 'No significant changes detected.';
    }

    core.setOutput('summary', summary);
    console.log('Release summary generated.');
};

module.exports = {
    collectScopedCommits,
    commitMatchesPathFilter,
    detectLatestPackageTag,
    detectReleaseBaseFromTag,
    generateSummary,
    readPathFilter,
    runGit,
};

// Standalone runner
if (require.main === module) {
    const core = {
        setOutput: (name, value) => {
            const outputFile = process.env.GITHUB_OUTPUT;
            if (outputFile) {
                fs.appendFileSync(outputFile, `${name}<<EOF\n${value}\nEOF\n`);
            } else {
                console.log(`::set-output name=${name}::${value}`);
            }
        },
    };
    generateSummary({ core }).catch((err) => {
        console.error('Failed to generate release summary:', err);
        process.exit(1);
    });
}
