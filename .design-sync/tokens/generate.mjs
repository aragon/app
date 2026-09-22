#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateTokens } from './validate.mjs';

const require = createRequire(
    new URL('../../apps/app/package.json', import.meta.url),
);
const postcss = require('postcss');

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
const tokenFileUrl = new URL(
    './govkit-primitives.tokens.json',
    import.meta.url,
);
const baselineFileUrl = new URL('./parity-baseline.json', import.meta.url);
const DEFAULT_OUTPUT = join(
    repoRoot,
    '.design-sync/generated/govkit-primitives.css',
);
const KIT_PACKAGE = '@aragon/gov-ui-kit';
const PRIMITIVES_REL = 'src/theme/tokens/primitives';
const APP_OVERRIDE_REL =
    'src/modules/application/components/layouts/layoutRoot/layoutRoot.overrides.css';
const GENERATED_FONT_ASSET_PREFIX =
    '../../apps/app/node_modules/@aragon/gov-ui-kit/src/theme/fonts/';
const UNQUOTED_FONT_FAMILIES = new Set([
    'ui-sans-serif',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Roboto',
    'Arial',
    'sans-serif',
    'serif',
    'monospace',
    'cursive',
    'fantasy',
]);

const readJson = (url) => JSON.parse(readFileSync(url, 'utf8'));

function collectTokens(group, inheritedType, prefix = '', entries = new Map()) {
    const type = group.$type ?? inheritedType;
    if (Object.hasOwn(group, '$value')) {
        assert(type, `Missing type: ${prefix}`);
        entries.set(prefix, { type, value: group.$value });
        return entries;
    }

    for (const [key, child] of Object.entries(group)) {
        if (!key.startsWith('$')) {
            collectTokens(
                child,
                type,
                prefix ? `${prefix}.${key}` : key,
                entries,
            );
        }
    }
    return entries;
}

function formatNumber(value) {
    assert(Number.isFinite(value), `Non-finite token number: ${value}`);
    return String(value);
}

function formatDimension(value) {
    assert(
        value &&
            typeof value.value === 'number' &&
            typeof value.unit === 'string',
        `Invalid DTCG dimension: ${JSON.stringify(value)}`,
    );
    return `${formatNumber(value.value)}${value.unit}`;
}

function formatColor(value) {
    assert.equal(value.colorSpace, 'srgb', 'Only sRGB colors are supported');
    assert.equal(
        value.components.length,
        3,
        'sRGB colors require three components',
    );
    const components = value.components.map((component) => {
        assert(
            typeof component === 'number' && component >= 0 && component <= 1,
            `Invalid sRGB component: ${component}`,
        );
        return Math.round(component * 255);
    });
    const alpha = value.alpha ?? 1;
    assert(
        typeof alpha === 'number' && alpha >= 0 && alpha <= 1,
        `Invalid color alpha: ${alpha}`,
    );

    if (alpha === 0 && components.every((component) => component === 0)) {
        return 'transparent';
    }
    if (alpha === 1) {
        return `#${components.map((component) => component.toString(16).padStart(2, '0')).join('')}`;
    }
    return `rgba(${components.join(', ')}, ${formatNumber(alpha)})`;
}

function formatFontFamily(value) {
    assert(
        Array.isArray(value),
        `Invalid DTCG font family: ${JSON.stringify(value)}`,
    );
    return value
        .map((family) => {
            assert.equal(
                typeof family,
                'string',
                'Font family names must be strings',
            );
            return UNQUOTED_FONT_FAMILIES.has(family) ? family : `"${family}"`;
        })
        .join(', ');
}

