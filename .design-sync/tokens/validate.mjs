#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Ajv from 'ajv';
import { readSources } from './source.mjs';

const schema = JSON.parse(
    readFileSync(
        new URL('./schema/format.2025.10.json', import.meta.url),
        'utf8',
    ),
);
// The published schema uses conditional properties that do not satisfy Ajv's strict lint rules.
// Its only `format` keywords describe schema URIs, which this file asserts directly.
const ajv = new Ajv({ strict: false, allErrors: true, validateFormats: false });
const validateFormat = ajv.compile(schema);
const tokenFileUrl = new URL(
    './govkit-primitives.tokens.json',
    import.meta.url,
);
const baselineFileUrl = new URL('./parity-baseline.json', import.meta.url);

export function validateTokens(tokens, baseline, options = {}) {
    assert.equal(tokens.$schema, schema.$id, 'DTCG schema version changed');
    assert.equal(
        baseline.dtcgSchema,
        schema.$id,
        'Baseline schema version changed',
    );
    assert(
        validateFormat(tokens),
        `DTCG document: ${ajv.errorsText(validateFormat.errors)}`,
    );
    const entries = new Map();
    function collect(group, prefix = '', inheritedType = undefined) {
        const type = group.$type ?? inheritedType;
        if (Object.hasOwn(group, '$value')) {
            assert(type, `Missing type: ${prefix}`);
            entries.set(prefix, { type, value: group.$value });
            return;
        }
        for (const [key, child] of Object.entries(group)) {
            if (!key.startsWith('$')) {
                collect(child, prefix ? `${prefix}.${key}` : key, type);
            }
        }
    }
    collect(tokens);
    function resolve(id, chain = []) {
        assert(
            !chain.includes(id),
            `Alias cycle: ${[...chain, id].join(' -> ')}`,
        );
        const entry = entries.get(id);
        assert(entry, `Missing alias target: ${id}`);
        if (typeof entry.value === 'string' && entry.value.startsWith('{')) {
            const targetId = entry.value.slice(1, -1);
            const target = entries.get(targetId);
            assert(target, `Missing alias target: ${targetId}`);
            assert.equal(target.type, entry.type, `Alias type mismatch: ${id}`);
            return resolve(targetId, [...chain, id]);
        }
        return entry.value;
    }
    // JSON Schema cannot inherit a group's $type; validate each effective value as well.
    for (const [id, entry] of entries) {
        const validateValue = ajv.getSchema(
            `${schema.$id.replace(/format\.json$/, 'format/values/')}${entry.type}.json`,
        );
        assert(validateValue, `Unsupported token type: ${entry.type}`);
        assert(
            validateValue(resolve(id)),
            `DTCG value ${id}: ${ajv.errorsText(validateValue.errors)}`,
        );
    }

    const source = readSources(options);
    assert.equal(
        source.package.name,
        baseline.source.package,
        'GovKit package name changed',
    );
    assert.equal(
        source.package.version,
        baseline.source.version,
        'GovKit version changed; review the baseline',
    );
    const provenance = tokens.$extensions['org.aragon.tokenParity'];
    for (const [tokenKey, baselineKey] of [
        ['sourceRepository', 'repository'],
        ['sourcePackage', 'package'],
        ['sourceVersion', 'version'],
        ['sourceRevision', 'revision'],
        ['sourcePath', 'tokenPath'],
        ['appRevision', 'appRevision'],
    ]) {
        assert.equal(
            provenance[tokenKey],
            baseline.source[baselineKey],
            `Provenance mismatch: ${tokenKey}`,
        );
    }
    const mappings = source.mappings.map(
        ({ type, value, ...mapping }) => mapping,
    );
    assert.deepEqual(
        baseline.mappings,
        mappings,
        'CSS mappings drifted from GovKit source',
    );
    assert.deepEqual(
        baseline.unsupported,
        source.unsupported,
        'Unsupported CSS primitives changed',
    );
    assert.deepEqual(
        baseline.retainedCss,
        source.retainedCss,
        'Retained CSS directives or utilities changed',
    );
    assert.deepEqual(
        baseline.runtimeOverrides,
        source.runtimeOverrides,
        'App runtime overrides changed',
    );
    assert.equal(
        entries.size,
        source.mappings.length,
        'Token inventory differs from GovKit source',
    );
    for (const mapping of source.mappings) {
        const entry = entries.get(mapping.token);
        assert(
            entry,
            `Missing token for ${mapping.sourceVariable}: ${mapping.token}`,
        );
        assert.equal(entry.type, mapping.type, `Type drift: ${mapping.token}`);
        assert.deepEqual(
            entry.value,
            mapping.value,
            `Value drift: ${mapping.sourceVariable} -> ${mapping.token}`,
        );
    }
    return {
        tokens: entries.size,
        retainedCss: source.retainedCss.length,
        unsupported: source.unsupported.length,
        overrides: source.runtimeOverrides.length,
    };
}

if (import.meta.main) {
    try {
        const tokens = JSON.parse(readFileSync(tokenFileUrl, 'utf8'));
        const baseline = JSON.parse(readFileSync(baselineFileUrl, 'utf8'));
        const result = validateTokens(tokens, baseline);
        process.stdout.write(
            `DTCG 2025.10 and live CSS parity valid: ${result.tokens} tokens, ${result.retainedCss} retained CSS constructs, ${result.unsupported} unsupported primitive, ${result.overrides} app overrides\n`,
        );
    } catch (error) {
        process.stderr.write(`${error.message}\n`);
        process.exitCode = 1;
    }
}
