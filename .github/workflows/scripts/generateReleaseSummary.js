const { execSync } = require('node:child_process');
const fs = require('node:fs');

// Helper to run git commands
const runGit = (command) => {
    try {
        return execSync(command).toString().trim();
    } catch (error) {
        console.error(`Failed to run git command: ${command}`, error);
        return '';
    }
};

// Latest semver-like tag by version (not reachability).
const detectLatestSemverTag = () => {
    return runGit(`git tag --list "v*" --sort=-v:refname | head -n 1`);
};

// If tags are created on release branches, the right "since last release cut" base on main
// is the merge-base between main (HEAD) and the previous release tag commit.
const detectReleaseCutBaseFromTag = (tag, headRef = 'HEAD') => {
    if (!tag) {
        return '';
    }
    return runGit(`git merge-base "${tag}" "${headRef}"`);
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
    // Optional: Allow overriding the base ref (default: auto-detect from latest tag)
    let baseRef = process.env.BASE_REF;

    // Auto-detect base when not provided.
    //
    // Note: our tags are created on release branches, so they are often NOT reachable from main.
    // Using `git describe` on main would then pick an older tag (or none) and include already-
    // released commits. Instead, we:
    // - find the latest version tag by semver sort
    // - compute merge-base(tag, HEAD) which equals "the main commit the previous release was cut from"
    // - use that merge-base as the range start
    if (!baseRef) {
        const latestTag = detectLatestSemverTag();
        if (latestTag) {
            const cutBase = detectReleaseCutBaseFromTag(latestTag, 'HEAD');
            if (cutBase) {
                baseRef = cutBase;
                console.log(
                    `Detected previous release cut base from ${latestTag}: ${baseRef}`,
                );
            } else {
                console.log(
                    `Found latest tag ${latestTag} but failed to compute merge-base. Using full history.`,
                );
            }
        } else {
            console.log('No previous tags found. Using full history.');
        }
    } else if (/^v\d+\.\d+\.\d+/.test(baseRef)) {
        // If workflow passed a tag explicitly, interpret it as "previous release tag".
        const cutBase = detectReleaseCutBaseFromTag(baseRef, 'HEAD');
        if (cutBase) {
            baseRef = cutBase;
        }
    }

    // Use range or full history
    const range = baseRef ? `${baseRef}..HEAD` : 'HEAD';
    console.log(`Generating release summary for range: ${range}`);

    // 1. Get stats from Git
    const log = runGit(`git log ${range} --pretty=format:"%s"`);
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
    generateSummary({ core });
}
