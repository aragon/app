import assert from 'node:assert/strict';
import {
    cpSync,
    mkdirSync,
    mkdtempSync,
    readFileSync,
    rmSync,
    writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
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

const appCssPath =
    'src/modules/application/components/layouts/layoutRoot/layoutRoot.css';
const spacingCssPath = 'src/theme/tokens/primitives/spacing.css';
const colorsCssPath = 'src/theme/tokens/primitives/colors.css';
const overlay = '--guk-dialog-overlay-z-index: 20;';

for (const [name, area, file, search, replacement, expected] of [
    [
        'additional scoped GovKit override',
        'app',
        appCssPath,
        /$/,
        '\nhtml.dark { --guk-dialog-overlay-z-index: 99; }\n',
        /Unsupported.*scope/,
    ],
    [
        'additional .dark override',
        'app',
        appCssPath,
        /$/,
        '\n.dark { --guk-dialog-overlay-z-index: 99; }\n',
        /Unsupported.*scope/,
    ],
    [
        'alternative runtime root selector',
        'app',
        appCssPath,
        /:root \{/,
        'html {',
        /Unsupported.*scope/,
    ],
    [
        'non-custom property in runtime root',
        'app',
        appCssPath,
        overlay,
        `color: red;\n    ${overlay}`,
        /Unsupported.*custom property/,
    ],
    [
        'additional scoped color override',
        'app',
        appCssPath,
        /$/,
        '\n:root, .dark { --color-primary-500: #000000; }\n',
        /Unsupported.*scope/,
    ],
    [
        'conditional App root',
        'app',
        appCssPath,
        /(:root \{[\s\S]*\})/,
        '@media (min-width: 99999px) { $1 }',
        /Unsupported.*scope/,
    ],
    [
        'conditional declaration inside App root',
        'app',
        appCssPath,
        overlay,
        `@media (min-width: 99999px) { ${overlay} }`,
        /Unsupported.*scope/,
    ],
    [
        'nested selector inside App root',
        'app',
        appCssPath,
        overlay,
        `&:hover { ${overlay} }`,
        /Unsupported.*scope/,
    ],
    [
        'important App override',
        'app',
        appCssPath,
        overlay,
        '--guk-dialog-overlay-z-index: 20 !important;',
        /Unsupported.*!important/,
    ],
    [
        'important theme primitive',
        'kit',
        spacingCssPath,
        '--spacing: 4px;',
        '--spacing: 4px !important;',
        /Unsupported.*!important/,
    ],
    [
        'important root primitive',
        'kit',
        'src/theme/tokens/primitives/breakpoints.css',
        '--breakpoint-sm-px: 640;',
        '--breakpoint-sm-px: 640 !important;',
        /Unsupported.*!important/,
    ],
    [
        'important namespace reset',
        'kit',
        colorsCssPath,
        '--color-*: initial;',
        '--color-*: initial !important;',
        /Unsupported.*!important/,
    ],
    [
        'reference theme mode',
        'kit',
        spacingCssPath,
        '@theme {',
        '@theme reference {',
        /Unsupported.*@theme reference/,
    ],
    [
        'retained utility importance still reaches baseline comparison',
        'kit',
        'src/theme/tokens/primitives/focusRing.css',
        'outline: none;',
        'outline: none !important;',
        /Retained CSS/,
    ],
]) {
    test(`source context: ${name}`, (context) => {
        const root = mkdtempSync(join(tmpdir(), 'govkit-parity-'));
        context.after(() => rmSync(root, { recursive: true, force: true }));
        const fixtureKit = join(root, 'kit');
        const fixtureApp = join(root, 'app');
        mkdirSync(fixtureKit);
        cpSync(join(kitRoot, 'package.json'), join(fixtureKit, 'package.json'));
        cpSync(
            join(kitRoot, 'src/theme/tokens/primitives'),
            join(fixtureKit, 'src/theme/tokens/primitives'),
            { recursive: true },
        );
        mkdirSync(dirname(join(fixtureApp, appCssPath)), { recursive: true });
        cpSync(join(appRoot, appCssPath), join(fixtureApp, appCssPath));
        const path = join(area === 'app' ? fixtureApp : fixtureKit, file);
        const original = readFileSync(path, 'utf8');
        const changed = original.replace(search, replacement);
        assert.notEqual(
            changed,
            original,
            'Fixture mutation must change the CSS',
        );
        writeFileSync(path, changed);
        assert.throws(
            () =>
                validateTokens(tokens, baseline, {
                    kitRoot: fixtureKit,
                    appRoot: fixtureApp,
                }),
            (error) => {
                assert.match(error.message, expected);
                if (expected.source.startsWith('Unsupported')) {
                    assert(
                        error.message.includes(file),
                        'Error must identify the source file',
                    );
                }
                return true;
            },
        );
    });
}
