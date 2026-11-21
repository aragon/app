#!/usr/bin/env node
// Applies design-system/semantic-colors.app-map.json to the sources, mechanically, with the line editor the kit's map
// uses (packages/gov-ui-kit/scripts/lib/semantic-class-scan.mjs, `applyEntries`):
//
// - `files`: every entry with a non-null `new` replaces the whole-class occurrence of `old` on its line; the n-th entry
//   with the same `old` on a line is its n-th occurrence (null entries included).
// - `testsAssertingColourClasses`: the listed assertions with a non-null `new` take the class the component now renders.
// - `nonClassReferences`: colour literals with a non-null `new` (a `var(--guk-…)`) replace the literal on its line.
//
// Any mismatch (a line that does not hold the expected occurrences) fails before a single file is written. Afterwards
// the map gets `applied: { base, lines }` (base = the commit whose sources the line numbers describe), which switches
// validate-app-map.mjs to checking the applied state. Then run `pnpm lint` (Biome re-sorts the renamed classes and
// re-wraps long lines) and `pnpm colors:map:check` again.
//
// Run `pnpm colors:map:check` first. Usage: node scripts/semanticColors/apply-app-map.mjs [--dry-run]

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyEntries } from '../../../../packages/gov-ui-kit/scripts/lib/semantic-class-scan.mjs';

const repoRoot = resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../../../..',
);
const mapPath = resolve(
    repoRoot,
    'apps/app/design-system/semantic-colors.app-map.json',
);
const map = JSON.parse(readFileSync(mapPath, 'utf8'));
const dryRun = process.argv.includes('--dry-run');

if (map.applied != null) {
    console.error(
        `apply-app-map: the map is already applied on ${map.applied.base}`,
    );
    process.exit(1);
}

// file -> entries ({ line, old, new }) from the three sections.
const perFile = new Map();
const add = (file, entry) =>
    perFile.set(file, [...(perFile.get(file) ?? []), entry]);
for (const [file, entries] of Object.entries(map.files)) {
    for (const e of entries) {
        add(file, { line: e.line, old: e.old, new: e.new });
    }
}
for (const [file, entries] of Object.entries(
    map.testsAssertingColourClasses ?? {},
)) {
    for (const e of entries) {
        add(file, { line: e.line, old: e.old, new: e.new });
    }
}
// Only the converted literals: kept ones may sit inside arbitrary values (`text-[#000000]`), not on class boundaries.
for (const r of (map.nonClassReferences ?? []).filter((x) => x.new != null)) {
    add(r.file, { line: r.line, old: r.value, new: r.new });
}

const errors = [];
const output = new Map();
let replaced = 0;
let skipped = 0;
for (const [file, entries] of perFile) {
    const result = applyEntries(
        file,
        readFileSync(resolve(repoRoot, file), 'utf8'),
        entries,
    );
    errors.push(...result.errors);
    replaced += result.replaced;
    skipped += result.skipped;
    if (result.replaced > 0) {
        output.set(file, result.text);
    }
}
if (errors.length > 0) {
    console.error(
        `apply-app-map: ${errors.length} mismatch(es), nothing written`,
    );
    for (const e of errors) {
        console.error(`  - ${e}`);
    }
    process.exit(1);
}
const expected = [...perFile.values()]
    .flat()
    .filter((e) => e.new != null).length;
if (replaced !== expected) {
    console.error(
        `apply-app-map: replaced ${replaced}, map converts ${expected}; nothing written`,
    );
    process.exit(1);
}
if (!dryRun) {
    for (const [file, text] of output) {
        writeFileSync(resolve(repoRoot, file), text);
    }
    const base = execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
        cwd: repoRoot,
        encoding: 'utf8',
    }).trim();
    const lines = `Line numbers describe the sources at ${base}, before applying; Biome then re-sorted and re-wrapped edited lines.`;
    const { $description, ...rest } = map;
    writeFileSync(
        mapPath,
        `${JSON.stringify({ $description, applied: { base, lines }, ...rest }, null, 4)}\n`,
    );
}
console.log(
    `apply-app-map: ${dryRun ? 'would replace' : 'replaced'} ${replaced} classes and colour literals in ${output.size} files, ` +
        `left ${skipped} unconverted${dryRun ? '' : '; map marked as applied'}`,
);
