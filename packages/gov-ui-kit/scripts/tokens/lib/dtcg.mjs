// DTCG 2025.10 plumbing shared by the token generators: loading, schema and alias validation, colour and value
// formatting. Plain Node; the only dependency is Ajv (root devDependency) for the published DTCG schema.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Ajv from 'ajv';

export const EXT = 'org.aragon.gov-ui-kit';

export const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));

// ---------------------------------------------------------------------------------------------------------------
// Schema validation
// ---------------------------------------------------------------------------------------------------------------

// `schema/format.2025.10.json` is the unmodified published bundled schema (see ../../../design-system/tokens/README.md).
// It uses conditional properties that do not satisfy Ajv's strict lint rules, and its only `format` keywords describe
// schema URIs, which are asserted directly instead.
export const createSchemaValidator = (schemaFile) => {
    const schema = readJson(schemaFile);
    const ajv = new Ajv({ strict: false, allErrors: true, validateFormats: false });
    const validateFormat = ajv.compile(schema);
    const valueSchemaId = (type) => `${schema.$id.replace(/format\.json$/, 'format/values/')}${type}.json`;
    return {
        id: schema.$id,
        validateDocument(document, label) {
            assert.equal(document.$schema, schema.$id, `${label}: DTCG schema version changed`);
            assert(validateFormat(document), `${label}: ${ajv.errorsText(validateFormat.errors)}`);
        },
        // JSON Schema cannot inherit a group's $type, so every token's resolved value is validated against its own.
        validateValue(type, value, label) {
            const validate = ajv.getSchema(valueSchemaId(type));
            assert(validate, `Unsupported token type: ${type} (${label})`);
            assert(validate(value), `DTCG value ${label}: ${ajv.errorsText(validate.errors)}`);
        },
    };
};

// ---------------------------------------------------------------------------------------------------------------
// Token collection and alias resolution
// ---------------------------------------------------------------------------------------------------------------

export const isAlias = (value) => typeof value === 'string' && value.startsWith('{') && value.endsWith('}');
export const aliasTarget = (value) => value.slice(1, -1);

// Path ("color.primary.50") -> { type, value, extensions, description } in document order. A group's $type is inherited.
export const collectTokens = (group, inheritedType, prefix = '', entries = new Map()) => {
    const type = group.$type ?? inheritedType;
    if (Object.hasOwn(group, '$value')) {
        assert(type, `Missing type: ${prefix}`);
        entries.set(prefix, {
            type,
            value: group.$value,
            extensions: group.$extensions?.[EXT],
            description: group.$description,
        });
        return entries;
    }
    for (const [key, child] of Object.entries(group)) {
        if (!key.startsWith('$')) {
            collectTokens(child, type, prefix ? `${prefix}.${key}` : key, entries);
        }
    }
    return entries;
};

// One resolved view: the shared sets (primitives, palette) plus one mode's semantic document. Root groups of different
// documents must differ, so a path means one token.
export const mergeSets = (sets) => {
    const merged = new Map();
    for (const [label, entries] of Object.entries(sets)) {
        for (const [path, entry] of entries) {
            assert(!merged.has(path), `Token ${path} is defined twice (again in ${label})`);
            merged.set(path, entry);
        }
    }
    return merged;
};

export const resolveToken = (entries, path, chain = []) => {
    assert(!chain.includes(path), `Alias cycle: ${[...chain, path].join(' -> ')}`);
    const entry = entries.get(path);
    assert(entry, `Missing alias target: ${path}`);
    if (!isAlias(entry.value)) {
        return entry;
    }
    const targetPath = aliasTarget(entry.value);
    const target = entries.get(targetPath);
    assert(target, `Missing alias target: ${targetPath} (from ${path})`);
    assert.equal(target.type, entry.type, `Alias type mismatch: ${path}`);
    return resolveToken(entries, targetPath, [...chain, path]);
};

// ---------------------------------------------------------------------------------------------------------------
// Value formatting
// ---------------------------------------------------------------------------------------------------------------

const formatNumber = (value) => {
    assert(Number.isFinite(value), `Non-finite token number: ${value}`);
    return String(value);
};

const srgbBytes = (value) => {
    assert.equal(value.colorSpace, 'srgb', 'Only sRGB colours are supported');
    assert.equal(value.components.length, 3, 'sRGB colours require three components');
    return value.components.map((component) => {
        assert(
            typeof component === 'number' && component >= 0 && component <= 1,
            `Invalid sRGB component: ${component}`,
        );
        return Math.round(component * 255);
    });
};
const alphaOf = (value) => {
    const alpha = value.alpha ?? 1;
    assert(typeof alpha === 'number' && alpha >= 0 && alpha <= 1, `Invalid colour alpha: ${alpha}`);
    return alpha;
};
const hex2 = (byte) => byte.toString(16).padStart(2, '0');

