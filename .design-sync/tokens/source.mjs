// Shared source reader for the GovKit token-parity baseline (APP-727).
// Reads the installed gov-ui-kit primitive CSS plus the App :root runtime
// overrides and returns a structured, DTCG-2025.10 view. No values are
// hardcoded: everything is derived from the CSS actually on disk. Unknown
// custom properties or value syntax throw rather than being silently dropped.
//
// Consumed by validate.mjs (Main). Pure, synchronous, deterministic.

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// postcss is a declared devDependency of apps/app; resolve it from there.
const require = createRequire(
    new URL('../../apps/app/package.json', import.meta.url),
);
const postcss = require('postcss');

const KIT_PACKAGE = '@aragon/gov-ui-kit';
const PRIMITIVES_REL = 'src/theme/tokens/primitives';
const APP_OVERRIDE_REL =
    'src/modules/application/components/layouts/layoutRoot/layoutRoot.css';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));

const collapse = (s) => s.replace(/\s+/g, ' ').trim();

// --- value parsers (strict: throw on anything unexpected) --------------------

function parseHexColor(hex) {
    let h = hex.slice(1);
    if (h.length === 3 || h.length === 4) {
        h = [...h].map((c) => c + c).join('');
    }
    if (h.length !== 6 && h.length !== 8) {
        throw new Error(`Unsupported hex color "${hex}"`);
    }
    const r = Number.parseInt(h.slice(0, 2), 16);
    const g = Number.parseInt(h.slice(2, 4), 16);
    const b = Number.parseInt(h.slice(4, 6), 16);
    const color = {
        colorSpace: 'srgb',
        components: [r / 255, g / 255, b / 255],
    };
    if (h.length === 8) {
        color.alpha = Number.parseInt(h.slice(6, 8), 16) / 255;
    }
    return color;
}

function parseRgba(str) {
    const m = str.match(/^rgba?\(([^)]*)\)$/);
    if (!m) {
        throw new Error(`Unsupported color function "${str}"`);
    }
    const parts = m[1].split(',').map((p) => p.trim());
    if (parts.length !== 3 && parts.length !== 4) {
        throw new Error(`Unsupported color function "${str}"`);
    }
    const [r, g, b] = parts.slice(0, 3).map(Number);
    if ([r, g, b].some((n) => !Number.isFinite(n))) {
        throw new Error(`Unsupported color function "${str}"`);
    }
    const color = {
        colorSpace: 'srgb',
        components: [r / 255, g / 255, b / 255],
    };
    if (parts.length === 4) {
        const a = Number(parts[3]);
        if (!Number.isFinite(a)) {
            throw new Error(`Unsupported color alpha in "${str}"`);
        }
        color.alpha = a;
    }
    return color;
}

function parseColorValue(v) {
    if (v === 'transparent') {
        return { colorSpace: 'srgb', components: [0, 0, 0], alpha: 0 };
    }
    if (v.startsWith('#')) {
        return parseHexColor(v);
    }
    if (v.startsWith('rgb')) {
        return parseRgba(v);
    }
    throw new Error(`Unsupported color value "${v}"`);
}

function parseDimension(v) {
    const m = v.match(/^(-?\d*\.?\d+)(px|rem)$/);
    if (!m) {
        throw new Error(`Unsupported dimension "${v}" (only px/rem numeric)`);
    }
    return { value: Number(m[1]), unit: m[2] };
}

function parseNumber(v) {
    if (!/^-?\d*\.?\d+$/.test(v)) {
        throw new Error(`Unsupported numeric value "${v}"`);
    }
    return Number(v);
}

function parseFontFamily(v) {
    return collapse(v)
        .split(',')
        .map((name) =>
            name
                .trim()
                .replace(/^"(.*)"$/, '$1')
                .replace(/^'(.*)'$/, '$1'),
        )
        .filter(Boolean);
}

// Split on top-level commas (ignoring commas inside parentheses).
function splitTopLevel(v) {
    const out = [];
    let depth = 0;
    let cur = '';
    for (const ch of v) {
        if (ch === '(') {
            depth++;
        } else if (ch === ')') {
            depth--;
        }
        if (ch === ',' && depth === 0) {
            out.push(cur);
            cur = '';
        } else {
            cur += ch;
        }
    }
    if (cur.trim()) {
        out.push(cur);
    }
    return out;
}

const ZERO_PX = { value: 0, unit: 'px' };

