const { execFileSync } = require('node:child_process');
const fs = require('node:fs');

// Run git via execFile (no shell) so user-controlled inputs (BASE_REF, tag names)
// cannot be interpreted as shell metacharacters. Inputs are still validated below.
const runGit = (args) => {
    try {
        return execFileSync('git', args, {
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
const GIT_REF_RE = /^[A-Za-z0-9._/-]{1,255}$/;
const isSafeGitRef = (ref) => typeof ref === 'string' && GIT_REF_RE.test(ref);

// Latest semver-like tag by version (not reachability).
const detectLatestSemverTag = () => {
    const out = runGit(['tag', '--list', 'v*', '--sort=-v:refname']);
    return out.split('\n')[0]?.trim() ?? '';
};

// If tags are created on release branches, the right "since last release cut" base on main
// is the merge-base between main (HEAD) and the previous release tag commit.
const detectReleaseCutBaseFromTag = (tag, headRef = 'HEAD') => {
    if (!tag || !isSafeGitRef(tag) || !isSafeGitRef(headRef)) {
        return '';
    }
    return runGit(['merge-base', tag, headRef]);
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
    let baseRef = process.env.BASE_REF;

    // Auto-detect base ref (recommended, handles releases and hotfixes correctly).
    //
    // Tags are created on release branches, so they're NOT reachable from main via `git describe`.
    // Instead, we find the latest tag by semver version and compute merge-base(tag, HEAD).
    // This gives us "the commit where the previous release diverged" — the correct range start.
    if (!baseRef) {
        const latestTag = detectLatestSemverTag();
        if (latestTag) {
            const cutBase = detectReleaseCutBaseFromTag(latestTag, 'HEAD');
            if (cutBase) {
                baseRef = cutBase;
                console.log(`Auto-detected base from ${latestTag}: ${baseRef}`);
            } else {
                console.log(
                    `Found tag ${latestTag} but merge-base failed. Using full history.`,
                );
            }
        } else {
            console.log('No tags found. Using full history.');
        }
    } else if (!isSafeGitRef(baseRef)) {
        console.error(`Refusing unsafe BASE_REF: ${baseRef}`);
        process.exit(1);
    } else if (/^v\d+\.\d+\.\d+/.test(baseRef)) {
        // If a tag was passed explicitly, convert to merge-base (same logic as auto-detect).
        const cutBase = detectReleaseCutBaseFromTag(baseRef, 'HEAD');
        if (cutBase) {
            console.log(`Converting tag ${baseRef} to merge-base: ${cutBase}`);
            baseRef = cutBase;
        }
    }

    // `baseRef` at this point is either empty, a commit SHA we produced, or a value
    // that passed isSafeGitRef. Re-check defensively before handing it to git.
    if (baseRef && !isSafeGitRef(baseRef)) {
        console.error(`Refusing unsafe resolved base ref: ${baseRef}`);
        process.exit(1);
    }

    // Pass the rev range as a single argv element. With execFile there is no shell
    // expansion, so the `..HEAD` suffix is interpreted by git itself.
    const range = baseRef ? `${baseRef}..HEAD` : 'HEAD';
    console.log(`Generating release summary for range: ${range}`);

    // 1. Get stats from Git
    const log = runGit(['log', range, '--pretty=format:%s']);
    const lines = log.split('\n').filter(Boolean);

    const categories = {
        features: [],
        fixes: [],
        others: [],
    };

    const linearRegex = /([a-zA-Z]{2,}-\d+)/g;
    const issuesFound = new Set();

    for (const line of lines) {
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
        cleanLine = cleanLine.replace(
            /\(#(\d+)\)/g,
            '([#$1](https://github.com/aragon/app/pull/$1))',
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
