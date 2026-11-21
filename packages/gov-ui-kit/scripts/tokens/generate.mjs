#!/usr/bin/env node
// The one token generator. It reads the DTCG 2025.10 token source in design-system/tokens/source/ and writes every
// token CSS output:
//
// - src/theme/tokens/primitives/*.css   the kit's primitive CSS (Tailwind `@theme` blocks) and its barrel
// - src/theme/tokens/semantic/colors.css   the semantic colour layer (three value sets and its utilities)
// - src/theme/tokens/typography.css   the semantic typography layer (roles, exceptions, modifiers and their utilities)
//   and src/core/types/typographyStyles.ts (the style names as a TypeScript union)
// - .design-sync/generated/govkit-primitives.css   the app's flattened artifact (primitives plus the app overrides)
//
// The semantic colour layer is optional: it is generated when the source has `semantic.config.json`, which then
// requires `palette.tokens.json` and every mode file the config names. Without it the source is primitives only and
// the semantic output is not written; a palette or mode file without the config is an error, not ignored.
// The typography layer follows the same rule with `typography.config.json` and the mode files it names.
//
// Usage: `node scripts/tokens/generate.mjs [--check | --report] [--source <dir>]`
//   (none)    validate the source, write the outputs
//   --check   validate the source, fail when an output on disk is stale (writes nothing)
//   --report  validate the source, print the semantic fallback / verified-value report (writes nothing)
//   --source  read the source from another directory (a scratch copy), outputs stay in the repo
// See design-system/tokens/README.md.

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderAppArtifact } from './lib/app.mjs';
import { collectTokens, createSchemaValidator, mergeSets, readJson, resolveToken } from './lib/dtcg.mjs';
import { primitiveFiles, renderPrimitives } from './lib/primitives.mjs';
import { renderSemantic } from './lib/semantic.mjs';
import { renderTypography } from './lib/typography.mjs';

const kitRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const repoRoot = resolve(kitRoot, '../..');
const defaultSourceDir = resolve(kitRoot, 'design-system/tokens/source');
const SEMANTIC_OUTPUT = 'src/theme/tokens/semantic/colors.css';
const SEMANTIC_CONFIG = 'semantic.config.json';
const PALETTE = 'palette.tokens.json';
const TYPOGRAPHY_CONFIG = 'typography.config.json';

const fail = (message) => {
    throw new Error(message);
};

// The semantic config, or null for a primitives-only source. Semantic token files without the config fail.
const readSemanticConfig = (sourceDir) => {
    const file = resolve(sourceDir, SEMANTIC_CONFIG);
    if (existsSync(file)) {
        return readJson(file);
    }
    const strays = readdirSync(sourceDir).filter(
        (name) => name === PALETTE || /^semantic\..+\.tokens\.json$/.test(name),
    );
    if (strays.length > 0) {
        fail(`${strays.join(', ')} without ${SEMANTIC_CONFIG}: add the config or remove the semantic files`);
    }
    return null;
};

// The typography config, or null without a typography layer. Typography mode files without the config fail.
const readTypographyConfig = (sourceDir) => {
    const file = resolve(sourceDir, TYPOGRAPHY_CONFIG);
    if (existsSync(file)) {
        return readJson(file);
    }
    const strays = readdirSync(sourceDir).filter((name) => /^typography\..+\.tokens\.json$/.test(name));
    if (strays.length > 0) {
        fail(`${strays.join(', ')} without ${TYPOGRAPHY_CONFIG}: add the config or remove the typography files`);
    }
    return null;
};

