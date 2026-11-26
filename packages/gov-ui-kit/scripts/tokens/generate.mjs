#!/usr/bin/env node
// The token generator. It reads the DTCG 2025.10 token source in design-system/tokens/source/ and writes:
//
// - src/theme/tokens/primitives/*.css   the kit's primitive CSS (Tailwind `@theme` blocks) and its barrel
// - the token source itself, normalised: every colour carries the `hex` of its components
//
// Usage: `node scripts/tokens/generate.mjs [--check]`
//   (none)    validate the source, write the files
//   --check   validate the source, fail when a file on disk is stale (writes nothing)
// See design-system/tokens/README.md.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJson, readTokens, withColorHex } from './lib/dtcg.mjs';
import { renderPrimitives } from './lib/primitives.mjs';

const kitRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const defaultSourceDir = resolve(kitRoot, 'design-system/tokens/source');

// Every file the generator owns: absolute path -> text.
export const generate = (sourceDir = defaultSourceDir) => {
    const sourceFile = resolve(sourceDir, 'primitives.tokens.json');
    const document = readJson(sourceFile);
    const css = renderPrimitives({
        tokens: readTokens(document, readJson(resolve(sourceDir, 'schema/format.2025.10.json'))),
        config: readJson(resolve(sourceDir, 'primitives.config.json')),
    });
    return new Map([
        [sourceFile, `${JSON.stringify(withColorHex(document), null, 4)}\n`],
        ...[...css].map(([file, text]) => [resolve(kitRoot, file), text]),
    ]);
};

// The files whose copy on disk is missing or differs.
export const staleFiles = (files) =>
    [...files.keys()].filter((file) => {
        try {
            return readFileSync(file, 'utf8') !== files.get(file);
        } catch {
            return true;
        }
    });

if (import.meta.main) {
    try {
        const files = generate();
        const stale = staleFiles(files);
        if (process.argv.includes('--check')) {
            if (stale.length > 0) {
                const names = stale.map((file) => relative(kitRoot, file)).join(', ');
                throw new Error(`stale files: ${names}. Run \`pnpm tokens:generate\`.`);
            }
            console.log(`tokens: ok (${files.size} files up to date)`);
        } else {
            for (const file of stale) {
                writeFileSync(file, files.get(file));
            }
            console.log(`tokens: ${files.size} files, ${stale.length} written`);
        }
    } catch (error) {
        console.error(`tokens: ${error.message}`);
        process.exit(1);
    }
}
