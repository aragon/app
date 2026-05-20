#!/usr/bin/env node
// Drains the local guardrail buffer into the shared, tracked hits file.
// Called from .husky/pre-commit so each developer's events land in their PR.
//
// - Reads .agents/metrics/.buffer.jsonl (gitignored, per-developer exhaust)
// - Appends to .agents/metrics/hits.jsonl (tracked, team-shared)
// - Truncates the buffer
// - Stages the shared file so it joins the in-flight commit
//
// Failures are silent and non-fatal: this is telemetry, not a gate.

import { execSync } from 'node:child_process';
import {
    appendFileSync,
    existsSync,
    readFileSync,
    statSync,
    writeFileSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const BUFFER = resolve(REPO_ROOT, '.agents/metrics/.buffer.jsonl');
const SHARED = resolve(REPO_ROOT, '.agents/metrics/hits.jsonl');

const main = () => {
    if (!existsSync(BUFFER) || statSync(BUFFER).size === 0) {
        return;
    }

    const buffered = readFileSync(BUFFER, 'utf8');
    if (!buffered.trim()) {
        writeFileSync(BUFFER, '');
        return;
    }

    appendFileSync(SHARED, buffered);
    writeFileSync(BUFFER, '');

    try {
        execSync(`git add ${SHARED}`, { stdio: 'ignore' });
    } catch {
        // Outside a git tree (CI, sandbox) — stage step is optional.
    }
};

try {
    main();
} catch (err) {
    process.stderr.write(`guardrails:record warning: ${err.message}\n`);
}
