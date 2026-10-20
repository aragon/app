// Merges the per-workspace unit-test coverage into one repo-wide report.
//
// Every workspace's `test:coverage` writes an istanbul `coverage/coverage-final.json` (jest's
// default `json` reporter, vitest's `json` reporter). This script gathers those files under
// `coverage/raw/<workspace>.json`, prints a per-workspace table and lets nyc merge them into
// `coverage/` at the root: a console summary, `lcov.info` for coverage services and a browsable
// `lcov-report/index.html`.
//
// Run `pnpm test:coverage` for the full flow, or `pnpm coverage:report` to rebuild the report
// from whatever workspace coverage is already on disk.

import {
    copyFileSync,
    globSync,
    mkdirSync,
    readFileSync,
    rmSync,
} from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import istanbulCoverage from 'istanbul-lib-coverage';
import NYC from 'nyc';

const { createCoverageMap } = istanbulCoverage;

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const reportDir = join(root, 'coverage');
const rawDir = join(reportDir, 'raw');

const inputs = globSync('{apps,packages}/*/coverage/coverage-final.json', {
    cwd: root,
}).sort();

if (inputs.length === 0) {
    console.error(
        'No workspace coverage found: run `pnpm test:coverage` first.',
    );
    process.exit(1);
}

// Start from a clean report: the html reporter only adds files, so a previous run with a
// different set of workspaces would otherwise leave stale pages behind.
rmSync(reportDir, { recursive: true, force: true });
mkdirSync(rawDir, { recursive: true });

const rows = inputs.map((input) => {
    // `apps/app/coverage/coverage-final.json` -> `app`
    const workspace = basename(dirname(dirname(input)));
    const source = join(root, input);
    copyFileSync(source, join(rawDir, `${workspace}.json`));

    const map = createCoverageMap(JSON.parse(readFileSync(source, 'utf8')));
    const summary = map.getCoverageSummary();
    return {
        workspace,
        files: map.files().length,
        statements: summary.statements.pct,
        branches: summary.branches.pct,
        functions: summary.functions.pct,
        lines: summary.lines.pct,
    };
});

console.table(rows);

await new NYC({
    cwd: root,
    tempDir: rawDir,
    reportDir,
    reporter: ['text-summary', 'lcov'],
}).report();