function parseShadow(v) {
    return splitTopLevel(collapse(v)).map((raw) => {
        const layer = raw.trim();
        const cm = layer.match(/(rgba?\([^)]*\)|#[0-9a-fA-F]+)\s*$/);
        if (!cm) {
            throw new Error(`Shadow layer missing color: "${layer}"`);
        }
        const color = parseColorValue(cm[1]);
        const lengths = layer
            .slice(0, cm.index)
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .map(parseDimension);
        if (lengths.length < 2 || lengths.length > 4) {
            throw new Error(
                `Shadow layer has unexpected length count: "${layer}"`,
            );
        }
        return {
            color,
            offsetX: lengths[0],
            offsetY: lengths[1],
            blur: lengths[2] ?? { ...ZERO_PX },
            spread: lengths[3] ?? { ...ZERO_PX },
        };
    });
}

// --- declaration mapping -----------------------------------------------------

// Returns one of:
//   { kind: 'mapping', token, type, value, aliasTarget? }
//   { kind: 'retain' }              (namespace reset)
//   { kind: 'unsupported', reason }
function mapDecl(prop, value) {
    if (/-\*$/.test(prop) && value === 'initial') {
        return { kind: 'retain' };
    }

    // colors
    if (prop === '--color-transparent') {
        return {
            kind: 'mapping',
            token: 'color.transparent',
            type: 'color',
            value: parseColorValue(value),
        };
    }
    let m = prop.match(/^--color-([a-z]+)-(\d+)$/);
    if (m) {
        return {
            kind: 'mapping',
            token: `color.${m[1]}.${m[2]}`,
            type: 'color',
            value: parseColorValue(value),
        };
    }

    // radius
    if (prop === '--radius-none') {
        return {
            kind: 'unsupported',
            reason: 'DTCG dimension values require a numeric value and unit; CSS `none` has no dimension representation.',
        };
    }
    m = prop.match(/^--radius-(.+)$/);
    if (m) {
        return {
            kind: 'mapping',
            token: `radius.${m[1]}`,
            type: 'dimension',
            value: parseDimension(value),
        };
    }

    // breakpoints (px number variant first)
    m = prop.match(/^--breakpoint-(.+)-px$/);
    if (m) {
        return {
            kind: 'mapping',
            token: `breakpoint.px.${m[1]}`,
            type: 'number',
            value: parseNumber(value),
        };
    }
    m = prop.match(/^--breakpoint-(.+)$/);
    if (m) {
        return {
            kind: 'mapping',
            token: `breakpoint.css.${m[1]}`,
            type: 'dimension',
            value: parseDimension(value),
        };
    }

    // spacing
    if (prop === '--spacing') {
        return {
            kind: 'mapping',
            token: 'spacing.base',
            type: 'dimension',
            value: parseDimension(value),
        };
    }

    // typography
    m = prop.match(/^--font-weight-(.+)$/);
    if (m) {
        return {
            kind: 'mapping',
            token: `font.weight.${m[1]}`,
            type: 'fontWeight',
            value: parseNumber(value),
        };
    }
    m = prop.match(/^--font-(.+)$/);
    if (m) {
        return {
            kind: 'mapping',
            token: `font.family.${m[1]}`,
            type: 'fontFamily',
            value: parseFontFamily(value),
        };
    }
    m = prop.match(/^--text-(.+)$/);
    if (m) {
        return {
            kind: 'mapping',
            token: `font.size.${m[1]}`,
            type: 'dimension',
            value: parseDimension(value),
        };
    }
    m = prop.match(/^--leading-(.+)$/);
    if (m) {
        return {
            kind: 'mapping',
            token: `font.leading.${m[1]}`,
            type: 'number',
            value: parseNumber(value),
        };
    }

    // shadows
    m = prop.match(/^--shadow-(.+)$/);
    if (m) {
        return {
            kind: 'mapping',
            token: `shadow.${m[1]}`,
            type: 'shadow',
            value: parseShadow(value),
        };
    }

    // ring colors (aliases to color primitives)
    m = prop.match(/^--ring-color-(.+)$/);
    if (m) {
        const ref = value.match(/^var\(\s*--color-([a-z]+)-(\d+)\s*\)$/);
        if (!ref) {
            throw new Error(
                `Ring color "${prop}" must alias a color primitive, got "${value}"`,
            );
        }
        const target = `color.${ref[1]}.${ref[2]}`;
        return {
            kind: 'mapping',
            token: `ring.color.${m[1]}`,
            type: 'color',
            value: `{${target}}`,
            aliasTarget: target,
        };
    }

    throw new Error(`Unknown custom property "${prop}"`);
}

// --- file walkers ------------------------------------------------------------

function walkThemeOrRoot(container, sourceFile, out) {
    container.each((node) => {
        if (node.type === 'comment') {
            return;
        }
        if (node.type !== 'decl') {
            throw new Error(
                `Unexpected node in ${sourceFile}: "${node.toString().trim()}"`,
            );
        }
        if (node.important) {
            throw new Error(
                `Unsupported !important on "${node.prop}" in ${sourceFile}`,
            );
        }
        const prop = node.prop;
        const sourceValue = collapse(node.value);
        const result = mapDecl(prop, sourceValue);
        if (result.kind === 'retain') {
            out.retainedCss.push({
                sourceFile,
                css: `${prop}: ${sourceValue};`,
            });
        } else if (result.kind === 'unsupported') {
            out.unsupported.push({
                sourceFile,
                sourceVariable: prop,
                sourceValue,
                reason: result.reason,
            });
        } else {
            const mapping = {
                sourceFile,
                sourceVariable: prop,
                sourceValue,
                token: result.token,
                type: result.type,
                value: result.value,
            };
            if (result.aliasTarget) {
                mapping.aliasTarget = result.aliasTarget;
            }
            out.mappings.push(mapping);
        }
    });
}

function processPrimitiveFile(absPath, sourceFile, out) {
    const root = postcss.parse(readFileSync(absPath, 'utf8'));
    root.each((node) => {
        if (node.type === 'comment') {
            return;
        }
        if (node.type === 'atrule' && node.name === 'theme') {
            if (node.params.trim()) {
                throw new Error(
                    `Unsupported @theme ${node.params} in ${sourceFile}`,
                );
            }
            walkThemeOrRoot(node, sourceFile, out);
            return;
        }
        if (
            node.type === 'atrule' &&
            (node.name === 'utility' || node.name === 'font-face')
        ) {
            out.retainedCss.push({
                sourceFile,
                css: collapse(node.toString()),
            });
            return;
        }
        if (node.type === 'rule' && node.selector === ':root') {
            walkThemeOrRoot(node, sourceFile, out);
            return;
        }
        throw new Error(
            `Unexpected top-level construct in ${sourceFile}: "${node.toString().trim().slice(0, 80)}"`,
        );
    });
}

function processRuntimeOverrides(absPath, sourceFile, out) {
    const root = postcss.parse(readFileSync(absPath, 'utf8'));
    root.walkDecls((decl) => {
        if (!decl.prop.startsWith('--')) {
            return;
        }
        const rule = decl.parent;
        if (
            rule.type !== 'rule' ||
            rule.selector !== ':root' ||
            rule.parent !== root
        ) {
            throw new Error(
                `Unsupported nested or conditional scope for "${decl.prop}" in ${sourceFile}; expected a direct declaration in a top-level :root rule`,
            );
        }
        if (decl.important) {
            throw new Error(
                `Unsupported !important on "${decl.prop}" in ${sourceFile}`,
            );
        }
        out.runtimeOverrides.push({
            sourceFile,
            sourceVariable: decl.prop,
            sourceValue: collapse(decl.value),
        });
    });
}

// --- public API --------------------------------------------------------------

export function readSources({ kitRoot, appRoot } = {}) {
    const resolvedAppRoot = appRoot ?? path.join(repoRoot, 'apps/app');
    const resolvedKitRoot =
        kitRoot ??
        process.env.GOVKIT_KIT_ROOT ??
        path.join(resolvedAppRoot, 'node_modules', KIT_PACKAGE);

    const pkg = JSON.parse(
        readFileSync(path.join(resolvedKitRoot, 'package.json'), 'utf8'),
    );
    if (pkg.name !== KIT_PACKAGE) {
        throw new Error(
            `Expected package "${KIT_PACKAGE}" at ${resolvedKitRoot}, found "${pkg.name}"`,
        );
    }

    const out = {
        mappings: [],
        unsupported: [],
        retainedCss: [],
        runtimeOverrides: [],
    };

    // Discover imported primitive files from the barrel so added/removed
    // imports are observed; retain the import directives themselves.
    const primitivesDir = path.join(resolvedKitRoot, PRIMITIVES_REL);
    const indexRel = `${PRIMITIVES_REL}/index.css`;
    const indexRoot = postcss.parse(
        readFileSync(path.join(primitivesDir, 'index.css'), 'utf8'),
    );
    const imported = [];
    indexRoot.each((node) => {
        if (node.type === 'comment') {
            return;
        }
        if (node.type !== 'atrule' || node.name !== 'import') {
            throw new Error(
                `Unexpected construct in ${indexRel}: "${node.toString().trim()}"`,
            );
        }
        const target = node.params.replace(/^["']|["']$/g, '');
        out.retainedCss.push({
            sourceFile: indexRel,
            css: `@import ${node.params};`,
        });
        imported.push(target);
    });

    for (const target of imported) {
        const rel = `${PRIMITIVES_REL}/${target.replace(/^\.\//, '')}`;
        processPrimitiveFile(
            path.join(primitivesDir, target.replace(/^\.\//, '')),
            rel,
            out,
        );
    }

    processRuntimeOverrides(
        path.join(resolvedAppRoot, APP_OVERRIDE_REL),
        `apps/app/${APP_OVERRIDE_REL}`,
        out,
    );

    return { package: { name: pkg.name, version: pkg.version }, ...out };
}
