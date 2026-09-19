#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const tokenPath = new URL('./govkit-primitives.tokens.json', import.meta.url);
const baselinePath = new URL('./parity-baseline.json', import.meta.url);
const schema = 'https://www.designtokens.org/schemas/2025.10/format.json';
const types = new Set([
    'color',
    'dimension',
    'fontFamily',
    'fontWeight',
    'number',
    'shadow',
]);

const [tokens, baseline] = await Promise.all([
    readFile(tokenPath, 'utf8').then(JSON.parse),
    readFile(baselinePath, 'utf8').then(JSON.parse),
]);
const errors = [];
const tokenMap = new Map();

const fail = (message) => errors.push(message);
const isAlias = (value) =>
    typeof value === 'string' && /^\{[^{}]+\}$/.test(value);
const aliasPath = (value) => value.slice(1, -1);
const stable = (value) => {
    if (Array.isArray(value)) {
        return `[${value.map(stable).join(',')}]`;
    }
    if (value && typeof value === 'object') {
        return `{${Object.keys(value)
            .sort()
            .map((key) => `${JSON.stringify(key)}:${stable(value[key])}`)
            .join(',')}}`;
    }
    return JSON.stringify(value);
};
const digest = (value) =>
    createHash('sha256').update(stable(value)).digest('hex');
const isDimension = (value) =>
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Number.isFinite(value.value) &&
    ['px', 'rem'].includes(value.unit);
const isColor = (value) =>
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    value.colorSpace === 'srgb' &&
    Array.isArray(value.components) &&
    value.components.length === 3 &&
    value.components.every(
        (component) =>
            component === 'none' ||
            (Number.isFinite(component) && component >= 0 && component <= 1),
    ) &&
    (value.alpha === undefined ||
        (Number.isFinite(value.alpha) && value.alpha >= 0 && value.alpha <= 1));
const isShadow = (value) =>
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
        (layer) =>
            layer &&
            typeof layer === 'object' &&
            isColor(layer.color) &&
            isDimension(layer.offsetX) &&
            isDimension(layer.offsetY) &&
            isDimension(layer.blur) &&
            isDimension(layer.spread),
    );
const valueMatchesType = (value, type) => {
    if (isAlias(value)) {
        return true;
    }
    switch (type) {
        case 'color':
            return isColor(value);
        case 'dimension':
            return isDimension(value);
        case 'fontFamily':
            return (
                Array.isArray(value) &&
                value.length > 0 &&
                value.every((item) => typeof item === 'string')
            );
        case 'fontWeight':
            return Number.isFinite(value);
        case 'number':
            return Number.isFinite(value);
        case 'shadow':
            return isShadow(value);
        default:
            return false;
    }
};

if (tokens.$schema !== schema) {
    fail(`token source must use ${schema}`);
}
if (baseline.dtcgSchema !== schema) {
    fail(`baseline must use ${schema}`);
}

function collect(node, path, inheritedType) {
    if (!node || typeof node !== 'object' || Array.isArray(node)) {
        fail(`group ${path.join('.') || '<root>'} is not an object`);
        return;
    }
    const type = node.$type ?? inheritedType;
    if (node.$type !== undefined && !types.has(node.$type)) {
        fail(`unsupported $type at ${path.join('.')}: ${node.$type}`);
    }
    if (node.$value !== undefined) {
        if (!path.length) {
            fail('root cannot be a token');
        }
        const tokenPath = path.join('.');
        tokenMap.set(tokenPath, { node, type });
        if (!type) {
            fail(`token ${tokenPath} has no $type`);
        } else if (!valueMatchesType(node.$value, type)) {
            fail(`token ${tokenPath} does not match ${type}`);
        }
        return;
    }
    for (const [key, child] of Object.entries(node)) {
        if (key.startsWith('$')) {
            continue;
        }
        if (key.includes('.')) {
            fail(
                `token/group name contains a dot: ${[...path, key].join('.')}`,
            );
        }
        collect(child, [...path, key], type);
    }
}
collect(tokens, [], undefined);

function resolve(path, stack = []) {
    const entry = tokenMap.get(path);
    if (!entry) {
        fail(`alias target does not exist: ${path}`);
        return undefined;
    }
    if (stack.includes(path)) {
        fail(`alias cycle: ${[...stack, path].join(' -> ')}`);
        return undefined;
    }
    const value = entry.node.$value;
    return isAlias(value) ? resolve(aliasPath(value), [...stack, path]) : value;
}
for (const [path, entry] of tokenMap) {
    if (isAlias(entry.node.$value)) {
        const target = tokenMap.get(aliasPath(entry.node.$value));
        if (!target) {
            continue;
        }
        if (target.type !== entry.type) {
            fail(
                `alias ${path} changes type from ${entry.type} to ${target.type}`,
            );
        }
        resolve(path);
    }
}

const mappedPaths = new Set();
for (const mapping of baseline.mappings ?? []) {
    if (mapping.status !== 'represented') {
        fail(`mapping ${mapping.sourceVariable} is not represented`);
    }
    if (mappedPaths.has(mapping.token)) {
        fail(`duplicate mapping for ${mapping.token}`);
    }
    mappedPaths.add(mapping.token);
    const entry = tokenMap.get(mapping.token);
    if (!entry) {
        fail(`mapping target does not exist: ${mapping.token}`);
        continue;
    }
    if (mapping.valueSha256 !== digest(entry.node.$value)) {
        fail(`value drift for ${mapping.sourceVariable} -> ${mapping.token}`);
    }
    if (
        mapping.aliasTarget &&
        entry.node.$value !== `{${mapping.aliasTarget}}`
    ) {
        fail(`alias drift for ${mapping.sourceVariable}`);
    }
}
for (const path of tokenMap.keys()) {
    if (!mappedPaths.has(path)) {
        fail(`token has no source mapping: ${path}`);
    }
}
if (!baseline.unsupported?.length) {
    fail('baseline must record unsupported CSS constructs');
}
if (!baseline.runtimeOverrides?.length) {
    fail('baseline must record app runtime overrides');
}
if (
    baseline.source?.revision !==
    tokens.$extensions?.['org.aragon.tokenParity']?.sourceRevision
) {
    fail('source revision metadata disagrees');
}

if (errors.length) {
    process.stderr.write(`${errors.map((error) => `- ${error}`).join('\n')}\n`);
    process.exit(1);
}

process.stdout.write(
    `DTCG 2025.10 token source valid: ${tokenMap.size} tokens, ${baseline.mappings.length} CSS mappings\n`,
);
process.stdout.write(
    `Parity baseline valid: ${baseline.unsupported.length} unsupported constructs, ${baseline.runtimeOverrides.length} app overrides\n`,
);