function formatShadow(value) {
    assert(
        Array.isArray(value),
        `Invalid DTCG shadow: ${JSON.stringify(value)}`,
    );
    if (
        value.length === 1 &&
        [
            value[0].offsetX,
            value[0].offsetY,
            value[0].blur,
            value[0].spread,
        ].every(({ value: dimension }) => dimension === 0) &&
        value[0].color.alpha === 0 &&
        value[0].color.components.every((component) => component === 0)
    ) {
        return '0px 0px #0000';
    }
    return value
        .map((layer) => {
            const lengths = [
                layer.offsetX,
                layer.offsetY,
                layer.blur,
                layer.spread,
            ].map(formatDimension);
            return `${lengths.join(' ')} ${formatColor(layer.color)}`;
        })
        .join(', ');
}

function tokenToCssVariable(token, mappingsByToken) {
    const mapping = mappingsByToken.get(token);
    assert(mapping, `Missing CSS mapping for token ${token}`);
    return mapping.sourceVariable;
}

function formatTokenValue(entry, mappingsByToken) {
    const { type, value } = entry;
    if (
        typeof value === 'string' &&
        value.startsWith('{') &&
        value.endsWith('}')
    ) {
        const target = value.slice(1, -1);
        return `var(${tokenToCssVariable(target, mappingsByToken)})`;
    }

    switch (type) {
        case 'color':
            return formatColor(value);
        case 'dimension':
            return formatDimension(value);
        case 'fontFamily':
            return formatFontFamily(value);
        case 'fontWeight':
        case 'number':
            return formatNumber(value);
        case 'shadow':
            return formatShadow(value);
        default:
            throw new Error(`Unsupported DTCG token type: ${type}`);
    }
}

function getKitRoot(appRoot, kitRoot) {
    return (
        kitRoot ??
        process.env.GOVKIT_KIT_ROOT ??
        join(appRoot, 'node_modules', KIT_PACKAGE)
    );
}

function replaceTokenDeclarations(
    root,
    sourceFile,
    tokenEntries,
    mappingsBySource,
) {
    root.walkDecls((decl) => {
        if (!decl.prop.startsWith('--')) {
            return;
        }
        if (/-\*$/.test(decl.prop) && decl.value.trim() === 'initial') {
            return;
        }

        const mapping = mappingsBySource.get(`${sourceFile}\0${decl.prop}`);
        if (!mapping) {
            const isUnsupported = tokenEntries.unsupported.some(
                ({ sourceFile: file, sourceVariable }) =>
                    file === sourceFile && sourceVariable === decl.prop,
            );
            assert(
                isUnsupported,
                `No DTCG mapping for ${sourceFile}:${decl.prop}`,
            );
            return;
        }
        const entry = tokenEntries.tokens.get(mapping.token);
        assert(entry, `Missing DTCG token ${mapping.token}`);
        decl.value = formatTokenValue(entry, tokenEntries.mappingsByToken);
    });
}

