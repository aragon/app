#!/usr/bin/env node
// The one token generator. It reads the DTCG 2025.10 token source in design-system/tokens/source/ and writes every
// token CSS output:
//
// - src/theme/tokens/primitives/*.css   the kit's primitive CSS (Tailwind `@theme` blocks) and its barrel
// - src/theme/tokens/typography.css   the semantic typography layer (roles, exceptions, modifiers and their utilities)
//   and src/core/types/typographyStyles.ts (the style names as a TypeScript union)
// - .design-sync/generated/govkit-primitives.css   the app's flattened artifact (primitives plus the app overrides)
//
// The typography layer is optional: it is generated when the source has `typography.config.json`, which then names its
// mode files; a typography mode file without the config is an error, not ignored.
//
// Usage: `node scripts/tokens/generate.mjs [--check | --report] [--source <dir>]`
//   (none)    validate the source, write the outputs
//   --check   validate the source, fail when an output on disk is stale (writes nothing)
//   --report  validate the source, print the typography report (writes nothing)
//   --source  read the source from another directory (a scratch copy), outputs stay in the repo
// See design-system/tokens/README.md.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderAppArtifact } from './lib/app.mjs';
import { collectTokens, createSchemaValidator, mergeSets, readJson, resolveToken } from './lib/dtcg.mjs';
import { primitiveFiles, renderPrimitives } from './lib/primitives.mjs';
import { renderTypography } from './lib/typography.mjs';
import { typographyReport } from './lib/typographyReport.mjs';

const kitRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const repoRoot = resolve(kitRoot, '../..');
const defaultSourceDir = resolve(kitRoot, 'design-system/tokens/source');
const TYPOGRAPHY_CONFIG = 'typography.config.json';

const fail = (message) => {
    throw new Error(message);
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

// Validates the source: every document against the published DTCG schema, every alias in every mode (missing target,
// cycle, type mismatch), every resolved value against its own type.
const loadSource = (sourceDir) => {
    const validator = createSchemaValidator(resolve(sourceDir, 'schema/format.2025.10.json'));
    const document = readJson(resolve(sourceDir, 'primitives.tokens.json'));
    validator.validateDocument(document, 'primitives');
    const primitives = collectTokens(document);
    for (const [path, entry] of primitives) {
        validator.validateValue(entry.type, resolveToken(primitives, path).value, `primitives: ${path}`);
    }
    const typographyConfig = readTypographyConfig(sourceDir);
    const typography = {};
    const typographyDocuments = {};
    for (const [mode, { file }] of Object.entries(typographyConfig?.modes ?? {})) {
        const label = `typography.${mode}`;
        const modeDocument = readJson(resolve(sourceDir, file));
        validator.validateDocument(modeDocument, label);
        typographyDocuments[mode] = modeDocument;
        typography[mode] = collectTokens(modeDocument);
        const view = mergeSets({ primitives, [label]: typography[mode] });
        for (const [path, entry] of view) {
            validator.validateValue(entry.type, resolveToken(view, path).value, `${label}: ${path}`);
        }
    }
    return {
        primitives,
        primitivesConfig: readJson(resolve(sourceDir, 'primitives.config.json')),
        typography,
        typographyToday: typographyDocuments.today,
        typographyConfig,
        cssDir: resolve(sourceDir, 'css'),
    };
};

// Every output: repo-relative path -> text.
export const generateAll = ({ sourceDir = defaultSourceDir } = {}) => {
    const source = loadSource(sourceDir);
    const { primitives, primitivesConfig, cssDir } = source;
    const { bodies, varOf } = renderPrimitives({ tokens: primitives, config: primitivesConfig, cssDir });
    // The app artifact writes multi-value declarations (shadow layers, the font stack) on one line.
    const { bodies: flatBodies } = renderPrimitives({
        tokens: primitives,
        config: primitivesConfig,
        cssDir,
        flat: true,
    });
    const outputs = new Map();
    // Formatted with the repo's Biome config (as the typography outputs are), so a value Biome wraps differently from
    // the generator's own wrapping (a short font stack) still passes `lint:check` and `--check` stays byte-exact.
    for (const [file, text] of primitiveFiles(bodies)) {
        const path = resolve(kitRoot, file);
        const formatted = execFileSync(
            resolve(kitRoot, 'node_modules/.bin/biome'),
            ['format', `--stdin-file-path=${path}`],
            {
                cwd: kitRoot,
                input: text,
                encoding: 'utf8',
            },
        );
        outputs.set(relative(repoRoot, path), formatted);
    }
    const typography =
        source.typographyConfig == null
            ? null
            : renderTypography({
                  kitRoot,
                  outputFile: resolve(kitRoot, source.typographyConfig.output),
                  primitives: source.primitives,
                  modes: source.typography,
                  todayDocument: source.typographyToday,
                  config: source.typographyConfig,
                  varOf,
                  fail,
              });
    if (typography != null) {
        // Every exception is a documented entry: the decisions file must list it (its table comes from --report).
        const decisions = resolve(kitRoot, 'design-system/tokens/typography.decisions.md');
        if (existsSync(decisions)) {
            const text = readFileSync(decisions, 'utf8');
            const missing = typography.exceptionNames.filter((name) => !text.includes(`| ${name} |`));
            if (missing.length > 0) {
                fail(
                    `typography.decisions.md does not list the exceptions ${missing.join(', ')} (paste \`pnpm tokens:report\`)`,
                );
            }
        }
        outputs.set(relative(repoRoot, resolve(kitRoot, source.typographyConfig.output)), typography.css);
        outputs.set(relative(repoRoot, resolve(kitRoot, source.typographyConfig.typesOutput)), typography.ts);
    }
    const app = primitivesConfig.app;
    outputs.set(app.output, renderAppArtifact({ bodies: flatBodies, appConfig: app, repoRoot }));
    return { outputs, typography, source };
};

const report = ({ typography, source }) => {
    if (typography == null) {
        console.log(`no typography layer (no ${TYPOGRAPHY_CONFIG} in the source): nothing to report`);
        return;
    }
    const { text, unused } = typographyReport({ typography, primitives: source.primitives, repoRoot });
    console.log(`${text}\n`);
    if (unused.length > 0) {
        process.exitCode = 1;
    }
};

const isStale = ([file, text]) => {
    try {
        return readFileSync(resolve(repoRoot, file), 'utf8') !== text;
    } catch {
        return true;
    }
};

if (import.meta.main) {
    const args = process.argv.slice(2);
    const sourceIndex = args.indexOf('--source');
    const sourceDir = sourceIndex === -1 ? undefined : resolve(args[sourceIndex + 1]);
    try {
        const generated = generateAll({ sourceDir });
        const { outputs } = generated;
        if (args.includes('--report')) {
            report(generated);
        } else if (args.includes('--check')) {
            const stale = [...outputs].filter(isStale).map(([file]) => file);
            if (stale.length > 0) {
                throw new Error(
                    `stale generated files: ${stale.join(', ')}. Run \`pnpm tokens:generate\` and commit the result.`,
                );
            }
            console.log(`tokens: ok (${outputs.size} files up to date)`);
        } else {
            for (const [file, text] of outputs) {
                mkdirSync(dirname(resolve(repoRoot, file)), { recursive: true });
                writeFileSync(resolve(repoRoot, file), text);
            }
            console.log(`tokens: wrote ${outputs.size} files`);
        }
    } catch (error) {
        console.error(`tokens: ${error.message}`);
        process.exit(1);
    }
}
