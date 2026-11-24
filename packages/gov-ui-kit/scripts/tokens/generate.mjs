#!/usr/bin/env node
// The one token generator. It reads the DTCG 2025.10 token source in design-system/tokens/source/ and writes every
// token CSS output:
//
// - src/theme/tokens/primitives/*.css   the kit's primitive CSS (Tailwind `@theme` blocks) and its barrel
// - .design-sync/generated/govkit-primitives.css   the app's flattened artifact (primitives plus the app overrides)
//
// Usage: `node scripts/tokens/generate.mjs [--check] [--source <dir>]`
//   (none)    validate the source, write the outputs
//   --check   validate the source, fail when an output on disk is stale (writes nothing)
//   --source  read the source from another directory (a scratch copy), outputs stay in the repo
// See design-system/tokens/README.md.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderAppArtifact } from './lib/app.mjs';
import { collectTokens, createSchemaValidator, readJson, resolveToken } from './lib/dtcg.mjs';
import { primitiveFiles, renderPrimitives } from './lib/primitives.mjs';

const kitRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const repoRoot = resolve(kitRoot, '../..');
const defaultSourceDir = resolve(kitRoot, 'design-system/tokens/source');

// Validates the source: the document against the published DTCG schema, every alias (missing target, cycle, type
// mismatch), every resolved value against its own type.
const loadSource = (sourceDir) => {
    const validator = createSchemaValidator(resolve(sourceDir, 'schema/format.2025.10.json'));
    const document = readJson(resolve(sourceDir, 'primitives.tokens.json'));
    validator.validateDocument(document, 'primitives');
    const primitives = collectTokens(document);
    for (const [path, entry] of primitives) {
        validator.validateValue(entry.type, resolveToken(primitives, path).value, `primitives: ${path}`);
    }
    return {
        primitives,
        primitivesConfig: readJson(resolve(sourceDir, 'primitives.config.json')),
        cssDir: resolve(sourceDir, 'css'),
    };
};

// Every output: repo-relative path -> text.
export const generateAll = ({ sourceDir = defaultSourceDir } = {}) => {
    const { primitives, primitivesConfig, cssDir } = loadSource(sourceDir);
    const { bodies } = renderPrimitives({ tokens: primitives, config: primitivesConfig, cssDir });
    // The app artifact writes multi-value declarations (shadow layers, the font stack) on one line.
    const { bodies: flatBodies } = renderPrimitives({
        tokens: primitives,
        config: primitivesConfig,
        cssDir,
        flat: true,
    });
    const outputs = new Map();
    for (const [file, text] of primitiveFiles(bodies)) {
        outputs.set(relative(repoRoot, resolve(kitRoot, file)), text);
    }
    const app = primitivesConfig.app;
    outputs.set(app.output, renderAppArtifact({ bodies: flatBodies, appConfig: app, repoRoot }));
    return { outputs };
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
        const { outputs } = generateAll({ sourceDir });
        if (args.includes('--check')) {
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