// The designer's form (palette, Next and Dark values): lower-case hex, eight digits when there is an alpha.
export const colorToHex = (value) => {
    const alpha = alphaOf(value);
    return `#${srgbBytes(value).map(hex2).join('')}${alpha === 1 ? '' : hex2(Math.round(alpha * 255))}`;
};

// The primitive layer's form (and Today's literal colours): hex, `rgba(r, g, b, a)` with an alpha, `transparent` for
// zero-alpha black.
export const colorToCss = (value) => {
    const bytes = srgbBytes(value);
    const alpha = alphaOf(value);
    if (alpha === 0 && bytes.every((byte) => byte === 0)) {
        return 'transparent';
    }
    if (alpha === 1) {
        return `#${bytes.map(hex2).join('')}`;
    }
    return `rgba(${bytes.join(', ')}, ${formatNumber(alpha)})`;
};

export const dimensionToCss = (value) => {
    assert(
        value && typeof value.value === 'number' && typeof value.unit === 'string',
        `Invalid DTCG dimension: ${JSON.stringify(value)}`,
    );
    return `${formatNumber(value.value)}${value.unit}`;
};

// CSS generic and system family names stay unquoted; any other family is a quoted name.
const UNQUOTED_FONT_FAMILIES = new Set([
    'ui-sans-serif',
    'ui-monospace',
    'SFMono-Regular',
    'Menlo',
    'Monaco',
    'Consolas',
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
// Width of the existing font stack's lines (Biome does not reflow values; the first line is 124 columns), measured
// without the 4 columns of the enclosing block.
const FONT_WRAP = 120;

// A font stack starts on its own line after the property and is wrapped greedily at that width; the app
// artifact (`flat`) keeps the same break after the property but writes the stack on one line.
const fontFamilyToCss = (value, name, flat) => {
    assert(Array.isArray(value), `Invalid DTCG font family: ${JSON.stringify(value)}`);
    const families = value.map((family) => {
        assert.equal(typeof family, 'string', 'Font family names must be strings');
        return UNQUOTED_FONT_FAMILIES.has(family) ? family : `"${family}"`;
    });
    if (flat) {
        return `${name}:\n    ${families.join(', ')};`;
    }
    const lines = [];
    let line = '';
    families.forEach((family, index) => {
        const piece = `${family}${index === families.length - 1 ? ';' : ','}`;
        if (line !== '' && 4 + line.length + 1 + piece.length > FONT_WRAP) {
            lines.push(line);
            line = piece;
        } else {
            line = line === '' ? piece : `${line} ${piece}`;
        }
    });
    lines.push(line);
    return `${name}:\n${lines.map((l) => `    ${l}`).join('\n')}`;
};

const shadowLayer = (layer) =>
    `${[layer.offsetX, layer.offsetY, layer.blur, layer.spread].map(dimensionToCss).join(' ')} ${colorToCss(layer.color)}`;

// One declaration (`--name: value;`, possibly over several lines) of a primitive token.
export const declaration = (name, entry, varOf, flat = false) => {
    const { type, value } = entry;
    if (isAlias(value)) {
        return `${name}: var(${varOf(aliasTarget(value))});`;
    }
    switch (type) {
        case 'color':
            return `${name}: ${colorToCss(value)};`;
        case 'dimension':
            return `${name}: ${dimensionToCss(value)};`;
        case 'fontFamily':
            return fontFamilyToCss(value, name, flat);
        case 'fontWeight':
        case 'number':
            return `${name}: ${formatNumber(value)};`;
        case 'shadow': {
            assert(Array.isArray(value), `Invalid DTCG shadow: ${JSON.stringify(value)}`);
            const transparentNothing =
                value.length === 1 &&
                [value[0].offsetX, value[0].offsetY, value[0].blur, value[0].spread].every((d) => d.value === 0) &&
                alphaOf(value[0].color) === 0 &&
                value[0].color.components.every((component) => component === 0);
            if (transparentNothing) {
                return `${name}: 0px 0px #0000;`;
            }
            const layers = value.map(shadowLayer);
            if (layers.length === 1) {
                return `${name}: ${layers[0]};`;
            }
            return flat
                ? `${name}:\n    ${layers.join(', ')};`
                : `${name}:\n${layers.map((l, i) => `    ${l}${i === layers.length - 1 ? ';' : ','}`).join('\n')}`;
        }
        default:
            throw new Error(`Unsupported DTCG token type: ${type}`);
    }
};
