// DTCG 2025.10 plumbing of the token generator: reading and validating a token document, formatting values as CSS.
// Plain Node; the only dependency is Ajv, for the published DTCG schema.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Ajv from 'ajv';

export const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));

const isAlias = (value) => typeof value === 'string' && value.startsWith('{') && value.endsWith('}');
const aliasTarget = (value) => value.slice(1, -1);

// Path ("color.primary.50") -> { type, value } in document order. A group's $type is inherited.
const collectTokens = (group, inheritedType, prefix = '', tokens = new Map()) => {
    const type = group.$type ?? inheritedType;
    if (Object.hasOwn(group, '$value')) {
        assert(type, `Missing type: ${prefix}`);
        tokens.set(prefix, { type, value: group.$value });
        return tokens;
    }
    for (const [key, child] of Object.entries(group)) {
        if (!key.startsWith('$')) {
            collectTokens(child, type, prefix ? `${prefix}.${key}` : key, tokens);
        }
    }
    return tokens;
};

// Follows aliases to the token that holds a value.
const resolveToken = (tokens, path, chain = []) => {
    assert(!chain.includes(path), `Alias cycle: ${[...chain, path].join(' -> ')}`);
    const token = tokens.get(path);
    assert(token, `Missing alias target: ${path} (from ${chain.at(-1)})`);
    if (!isAlias(token.value)) {
        return token;
    }
    const resolved = resolveToken(tokens, aliasTarget(token.value), [...chain, path]);
    assert.equal(resolved.type, token.type, `Alias type mismatch: ${path}`);
    return resolved;
};

// Reads a token document and validates it: the document against the published schema (`schemaFile`, unmodified),
// every alias (missing target, cycle, type mismatch) and every resolved value against the schema of its type. JSON
// Schema cannot inherit a group's $type, hence the per-value pass. The schema's conditional properties do not
// satisfy Ajv's strict mode, and its only `format` keywords describe schema URIs.
export const readTokens = (file, schemaFile) => {
    const schema = readJson(schemaFile);
    const document = readJson(file);
    const ajv = new Ajv({ strict: false, allErrors: true, validateFormats: false });
    const validateDocument = ajv.compile(schema);
    assert.equal(document.$schema, schema.$id, 'DTCG schema version changed');
    assert(validateDocument(document), ajv.errorsText(validateDocument.errors));
    const tokens = collectTokens(document);
    for (const [path, { type }] of tokens) {
        const validateValue = ajv.getSchema(schema.$id.replace(/format\.json$/, `format/values/${type}.json`));
        assert(validateValue, `Unsupported token type: ${type} (${path})`);
        assert(
            validateValue(resolveToken(tokens, path).value),
            `DTCG value ${path}: ${ajv.errorsText(validateValue.errors)}`,
        );
    }
    return tokens;
};

const hex2 = (byte) => byte.toString(16).padStart(2, '0');

// Hex, `rgba(r, g, b, a)` with an alpha, `transparent` for zero-alpha black. sRGB with numeric components only.
const colorToCss = ({ colorSpace, components, alpha = 1 }) => {
    assert.equal(colorSpace, 'srgb', 'Only sRGB colours are supported');
    assert(
        components.every((component) => typeof component === 'number'),
        `Unsupported colour: ${components}`,
    );
    const bytes = components.map((component) => Math.round(component * 255));
    if (alpha === 0 && bytes.every((byte) => byte === 0)) {
        return 'transparent';
    }
    return alpha === 1 ? `#${bytes.map(hex2).join('')}` : `rgba(${bytes.join(', ')}, ${alpha})`;
};

const dimensionToCss = ({ value, unit }) => `${value}${unit}`;

// Generic and system families, and the two names the kit's stack has always left bare; any other family is quoted.
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
]);

const fontFamilyToCss = (value) =>
    [value]
        .flat()
        .map((family) => (UNQUOTED_FONT_FAMILIES.has(family) ? family : `"${family}"`))
        .join(', ');

const shadowLayer = ({ offsetX, offsetY, blur, spread, color }) =>
    `${[offsetX, offsetY, blur, spread].map(dimensionToCss).join(' ')} ${colorToCss(color)}`;

const valueToCss = ({ type, value }) => {
    switch (type) {
        case 'color':
            return colorToCss(value);
        case 'dimension':
            return dimensionToCss(value);
        case 'fontFamily':
            return fontFamilyToCss(value);
        case 'fontWeight':
        case 'number':
            return String(value);
        case 'shadow':
            return [value].flat().map(shadowLayer).join(', ');
        default:
            throw new Error(`Unsupported DTCG token type: ${type}`);
    }
};

// One declaration (`--name: value;`) of a token; an alias becomes a `var()` of its target (`varOf`: path -> name).
export const declaration = (name, token, varOf) =>
    `${name}: ${isAlias(token.value) ? `var(${varOf(aliasTarget(token.value))})` : valueToCss(token)};`;
