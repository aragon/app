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

// Any workspace's release commit is dropped, not just this package's: other flows' release
// commits (e.g. "Release @aragon/assistant@0.2.0") touch paths shared with this filter's scope
// and would otherwise leak into the summary as "Other Changes".
const RELEASE_COMMIT_RE = /^Release @aragon\/[^@\s]+@\d+\.\d+\.\d+/;

// Linear issue identifiers like "APP-1234" embedded in commit messages.
const LINEAR_ID_RE = /\b[A-Za-z]{2,}-\d+\b/g;

// A mainline commit that kept a merge-style title ("Merge pull request #N …") says nothing
// in its subject — its real changes live in the body. This covers both PRs landed as merge
// commits (GitHub puts the PR title into the body) and squashes that kept the merge title.
const MERGE_TITLE_RE = /^Merge /i;

// Body-harvesting cutoff: a squashed bulk-sync PR (e.g. a release back-merge) lists a whole
// release worth of commits in its body, and harvesting tickets from it would resurface
// already-released work. No genuine single PR references this many.
const MAX_BODY_TICKETS = 8;

// A merge-style subject carries no information: prefer the first real body line (the PR
// title for a merge commit or single-commit squash, the first commit message for a
// multi-commit squash), keeping the PR number visible.
const resolveCommitTitle = (subject, body) => {
    if (!MERGE_TITLE_RE.test(subject)) {
        return subject;
    }

    const bodyTitle = (body ?? '')
        .split('\n')
        .map((line) => line.replace(/^[\s*-]+/, '').trim())
        .find(Boolean);

    if (!bodyTitle) {
        return subject;
    }

    const [pr] = subject.match(/#\d+\b/g) ?? [];
    return /#\d+/.test(bodyTitle) || !pr ? bodyTitle : `${bodyTitle} (${pr})`;
};

// Mainline commits since the release boundary. The boundary is the previous release tag itself:
// everything the tag already contains is excluded, while PRs merged to main during the previous
// release window (after its branch was cut, before it merged) stay in — they ship with THIS
// release, even though they sit below the previous release's integration commit on the mainline.
const collectScopedCommits = ({
    baseRef,
    headRef = 'HEAD',
    patterns,
    git = runGit,
}) => {
    const range = baseRef ? `${baseRef}..${headRef}` : headRef;
    // NUL-separated hash/subject/body per commit, record-separated so multiline bodies parse.
    const log = git([
        'log',
        '--first-parent',
        range,
        '--pretty=format:%H%x00%s%x00%b%x1e',
    ]);

    return (
        log
            .split('\x1e')
            .map((record) => record.trim())
            .filter(Boolean)
            .map((record) => {
                const [commit = '', subject = '', body = ''] =
                    record.split('\0');
                return {
                    commit: commit.trim(),
                    subject: subject.trim(),
                    body: body.trim(),
                };
            })
            // Resolve titles before filtering: a release PR merged with GitHub's default
            // merge subject only reveals its "Release @aragon/…" title in its body, and
            // RELEASE_COMMIT_RE must see that title to drop the commit.
            .map((commit) => ({
                ...commit,
                title: resolveCommitTitle(commit.subject, commit.body),
            }))
            .filter(
                ({ commit, title }) =>
                    !RELEASE_COMMIT_RE.test(title) &&
                    commitMatchesPathFilter(commit, patterns, git),
            )
    );
};

// Linear state types that mean a ticket is finished; anything else (triage, backlog,
// unstarted, started) counts as open and is surfaced in the summary's warning section.
const CLOSED_STATE_TYPES = new Set(['completed', 'canceled']);

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
              state {
                name
                type
              }
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

const SECTION_RANK = { features: 0, fixes: 1, others: 2 };

// Section for a message: any feat/perf line wins over fix, fix over other. Lines are
// stripped of list markers so squash bodies ("* feat: …") classify like subjects.
const sectionOf = (text) => {
    const lines = text.split('\n').map((line) => line.replace(/^[\s*-]+/, ''));
    if (lines.some((line) => /^(feat|perf)[\s(:!]/i.test(line))) {
        return 'features';
    }
    if (lines.some((line) => /^fix[\s(:!]/i.test(line))) {
        return 'fixes';
    }
    return 'others';
};

// Groups commits by the Linear tickets they reference (subject always; body too for
// merge-titled commits, capped): one entry per ticket regardless of how many commits
// carry it, titled by the ticket itself and placed in the strongest section among its
// commits. Commits with no resolvable ticket stay visible under their own title, so
// missing Linear data can hide enrichment but never a change.
const categorize = async (commits, { linearToken, repository }) => {
    // Linear enrichment is optional: only attempted when a token is present, and each
    // issue is fetched at most once across all commits. A failed fetch caches null, which
    // degrades the commit to the title path — the release never fails on Linear.
    const issueCache = new Map();
    const resolveIssue = async (id) => {
        if (!issueCache.has(id)) {
            issueCache.set(
                id,
                linearToken ? await fetchLinearIssue(id, linearToken) : null,
            );
        }
        return issueCache.get(id);
    };

    const prLink = (number) =>
        `[#${number}](https://github.com/${repository}/pull/${number})`;

    const tickets = new Map(); // id -> { issue, section, prs }
    const titleEntries = [];
    const seenTitles = new Set();

    for (const { subject, body, title } of commits) {
        const isMergeTitle = MERGE_TITLE_RE.test(subject);

        const ids = new Set(
            (subject.match(LINEAR_ID_RE) ?? []).map((id) => id.toUpperCase()),
        );
        if (isMergeTitle) {
            const bodyIds = new Set(
                (body.match(LINEAR_ID_RE) ?? []).map((id) => id.toUpperCase()),
            );
            if (bodyIds.size <= MAX_BODY_TICKETS) {
                for (const id of bodyIds) {
                    ids.add(id);
                }
            }
        }

        const section = sectionOf(
            isMergeTitle ? `${subject}\n${body}` : subject,
        );
        const prs = (subject.match(/#\d+\b/g) ?? []).map((pr) => pr.slice(1));

        const resolved = [];
        for (const id of ids) {
            const issue = await resolveIssue(id);
            if (issue) {
                resolved.push({ id, issue });
            }
        }

        if (resolved.length > 0) {
            for (const { id, issue } of resolved) {
                const entry = tickets.get(id) ?? {
                    issue,
                    section,
                    prs: new Set(),
                };
                if (SECTION_RANK[section] < SECTION_RANK[entry.section]) {
                    entry.section = section;
                }
                for (const pr of prs) {
                    entry.prs.add(pr);
                }
                tickets.set(id, entry);
            }
            continue;
        }

        // No resolvable ticket: keep the commit under its own (merge-resolved) title,
        // deduplicating identical titles across commits.
        if (seenTitles.has(title)) {
            continue;
        }
        seenTitles.add(title);
        titleEntries.push({
            section,
            text: title.replace(
                /\(#(\d+)\)/g,
                (_, number) => `(${prLink(number)})`,
            ),
        });
    }

    const sections = { features: [], fixes: [], others: [] };
    for (const [id, { issue, section, prs }] of tickets) {
        const refs =
            prs.size > 0 ? ` (${[...prs].map(prLink).join(', ')})` : '';
        sections[section].push(`[${id}: ${issue.title}](${issue.url})${refs}`);
    }
    for (const { section, text } of titleEntries) {
        sections[section].push(text);
    }

    // Tickets referenced by this range that are not completed/canceled yet. Unresolved
    // ids (false positives like "UTF-8", missing issues) are cached as null and never
    // reach the warning.
    const openIssues = [];
    for (const [id, issue] of issueCache) {
        if (issue?.state && !CLOSED_STATE_TYPES.has(issue.state.type)) {
            openIssues.push({ ...issue, id });
        }
    }

    return { ...sections, openIssues };
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

    if (baseRef) {
        if (!isSafeGitRef(baseRef)) {
            throw new Error(`Refusing unsafe BASE_REF: ${baseRef}`);
        }
    } else {
        baseRef = detectLatestPackageTag(packageName);
        if (baseRef) {
            console.log(`Auto-detected release boundary: ${baseRef}`);
        } else {
            console.log(
                `No ${packageName}@* tags found. Treating this as the first release.`,
            );
        }
    }

    const range = baseRef ? `${baseRef}..HEAD` : 'HEAD';
    const patterns = readPathFilter(filterPath, pathFilter);
    const commits = collectScopedCommits({
        baseRef,
        patterns,
    });
    console.log(
        `Generating ${packageName} release summary for range ${range} with path filter "${pathFilter}".`,
    );

    const { features, fixes, others, openIssues } = await categorize(commits, {
        linearToken,
        repository: process.env.GITHUB_REPOSITORY || 'aragon/app',
    });

    // 2. Format Output
    let summary = '';

    // Tickets referenced by this release that are not completed/canceled yet. Placed
    // first so reviewers see un-QA'd work before merging; the release is never blocked.
    if (openIssues.length > 0) {
        summary += '## ⚠️ Open tickets\n';
        openIssues.forEach(
            (issue) =>
                (summary += `- [${issue.id}: ${issue.title}](${issue.url}) — ${issue.state.name}\n`),
        );
        summary += '\n';
    }

    if (features.length > 0) {
        summary += '## Features\n';
        features.forEach((item) => (summary += `- ${item}\n`));
        summary += '\n';
    }

    if (fixes.length > 0) {
        summary += '## Fixes\n';
        fixes.forEach((item) => (summary += `- ${item}\n`));
        summary += '\n';
    }

    if (others.length > 0) {
        summary += '## Other Changes\n';
        others.forEach((item) => (summary += `- ${item}\n`));
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
    generateSummary,
    readPathFilter,
    resolveCommitTitle,
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
