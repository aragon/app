#!/usr/bin/env node
// The one token generator. It reads the DTCG 2025.10 token source in design-system/tokens/source/ and writes every
// token CSS output:
//
// - src/theme/tokens/primitives/*.css   the kit's primitive CSS (Tailwind `@theme` blocks) and its barrel
// - src/theme/tokens/semantic/colors.css   the semantic colour layer (three value sets and its utilities)
// - .design-sync/generated/govkit-primitives.css   the app's flattened artifact (primitives plus the app overrides)
//
// Usage: `node scripts/tokens/generate.mjs [--check | --report] [--source <dir>]`
//   (none)    validate the source, write the outputs
//   --check   validate the source, fail when an output on disk is stale (writes nothing)
//   --report  validate the source, print the semantic fallback / verified-value report (writes nothing)
//   --source  read the source from another directory (a scratch copy), outputs stay in the repo
// See design-system/tokens/README.md.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderAppArtifact } from './lib/app.mjs';
import { collectTokens, createSchemaValidator, mergeSets, readJson, resolveToken } from './lib/dtcg.mjs';
import { primitiveFiles, renderPrimitives } from './lib/primitives.mjs';
import { renderSemantic } from './lib/semantic.mjs';

const kitRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const repoRoot = resolve(kitRoot, '../..');
const defaultSourceDir = resolve(kitRoot, 'design-system/tokens/source');
const SEMANTIC_OUTPUT = 'src/theme/tokens/semantic/colors.css';

const fail = (message) => {
    throw new Error(message);
};

// Validates the whole source: every document against the published DTCG schema, every alias in every mode (missing
// target, cycle, type mismatch), every resolved value against its own type.
const loadSource = (sourceDir) => {
    const validator = createSchemaValidator(resolve(sourceDir, 'schema/format.2025.10.json'));
    const primitivesConfig = readJson(resolve(sourceDir, 'primitives.config.json'));
    const semanticConfig = readJson(resolve(sourceDir, 'semantic.config.json'));
    const documents = {
        primitives: readJson(resolve(sourceDir, 'primitives.tokens.json')),
        palette: readJson(resolve(sourceDir, 'palette.tokens.json')),
    };
    for (const [mode, { file }] of Object.entries(semanticConfig.modes)) {
        documents[mode] = readJson(resolve(sourceDir, file));
    }
    const entries = {};
    for (const [label, document] of Object.entries(documents)) {
        validator.validateDocument(document, label);
        entries[label] = collectTokens(document);
    }
    const modes = Object.fromEntries(Object.keys(semanticConfig.modes).map((mode) => [mode, entries[mode]]));
    for (const mode of Object.keys(modes)) {
        const view = mergeSets({ primitives: entries.primitives, palette: entries.palette, [mode]: entries[mode] });
        for (const [path, entry] of view) {
            validator.validateValue(entry.type, resolveToken(view, path).value, `${mode}: ${path}`);
        }
    }
    return {
        primitives: entries.primitives,
        palette: entries.palette,
        modes,
        primitivesConfig,
        semanticConfig,
        cssDir: resolve(sourceDir, 'css'),
    };
};

// Every output: repo-relative path -> text. `semantic` also carries the report data.
export const generateAll = ({ sourceDir = defaultSourceDir } = {}) => {
    const source = loadSource(sourceDir);
    const { bodies, varOf } = renderPrimitives({
        tokens: source.primitives,
        config: source.primitivesConfig,
        cssDir: source.cssDir,
    });
    // The app artifact writes multi-value declarations (shadow layers, the font stack) on one line.
    const { bodies: flatBodies } = renderPrimitives({
        tokens: source.primitives,
        config: source.primitivesConfig,
        cssDir: source.cssDir,
        flat: true,
    });
    const outputs = new Map();
    for (const [file, text] of primitiveFiles(bodies)) {
        outputs.set(relative(repoRoot, resolve(kitRoot, file)), text);
    }
    const semantic = renderSemantic({
        kitRoot,
        outputFile: resolve(kitRoot, SEMANTIC_OUTPUT),
        palette: source.palette,
        primitives: source.primitives,
        modes: source.modes,
        config: source.semanticConfig,
        varOf,
        fail,
    });
    outputs.set(relative(repoRoot, resolve(kitRoot, SEMANTIC_OUTPUT)), semantic.css);
    const app = source.primitivesConfig.app;
    outputs.set(app.output, renderAppArtifact({ bodies: flatBodies, appConfig: app, repoRoot }));
    return { outputs, semantic, source };
};

const report = ({ semantic, source }) => {
    const { tokens, utilities, paletteHex, fallbacks } = semantic;
    const verified = [...tokens.values()].filter((token) => token.today.extensions?.evidence != null);
    console.log(`${tokens.size} tokens, ${utilities.length} utilities, ${paletteHex.size} palette entries`);
    console.log(`today: ${verified.length} verified from code, ${fallbacks.length} by fallback (unverified)`);
    console.log('\nFallback today values (token | designer light | today | note):');
    for (const f of fallbacks) {
        console.log(`${f.name} | ${f.figma} | ${f.parity} | ${f.note}`);
    }
    console.log('\nVerified today values (token | value | evidence):');
    for (const [name, token] of tokens) {
        const { extensions, value } = token.today;
        if (extensions?.evidence != null) {
            const shown = typeof value === 'string' ? value : (extensions.mix?.of ?? JSON.stringify(value));
            console.log(
                `${name} | ${shown} | ${extensions.evidence}${extensions.conflict ? ` | CONFLICT: ${extensions.conflict}` : ''}`,
            );
        }
    }
    return source;
};

if (import.meta.main) {
    const args = process.argv.slice(2);
    const sourceIndex = args.indexOf('--source');
    const sourceDir = sourceIndex === -1 ? undefined : resolve(args[sourceIndex + 1]);
    const mode = args.find((arg) => arg === '--check' || arg === '--report');
    try {
        const generated = generateAll({ sourceDir });
        if (mode === '--report') {
            report(generated);
        } else if (mode === '--check') {
            const stale = [...generated.outputs]
                .filter(([file, text]) => {
                    try {
                        return readFileSync(resolve(repoRoot, file), 'utf8') !== text;
                    } catch {
                        return true;
                    }
                })
                .map(([file]) => file);
            if (stale.length > 0) {
                throw new Error(
                    `stale generated files: ${stale.join(', ')}. Run \`pnpm tokens:generate\` and commit the result.`,
                );
            }
            console.log(
                `tokens: ok (${generated.outputs.size} files up to date, ${generated.semantic.tokens.size} semantic tokens, ${generated.semantic.utilities.length} utilities)`,
            );
        } else {
            for (const [file, text] of generated.outputs) {
                mkdirSync(dirname(resolve(repoRoot, file)), { recursive: true });
                writeFileSync(resolve(repoRoot, file), text);
            }
            console.log(
                `tokens: wrote ${generated.outputs.size} files (${generated.semantic.tokens.size} semantic tokens)`,
            );
        }
    } catch (error) {
        console.error(`tokens: ${error.message}`);
        process.exit(1);
    }
}
