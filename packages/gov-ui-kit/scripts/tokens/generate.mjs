#!/usr/bin/env node
// The token generator. It reads the DTCG 2025.10 token source in design-system/tokens/source/ and writes:
//
// - src/theme/tokens/<layer>/*.css      the kit's token CSS (Tailwind `@theme` blocks) and a barrel, per layer; a
//                                       layer's `dir` puts them elsewhere (design-system/tokens/app/: app-only tokens)
// - design-system/tokens/preview/*.css  the preview modes: the tokens each mode changes (not in the npm package)
// - the token source itself, normalised: every colour carries the `hex` of its components
//
// The default theme is every `*.tokens.json` directly in the source folder; every `*.config.json` there is a layer,
// which lays out the tokens of the `*.tokens.json` of the same name.
//
// Usage: `node scripts/tokens/generate.mjs [--check]`
//   (none)    validate the source, write the files
//   --check   validate the source, fail when a file on disk is stale (writes nothing)
// See design-system/tokens/README.md.

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderCss } from './lib/css.mjs';
import { readJson, readTokens, tokenPaths, withColorHex } from './lib/dtcg.mjs';

const kitRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const defaultSourceDir = resolve(kitRoot, 'design-system/tokens/source');

// Every file the generator owns: absolute path -> text.
export const generate = (sourceDir = defaultSourceDir) => {
    const schema = readJson(resolve(sourceDir, 'schema/format.2025.10.json'));
    const documents = new Map(); // file -> token document, as read
    const document = (name) => {
        const file = resolve(sourceDir, name);
        return documents.get(file) ?? documents.set(file, readJson(file)).get(file);
    };
    const suffixed = (suffix) =>
        readdirSync(sourceDir)
            .filter((name) => name.endsWith(suffix))
            .sort()
            .map((name) => [name.slice(0, -suffix.length), name]);
    const defaults = suffixed('.tokens.json').map(([, name]) => document(name));
    const css = renderCss({
        tokens: readTokens(schema, defaults),
        layers: Object.fromEntries(
            suffixed('.config.json').map(([layer, name]) => [layer, readJson(resolve(sourceDir, name))]),
        ),
        layerPaths: (layer) => tokenPaths(document(`${layer}.tokens.json`)),
        modeTokens: (names) => readTokens(schema, defaults, names.map(document)),
    });
    return new Map([
        ...[...documents].map(([file, json]) => [file, `${JSON.stringify(withColorHex(json), null, 4)}\n`]),
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
                mkdirSync(dirname(file), { recursive: true });
                writeFileSync(file, files.get(file));
            }
            console.log(`tokens: ${files.size} files, ${stale.length} written`);
        }
    } catch (error) {
        console.error(`tokens: ${error.message}`);
        process.exit(1);
    }
}
