const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { extractChangelogSection } = require('./readChangelog');

// Builds a release-PR summary from the CHANGELOG entries written by `changeset version`: one
// "## <package>@<version>" section per bumped package. Works for any release scope — runs after
// `changeset version` and before the release commit, so a bumped package is simply one whose
// package.json has an uncommitted change. (Its sibling, generateReleaseSummary.js, builds the
// commit-history summary used by flows that describe a release in terms of merged PRs instead.)

const run = (command, args, cwd) =>
    execFileSync(command, args, { cwd, maxBuffer: 64 * 1024 * 1024 })
        .toString()
        .trim();

const generateSummary = ({ core, scope, cwd = process.cwd() }) => {
    // 1. Map workspace package names to their directories.
    const workspaces = JSON.parse(
        run('pnpm', ['m', 'ls', '--json', '--depth', '-1'], cwd),
    );

    // 2. Keep the scoped packages bumped by `changeset version` (uncommitted package.json change).
    const bumpedPackages = scope
        .map((name) => workspaces.find((workspace) => workspace.name === name))
        .filter((workspace) => workspace != null)
        .filter((workspace) => {
            const manifest = path.join(workspace.path, 'package.json');
            return run('git', ['status', '--porcelain', '--', manifest], cwd);
        });

    // 3. Render each bumped package as its new version plus the matching CHANGELOG section.
    const sections = bumpedPackages.map((workspace) => {
        const { name, version } = JSON.parse(
            fs.readFileSync(path.join(workspace.path, 'package.json'), 'utf8'),
        );
        const changelog = fs.readFileSync(
            path.join(workspace.path, 'CHANGELOG.md'),
            'utf8',
        );
        const changes =
            extractChangelogSection(changelog, version) ?? 'No changes.';

        return `## ${name}@${version}\n\n${changes}`;
    });

    core.setOutput('summary', sections.join('\n\n') || 'No packages bumped.');
};

module.exports = { generateSummary };

// Standalone runner
if (require.main === module) {
    const scope = (process.env.SCOPE ?? '').split(/\s+/).filter(Boolean);
    if (scope.length === 0) {
        console.error('SCOPE is required.');
        process.exit(1);
    }

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
    try {
        generateSummary({ core, scope });
    } catch (err) {
        console.error('Failed to generate version summary:', err);
        process.exit(1);
    }
}