// Validates the whole source: every document against the published DTCG schema, every alias in every mode (missing
// target, cycle, type mismatch), every resolved value against its own type. A primitives-only source is validated as
// one view of the primitives.
const loadSource = (sourceDir) => {
    const validator = createSchemaValidator(resolve(sourceDir, 'schema/format.2025.10.json'));
    const primitivesConfig = readJson(resolve(sourceDir, 'primitives.config.json'));
    const semanticConfig = readSemanticConfig(sourceDir);
    const typographyConfig = readTypographyConfig(sourceDir);
    const typographyModeNames = typographyConfig == null ? [] : Object.keys(typographyConfig.modes);
    const modeNames = semanticConfig == null ? [] : Object.keys(semanticConfig.modes);
    const documents = {
        primitives: readJson(resolve(sourceDir, 'primitives.tokens.json')),
    };
    if (semanticConfig != null) {
        documents.palette = readJson(resolve(sourceDir, PALETTE));
        for (const [mode, { file }] of Object.entries(semanticConfig.modes)) {
            documents[mode] = readJson(resolve(sourceDir, file));
        }
    }
    for (const [mode, { file }] of Object.entries(typographyConfig?.modes ?? {})) {
        documents[`typography.${mode}`] = readJson(resolve(sourceDir, file));
    }
    const entries = {};
    for (const [label, document] of Object.entries(documents)) {
        validator.validateDocument(document, label);
        entries[label] = collectTokens(document);
    }
    const modes = Object.fromEntries(modeNames.map((mode) => [mode, entries[mode]]));
    const views =
        modeNames.length === 0
            ? [['primitives', entries.primitives]]
            : modeNames.map((mode) => [
                  mode,
                  mergeSets({ primitives: entries.primitives, palette: entries.palette, [mode]: entries[mode] }),
              ]);
    for (const mode of typographyModeNames) {
        views.push([
            `typography.${mode}`,
            mergeSets({ primitives: entries.primitives, [`typography.${mode}`]: entries[`typography.${mode}`] }),
        ]);
    }
    for (const [label, view] of views) {
        for (const [path, entry] of view) {
            validator.validateValue(entry.type, resolveToken(view, path).value, `${label}: ${path}`);
        }
    }
    return {
        primitives: entries.primitives,
        palette: entries.palette,
        modes,
        primitivesConfig,
        semanticConfig,
        typography: Object.fromEntries(typographyModeNames.map((mode) => [mode, entries[`typography.${mode}`]])),
        typographyConfig,
        cssDir: resolve(sourceDir, 'css'),
    };
};

// Every output: repo-relative path -> text. `semantic` also carries the report data (null without a semantic layer).
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
    const semantic =
        source.semanticConfig == null
            ? null
            : renderSemantic({
                  kitRoot,
                  outputFile: resolve(kitRoot, SEMANTIC_OUTPUT),
                  palette: source.palette,
                  primitives: source.primitives,
                  modes: source.modes,
                  config: source.semanticConfig,
                  varOf,
                  fail,
              });
    if (semantic != null) {
        outputs.set(relative(repoRoot, resolve(kitRoot, SEMANTIC_OUTPUT)), semantic.css);
    }
    const typography =
        source.typographyConfig == null
            ? null
            : renderTypography({
                  kitRoot,
                  outputFile: resolve(kitRoot, source.typographyConfig.output),
                  primitives: source.primitives,
                  modes: source.typography,
                  config: source.typographyConfig,
                  varOf,
                  fail,
              });
    if (typography != null) {
        outputs.set(relative(repoRoot, resolve(kitRoot, source.typographyConfig.output)), typography.css);
        outputs.set(relative(repoRoot, resolve(kitRoot, source.typographyConfig.typesOutput)), typography.ts);
    }
    const app = source.primitivesConfig.app;
    outputs.set(app.output, renderAppArtifact({ bodies: flatBodies, appConfig: app, repoRoot }));
    return { outputs, semantic, typography, source };
};

const report = ({ semantic, source }) => {
    if (semantic == null) {
        console.log(`no semantic layer (no ${SEMANTIC_CONFIG} in the source): nothing to report`);
        return source;
    }
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
            const { semantic } = generated;
            console.log(
                `tokens: ok (${generated.outputs.size} files up to date, ${semantic == null ? 'no semantic layer' : `${semantic.tokens.size} semantic tokens, ${semantic.utilities.length} utilities`})`,
            );
        } else {
            for (const [file, text] of generated.outputs) {
                mkdirSync(dirname(resolve(repoRoot, file)), { recursive: true });
                writeFileSync(resolve(repoRoot, file), text);
            }
            const { semantic } = generated;
            console.log(
                `tokens: wrote ${generated.outputs.size} files (${semantic == null ? 'no semantic layer' : `${semantic.tokens.size} semantic tokens`})`,
            );
        }
    } catch (error) {
        console.error(`tokens: ${error.message}`);
        process.exit(1);
    }
}
