#!/usr/bin/env node
// The token generator. It reads the DTCG 2025.10 token source in design-system/tokens/source/ and writes the kit's
// primitive CSS, src/theme/tokens/primitives/*.css (Tailwind `@theme` blocks) and its barrel.
//
// Usage: `node scripts/tokens/generate.mjs [--check]`
//   (none)    validate the source, write the CSS
//   --check   validate the source, fail when a CSS file on disk is stale (writes nothing)
// See design-system/tokens/README.md.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJson, readTokens } from './lib/dtcg.mjs';
import { renderPrimitives } from './lib/primitives.mjs';

const kitRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const defaultSourceDir = resolve(kitRoot, 'design-system/tokens/source');

// Every generated file: kit-relative path -> text.
export const generate = (sourceDir = defaultSourceDir) =>
    renderPrimitives({
        tokens: readTokens(
            resolve(sourceDir, 'primitives.tokens.json'),
            resolve(sourceDir, 'schema/format.2025.10.json'),
        ),
        config: readJson(resolve(sourceDir, 'primitives.config.json')),
    });

// The generated files whose copy on disk is missing or differs.
export const staleFiles = (files) =>
    [...files.keys()].filter((file) => {
        try {
            return readFileSync(resolve(kitRoot, file), 'utf8') !== files.get(file);
        } catch {
            return true;
        }
    });

if (import.meta.main) {
    try {
        const files = generate();
        if (process.argv.includes('--check')) {
            const stale = staleFiles(files);
            if (stale.length > 0) {
                throw new Error(`stale generated files: ${stale.join(', ')}. Run \`pnpm tokens:generate\`.`);
            }
            console.log(`tokens: ok (${files.size} files up to date)`);
        } else {
            for (const [file, text] of files) {
                writeFileSync(resolve(kitRoot, file), text);
            }
            console.log(`tokens: wrote ${files.size} files`);
        }
    } catch (error) {
        console.error(`tokens: ${error.message}`);
        process.exit(1);
    }
}
