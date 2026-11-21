#!/usr/bin/env node
// Applies design-system/tokens/semantic-colors.component-map.json to the component sources, mechanically (the line
// edit itself is shared with the app's map, apps/app/scripts/semanticColors, in lib/semantic-class-scan.mjs):
//
// - For every entry with a non-null `new`, the occurrence of `old` on `line` is replaced by `new`. When a line holds
//   the same `old` several times, the entries are in column order (null entries included), so the n-th entry with that
//   `old` on that line is the n-th occurrence in the line. Entries with `new: null` are left as they are.
// - An occurrence only counts when it is a whole class (the same boundaries as the validator's extractor), and the
//   number of occurrences on the line must equal the number of entries for it: any mismatch fails before a single
//   file is written.
// - Afterwards the map gets `applied: { base, lines }` (base = the commit whose sources the line numbers describe), which
//   switches scripts/validate-semantic-component-map.mjs to checking the applied state per file (every converted `new`
//   present, no converted `old` left). Then run `pnpm lint` (Biome): it re-sorts the renamed classes and re-wraps lines
//   that grew past 120 columns, which is why the applied check no longer relies on line numbers.
// - Test assertions on colour classes (`testsToUpdate`) and stories (`storiesToUpdate`) are not touched.
//
// Run `pnpm tokens:semantic:map:check` first: it proves the map matches the sources and keeps every default-theme
// colour. Usage: node scripts/apply-semantic-component-map.mjs [--dry-run]

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyEntries } from './lib/semantic-class-scan.mjs';

const kitRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const mapPath = resolve(kitRoot, 'design-system/tokens/semantic-colors.component-map.json');
const map = JSON.parse(readFileSync(mapPath, 'utf8'));
const dryRun = process.argv.includes('--dry-run');

if (map.applied != null) {
    console.error(`apply-semantic-component-map: the map is already applied on ${map.applied.base}`);
    process.exit(1);
}

const errors = [];
const output = new Map();
let replaced = 0;
let skipped = 0;
for (const [file, entries] of Object.entries(map.files)) {
    const result = applyEntries(file, readFileSync(resolve(kitRoot, file), 'utf8'), entries);
    errors.push(...result.errors);
    replaced += result.replaced;
    skipped += result.skipped;
    output.set(file, result.text);
}

if (errors.length > 0) {
    console.error(`apply-semantic-component-map: ${errors.length} mismatch(es), nothing written`);
    for (const e of errors) {
        console.error(`  - ${e}`);
    }
    process.exit(1);
}
const expected = Object.values(map.files)
    .flat()
    .filter((e) => e.new != null).length;
if (replaced !== expected) {
    console.error(`apply-semantic-component-map: replaced ${replaced}, map converts ${expected}; nothing written`);
    process.exit(1);
}
if (!dryRun) {
    for (const [file, text] of output) {
        writeFileSync(resolve(kitRoot, file), text);
    }
    const base = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: kitRoot, encoding: 'utf8' }).trim();
    const lines = `Line numbers describe the sources at ${base}, before applying; Biome then re-sorted and re-wrapped edited lines.`;
    // Insert "applied" right after $description, keeping the file's formatting.
    const { $description, ...rest } = map;
    writeFileSync(mapPath, `${JSON.stringify({ $description, applied: { base, lines }, ...rest }, null, 4)}\n`);
}
console.log(
    `apply-semantic-component-map: ${dryRun ? 'would replace' : 'replaced'} ${replaced} classes in ${output.size} files, ` +
        `left ${skipped} unconverted${dryRun ? '' : '; map marked as applied'}`,
);
