import assert from 'node:assert/strict';
import {
    cpSync,
    mkdtempSync,
    readFileSync,
    rmSync,
    writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { validateTokens } from './validate.mjs';

const tokens = JSON.parse(
    readFileSync(
        new URL('./govkit-primitives.tokens.json', import.meta.url),
        'utf8',
    ),
);
const baseline = JSON.parse(
    readFileSync(new URL('./parity-baseline.json', import.meta.url), 'utf8'),
);
const appRoot = fileURLToPath(new URL('../../apps/app', import.meta.url));
const kitRoot = join(appRoot, 'node_modules/@aragon/gov-ui-kit');

test('checked-in tokens match the consumed GovKit CSS and app overrides', () => {
    assert.equal(
        validateTokens(tokens, baseline, { appRoot, kitRoot }).tokens,
        131,
    );
});

test('matching edits to both snapshots cannot hide a CSS value mismatch', () => {
    const changedTokens = structuredClone(tokens);
    const changedBaseline = structuredClone(baseline);
    changedTokens.color.primary['50'].$value.components = [0, 0, 0];
    changedBaseline.mappings.find(
        (mapping) => mapping.token === 'color.primary.50',
    ).sourceValue = '#000000';
    assert.throws(
        () => validateTokens(changedTokens, changedBaseline),
        /CSS mappings drifted/,
    );
});

test('neutral medium shadows use their own source color, not the small-shadow color', () => {
    const changed = structuredClone(tokens);
    changed.shadow['neutral-md'].$value[0].color.components = [
        97 / 255,
        110 / 255,
        124 / 255,
    ];
    assert.throws(
        () => validateTokens(changed, baseline),
        /Value drift: --shadow-neutral-md/,
    );
});

for (const [name, value, expected] of [
    ['dangling', '{color.missing}', /Missing alias target/],
    ['cyclic', '{ring.color.primary}', /Alias cycle/],
    ['wrong-type', '{spacing.base}', /Alias type mismatch/],
]) {
    test(`${name} aliases are rejected independently of the baseline`, () => {
        const changed = structuredClone(tokens);
        changed.ring.color.primary.$value = value;
        assert.throws(() => validateTokens(changed, baseline), expected);
    });
}

test('a value valid for another type is rejected for its own type', () => {
    const changed = structuredClone(tokens);
    changed.color.transparent.$value = structuredClone(
        changed.spacing.base.$value,
    );
    assert.throws(
        () => validateTokens(changed, baseline),
        /DTCG value color.transparent/,
    );
});

test('CSS namespace resets cannot drift unnoticed', (context) => {
    const root = mkdtempSync(join(tmpdir(), 'govkit-parity-'));
    context.after(() => rmSync(root, { recursive: true, force: true }));
    cpSync(join(kitRoot, 'package.json'), join(root, 'package.json'));
    cpSync(
        join(kitRoot, 'src/theme/tokens/primitives'),
        join(root, 'src/theme/tokens/primitives'),
        { recursive: true },
    );
    const path = join(root, 'src/theme/tokens/primitives/colors.css');
    writeFileSync(
        path,
        readFileSync(path, 'utf8').replace('--color-*: initial;', ''),
    );
    assert.throws(
        () => validateTokens(tokens, baseline, { kitRoot: root }),
        /Retained CSS/,
    );
});