function rewriteFontUrls(root) {
    root.walkDecls('src', (decl) => {
        decl.value = decl.value.replace(
            /url\((['"]?)\.\.\/\.\.\/fonts\//g,
            (_match, quote) => `url(${quote}${GENERATED_FONT_ASSET_PREFIX}`,
        );

        const unresolvedRelativeUrls = [
            ...decl.value.matchAll(/url\((['"]?)(\.\.?\/[^'")]+)\1\)/g),
        ]
            .map((match) => match[2])
            .filter((url) => !url.startsWith(GENERATED_FONT_ASSET_PREFIX));
        assert.equal(
            unresolvedRelativeUrls.length,
            0,
            `Unresolved relative font URLs in ${decl.toString()}`,
        );
    });
}

function renderPrimitiveFile({
    absPath,
    sourceFile,
    tokenEntries,
    mappingsBySource,
}) {
    const root = postcss.parse(readFileSync(absPath, 'utf8'));
    replaceTokenDeclarations(root, sourceFile, tokenEntries, mappingsBySource);
    rewriteFontUrls(root);
    return root.toString().trim();
}

function renderPrimitives({ kitRoot, tokenEntries, mappingsBySource }) {
    const primitivesDir = join(kitRoot, PRIMITIVES_REL);
    const indexRel = `${PRIMITIVES_REL}/index.css`;
    const indexRoot = postcss.parse(
        readFileSync(join(primitivesDir, 'index.css'), 'utf8'),
    );
    const chunks = [];

    for (const node of indexRoot.nodes ?? []) {
        if (node.type === 'comment') {
            continue;
        }
        assert.equal(
            node.type,
            'atrule',
            `Unexpected construct in ${indexRel}`,
        );
        assert.equal(node.name, 'import', `Expected import in ${indexRel}`);
        const target = node.params.replace(/^['"]|['"]$/g, '');
        const sourceFile = `${PRIMITIVES_REL}/${target.replace(/^\.\//, '')}`;
        chunks.push(
            `/* Inlined source import: ${node.toString()} */`,
            renderPrimitiveFile({
                absPath: join(kitRoot, sourceFile),
                sourceFile,
                tokenEntries,
                mappingsBySource,
            }),
        );
    }

    return chunks.join('\n\n');
}

function renderAppOverrides({ appRoot }) {
    const sourceFile = `apps/app/${APP_OVERRIDE_REL}`;
    const root = postcss.parse(
        readFileSync(join(appRoot, APP_OVERRIDE_REL), 'utf8'),
    );
    const rules = (root.nodes ?? []).filter(
        (node) => node.type === 'rule' && node.selector === ':root',
    );
    assert.equal(
        rules.length,
        1,
        `Expected one top-level :root in ${sourceFile}`,
    );
    return rules[0].toString().trim();
}

export function generateCss({
    appRoot = join(repoRoot, 'apps/app'),
    kitRoot,
    tokens = readJson(tokenFileUrl),
    baseline = readJson(baselineFileUrl),
} = {}) {
    validateTokens(tokens, baseline, { appRoot, kitRoot });
    const resolvedKitRoot = getKitRoot(appRoot, kitRoot);
    const tokenEntries = {
        tokens: collectTokens(tokens),
        mappings: baseline.mappings,
        unsupported: baseline.unsupported,
    };
    tokenEntries.mappingsByToken = new Map(
        baseline.mappings.map((mapping) => [mapping.token, mapping]),
    );
    const mappingsBySource = new Map(
        baseline.mappings.map((mapping) => [
            `${mapping.sourceFile}\0${mapping.sourceVariable}`,
            mapping,
        ]),
    );

    const provenance = tokens.$extensions['org.aragon.tokenParity'];
    const source = renderPrimitives({
        kitRoot: resolvedKitRoot,
        tokenEntries,
        mappingsBySource,
    });
    const overrides = renderAppOverrides({ appRoot });

    return [
        '/* GENERATED FILE. Run `pnpm tokens:generate`; do not edit. */',
        `/* DTCG source: ${provenance.sourcePackage}@${provenance.sourceVersion} (${provenance.sourceRevision}) */`,
        '/* Primitive CSS imports are flattened here; utilities and font faces remain CSS. */',
        '/* CSS-only unsupported values remain from GovKit, including --radius-none: none. */',
        source,
        `/* App runtime overrides from ${APP_OVERRIDE_REL} */`,
        overrides,
        '',
    ].join('\n\n');
}

function parseArgs(args) {
    const options = {};
    let index = 0;
    while (index < args.length) {
        const arg = args[index];
        if (arg === '--out') {
            options.outPath = args[index + 1];
        } else if (arg === '--app-root') {
            options.appRoot = args[index + 1];
        } else if (arg === '--kit-root') {
            options.kitRoot = args[index + 1];
        } else {
            throw new Error(`Unknown argument: ${arg}`);
        }
        index += 2;
    }
    return options;
}

if (import.meta.main) {
    try {
        const { outPath = DEFAULT_OUTPUT, ...options } = parseArgs(
            process.argv.slice(2),
        );
        const css = generateCss(options);
        mkdirSync(dirname(outPath), { recursive: true });
        writeFileSync(outPath, css);
        process.stdout.write(`Generated ${outPath}\n`);
    } catch (error) {
        process.stderr.write(`${error.message}\n`);
        process.exitCode = 1;
    }
}
