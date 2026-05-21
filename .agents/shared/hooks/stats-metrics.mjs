#!/usr/bin/env node
// Aggregates the shared guardrail hits file into a high-level summary.
// All math is done in deterministic JS, never by an LLM.
//
// Output answers the kill/keep question for the spike:
//   - which rules are actually firing
//   - how slow is the hook
//   - what is the total token cost

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(
    dirname(fileURLToPath(import.meta.url)),
    '..',
    '..',
    '..',
);
const SHARED = resolve(REPO_ROOT, '.agents/shared/metrics/hits.jsonl');

const percentile = (sorted, p) => {
    if (sorted.length === 0) {
        return 0;
    }
    const idx = Math.min(
        sorted.length - 1,
        Math.ceil((p / 100) * sorted.length) - 1,
    );
    return sorted[Math.max(0, idx)];
};

const formatBytes = (bytes) => {
    if (bytes < 1024) {
        return `${bytes}B`;
    }
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)}KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};

const main = () => {
    if (!existsSync(SHARED)) {
        process.stdout.write('No guardrail events recorded yet.\n');
        return;
    }

    const events = readFileSync(SHARED, 'utf8')
        .split('\n')
        .filter(Boolean)
        .map((line) => {
            try {
                return JSON.parse(line);
            } catch {
                return null;
            }
        })
        .filter(Boolean);

    if (events.length === 0) {
        process.stdout.write('No guardrail events recorded yet.\n');
        return;
    }

    const earliest = events.reduce(
        (min, event) => (event.ts < min ? event.ts : min),
        events[0].ts,
    );

    const byRule = new Map();
    for (const event of events) {
        const bucket = byRule.get(event.rule) ?? {
            hits: 0,
            elapsed: [],
            bytes: 0,
        };
        bucket.hits += 1;
        bucket.elapsed.push(event.elapsed_ms);
        bucket.bytes += event.bytes;
        byRule.set(event.rule, bucket);
    }

    const allElapsed = events
        .map((event) => event.elapsed_ms)
        .sort((a, b) => a - b);
    const totalBytes = events.reduce((sum, event) => sum + event.bytes, 0);

    const byDay = new Map();
    for (const event of events) {
        const day = event.ts.slice(0, 10);
        byDay.set(day, (byDay.get(day) ?? 0) + 1);
    }
    const last7 = [...byDay.entries()].sort().slice(-7);

    process.stdout.write(
        `Guardrail stats — ${events.length} events team-wide since ${earliest.slice(0, 10)}\n\n`,
    );

    process.stdout.write('Per-rule:\n');
    const ruleRows = [...byRule.entries()].sort(
        (a, b) => b[1].hits - a[1].hits,
    );
    for (const [name, bucket] of ruleRows) {
        const sorted = bucket.elapsed.sort((a, b) => a - b);
        const p50 = percentile(sorted, 50);
        const p95 = percentile(sorted, 95);
        const avgBytes = formatBytes(Math.round(bucket.bytes / bucket.hits));
        process.stdout.write(
            `  ${name.padEnd(28)} ${String(bucket.hits).padStart(5)} hits   p50=${p50}ms  p95=${p95}ms   avg=${avgBytes}\n`,
        );
    }

    process.stdout.write('\nLast 7 days:\n');
    for (const [day, count] of last7) {
        process.stdout.write(`  ${day}  ${count} events\n`);
    }

    process.stdout.write('\nLoader overhead:\n');
    process.stdout.write(`  total fires: ${events.length}\n`);
    process.stdout.write(
        `  elapsed:     p50=${percentile(allElapsed, 50)}ms   p95=${percentile(allElapsed, 95)}ms\n`,
    );
    process.stdout.write(`  bytes:       ${formatBytes(totalBytes)} total\n`);
};

main();
