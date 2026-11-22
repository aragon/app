// Regression tests of the token generator: `node --test scripts/tokens/generate.test.mjs` (root `pnpm test:tokens`).
// Each mutation runs against a scratch copy of the token source; the repository files are never touched.

import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { generateAll } from './generate.mjs';
import { readAppOverrides } from './lib/app.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const kitRoot = resolve(here, '../..');
const repoRoot = resolve(kitRoot, '../..');
const sourceDir = resolve(kitRoot, 'design-system/tokens/source');

const scratch = (context) => {
    const dir = mkdtempSync(join(tmpdir(), 'govkit-tokens-'));
    context.after(() => rmSync(dir, { recursive: true, force: true }));
    cpSync(sourceDir, dir, { recursive: true });
    return dir;
};
const edit = (dir, file, change) => {
    const path = join(dir, file);
    const json = JSON.parse(readFileSync(path, 'utf8'));
    change(json);
    writeFileSync(path, JSON.stringify(json, null, 4));
};

test('every output on disk is what the source generates, and generation is deterministic', () => {
    const first = generateAll().outputs;
    const second = generateAll().outputs;
    assert.deepEqual([...first], [...second]);
    assert.equal(first.size, 11);
    for (const [file, text] of first) {
        assert.equal(readFileSync(resolve(repoRoot, file), 'utf8'), text, `${file} is stale`);
        assert.match(text, /GENERATED/);
    }
});

test('the kit and the app artifact keep their CSS constructs', () => {
    const { outputs } = generateAll();
    const kit = (name) => outputs.get(`packages/gov-ui-kit/src/theme/tokens/primitives/${name}.css`);
    const app = outputs.get('.design-sync/generated/govkit-primitives.css');
    assert.match(kit('colors'), /--color-\*: initial;/);
    assert.match(kit('colors'), /--color-primary-500: #003bf5;/);
    assert.match(kit('colors'), /@utility gradient-neutral-50-transparent-to-b/);
    assert.match(kit('borderRadius'), /--radius-none: none;/);
    assert.match(kit('focusRing'), /--ring-color-primary: var\(--color-primary-200\);/);
    assert.match(kit('focusRing'), /@utility focus-ring-primary/);
    assert.match(kit('typography'), /url\("\.\.\/\.\.\/fonts\/Manrope-Regular\.ttf"\)/);
    // Pixel breakpoints stay in a plain :root rule, rem breakpoints in @theme.
    assert.match(kit('breakpoints'), /:root \{\n {4}--breakpoint-sm-px: 640;/);
    assert.match(kit('breakpoints'), /@theme \{\n {4}--breakpoint-\*: initial;\n {4}--breakpoint-sm: 40rem;/);
    // The app artifact is flat, rebases the font URLs and ends with the seven app overrides.
    assert.match(
        app,
        /url\("\.\.\/\.\.\/apps\/app\/node_modules\/@aragon\/gov-ui-kit\/src\/theme\/fonts\/Manrope-Regular\.ttf"\)/,
    );
    assert.match(app, /--guk-dialog-overlay-z-index: 20;/);
    assert.equal([...app.matchAll(/--guk-[a-z-]+: [a-z0-9]+;/g)].length, 7);
    assert.doesNotMatch(app, /@import ["']tailwindcss["']/);
});

test('the check fails when a generated file is stale', (context) => {
    const dir = scratch(context);
    edit(dir, 'primitives.tokens.json', (json) => {
        json.color.primary['500'].$value.components = [0, 0, 0];
    });
    const result = spawnSync('node', [join(here, 'generate.mjs'), '--check', '--source', dir], { encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /stale generated files: .*primitives\/colors\.css/);
    assert.match(result.stderr, /govkit-primitives\.css/);
    // The untouched source passes.
    execFileSync('node', [join(here, 'generate.mjs'), '--check'], { stdio: 'ignore' });
});

for (const [name, change, expected] of [
    [
        'a dangling alias',
        (json) => {
            json.ring.color.primary.$value = '{color.missing.100}';
        },
        /Missing alias target/,
    ],
    [
        'an alias cycle',
        (json) => {
            json.ring.color.primary.$value = '{ring.color.success}';
            json.ring.color.success.$value = '{ring.color.primary}';
        },
        /Alias cycle/,
    ],
    [
        'an alias of another type',
        (json) => {
            json.ring.color.primary.$value = '{spacing.base}';
        },
        /Alias type mismatch/,
    ],
    [
        'a value of another type',
        (json) => {
            json.color.transparent.$value = structuredClone(json.spacing.base.$value);
        },
        /DTCG value .*color\.transparent/,
    ],
    [
        'a changed schema version',
        (json) => {
            json.$schema = 'https://example.com/other.json';
        },
        /DTCG schema version changed/,
    ],
]) {
    test(`the source rejects ${name}`, (context) => {
        const dir = scratch(context);
        edit(dir, 'primitives.tokens.json', change);
        assert.throws(() => generateAll({ sourceDir: dir }), expected);
    });
}

test('a primitive token the layout does not place is rejected', (context) => {
    const dir = scratch(context);
    edit(dir, 'primitives.tokens.json', (json) => {
        json.zindex = { $type: 'number', modal: { $value: 30 } };
    });
    assert.throws(() => generateAll({ sourceDir: dir }), /places no CSS for: zindex\.modal/);
});

test('an unrewritable relative font URL is rejected', (context) => {
    const dir = scratch(context);
    const path = join(dir, 'css/typography.fontFaces.css');
    writeFileSync(path, readFileSync(path, 'utf8').replaceAll('../../fonts/', '../fonts/'));
    assert.throws(() => generateAll({ sourceDir: dir }), /Unresolved relative font URLs/);
});

test('a source without semantic.config.json generates the primitives only', (context) => {
    const dir = scratch(context);
    for (const name of readdirSync(dir).filter(
        (file) => file === 'semantic.config.json' || file === 'spacing.config.json' || file.endsWith('.tokens.json'),
    )) {
        if (name !== 'primitives.tokens.json') {
            rmSync(join(dir, name));
        }
    }
    const { outputs, semantic, spacing } = generateAll({ sourceDir: dir });
    assert.equal(semantic, null);
    assert.equal(spacing, null);
    assert.equal(outputs.size, 9);
    assert.ok(
        ![...outputs.keys()].some(
            (file) =>
                file.includes('/semantic/') || file.endsWith('tokens/spacing.css') || file.includes('spacingStyles'),
        ),
    );
    // The primitive outputs do not depend on the semantic layer.
    for (const [file, text] of outputs) {
        assert.equal(text, generateAll().outputs.get(file), file);
    }
    // A palette or semantic mode file without the config is an error, not silently ignored.
    writeFileSync(join(dir, 'palette.tokens.json'), '{}');
    assert.throws(() => generateAll({ sourceDir: dir }), /palette\.tokens\.json without semantic\.config\.json/);
    rmSync(join(dir, 'palette.tokens.json'));
    writeFileSync(join(dir, 'semantic.today.tokens.json'), '{}');
    assert.throws(
        () => generateAll({ sourceDir: dir }),
        /semantic\.today\.tokens\.json without semantic\.config\.json/,
    );
});

const overrides = (context, css) => {
    const dir = mkdtempSync(join(tmpdir(), 'govkit-overrides-'));
    context.after(() => rmSync(dir, { recursive: true, force: true }));
    const file = join(dir, 'overrides.css');
    writeFileSync(file, css);
    return () => readAppOverrides(file, relative(dir, file));
};
const base = ':root {\n    --guk-dialog-overlay-z-index: 20;\n}\n';

test('the app overrides must be direct custom properties of one top-level :root', (context) => {
    assert.match(overrides(context, `/* note */\n@import "x.css";\n${base}`)(), /--guk-dialog-overlay-z-index: 20;/);
    for (const [css, expected] of [
        [`${base}html.dark { --guk-dialog-overlay-z-index: 99; }`, /Unsupported scoped or conditional construct/],
        [`${base}.dark { --guk-dialog-overlay-z-index: 99; }`, /Unsupported scoped or conditional construct/],
        [base.replace(':root', 'html'), /Unsupported scoped or conditional construct/],
        [`${base}:root, .dark { --color-primary-500: #000; }`, /Unsupported scoped or conditional construct/],
        [`@media (min-width: 99999px) { ${base} }`, /Unsupported scoped or conditional construct/],
        [base.replace('--guk', 'color: red;\n--guk'), /Unsupported non-custom property declaration/],
        [
            base.replace('--guk-dialog-overlay-z-index: 20;', '@media (min-width: 1px) { --a: 1; }'),
            /Unsupported nested or conditional scope/,
        ],
        [
            base.replace('--guk-dialog-overlay-z-index: 20;', '&:hover { --a: 1; }'),
            /Unsupported nested or conditional scope/,
        ],
        [base.replace('20;', '20 !important;'), /Unsupported !important/],
        ['/* nothing */\n', /Expected one top-level :root/],
        [`${base}${base}`, /Expected one top-level :root/],
    ]) {
        assert.throws(overrides(context, css), expected, css);
    }
});

// ---------------------------------------------------------------------------------------------------------------
// Spacing layer
// ---------------------------------------------------------------------------------------------------------------

const spacingCss = (dir) =>
    generateAll({ sourceDir: dir }).outputs.get('packages/gov-ui-kit/src/theme/tokens/spacing.css');
const px = (value) => ({ value, unit: 'px' });
const addException = (dir, name, families, base, md, modes) =>
    edit(dir, 'spacing.exceptions.tokens.json', (json) => {
        const side = (value, mode) => ({
            $value: px(value),
            ...(modes ? { $extensions: { 'org.aragon.gov-ui-kit': { modes: mode } } } : {}),
        });
        json.space.exception[name] = {
            $description: 'test pattern',
            $extensions: { 'org.aragon.gov-ui-kit': { families, resolution: '' } },
            base: side(base, modes?.base),
            md: side(md, modes?.md),
        };
    });

test('the spacing layer writes one value set per mode, the coarse fallback and uniform utilities', () => {
    const { outputs, spacing } = generateAll();
    const css = outputs.get('packages/gov-ui-kit/src/theme/tokens/spacing.css');
    assert.match(css, /@layer theme \{\n {4}:root \{/);
    for (const mode of ['new', 'looser', 'compact']) {
        assert.match(css, new RegExp(`\\[data-spacing="${mode}"\\] \\{`));
    }
    assert.match(
        css,
        /@media \(pointer: coarse\) \{\n {8}\[data-spacing="compact"\] \{\n {12}--space-control-sm-height: 32px;/,
    );
    // Every block dimension of a target size falls back (heights, the large control's block padding, the row).
    const coarseBlock = css.slice(css.indexOf('@media (pointer: coarse)'));
    for (const name of ['control-md-height', 'control-lg-height', 'control-lg-pad-y', 'row-height']) {
        assert.match(coarseBlock, new RegExp(`--space-${name}: `));
    }
    // Roles keep their md step inside the utility; gap roles drop their prefix; sizes use the size name.
    assert.match(
        css,
        /@utility px-inset-item \{\n {4}padding-inline: var\(--space-inset-item-x\);\n\n {4}@variant md \{\n {8}padding-inline: var\(--space-inset-item-x-md\);/,
    );
    assert.match(
        css,
        /@utility p-inset-surface \{\n {4}padding: var\(--space-inset-surface-y\) var\(--space-inset-surface-x\);/,
    );
    assert.match(css, /@utility gap-group \{\n {4}gap: var\(--space-gap-group\);/);
    assert.match(css, /@utility space-y-related \{\n {4}:where\(& > :not\(:last-child\)\) \{/);
    assert.match(css, /@utility -mx-inset-page \{\n {4}margin-inline: calc\(var\(--space-inset-page-x\) \* -1\);/);
    assert.match(css, /@utility h-control-md \{/);
    assert.match(css, /@utility min-h-row \{/);
    assert.doesNotMatch(css, /@utility py-control-md /, 'no utility for a dimension a size does not have');
    // Nothing enters Tailwind's spacing namespace, so no width or inset utility can read a role.
    assert.doesNotMatch(css, /--spacing/);
    assert.doesNotMatch(css, /@utility (w|inset|top|translate)-(inset|gap)/);
    // Every utility has the same shape: one base declaration group and one md group.
    const blocks = css.split('@utility ').slice(1);
    assert.equal(blocks.length, spacing.utilities.length);
    for (const block of blocks) {
        assert.equal(block.match(/@variant md/g)?.length, 1, block.split('\n')[0]);
    }
    assert.match(outputs.get('packages/gov-ui-kit/src/core/types/spacingStyles.ts'), /export const spacingRoles = \[/);
});

test('an exception renders its Today value and follows its role per axis in every preview mode', (context) => {
    const dir = scratch(context);
    addException(dir, 'inset-item-flat--test-14', ['px', 'p'], 14, 14);
    addException(dir, 'gap-group--test-12-16', ['gap', 'mt'], 12, 16);
    const css = spacingCss(dir);
    assert.match(css, /--space-inset-item-flat--test-14-x: 14px;/);
    assert.match(css, /--space-inset-item-flat--test-14-y-md: 14px;/);
    assert.match(css, /--space-inset-item-flat--test-14-x: var\(\s*--space-inset-item-flat-x\s*\);/);
    assert.match(css, /--space-inset-item-flat--test-14-y-md: var\(\s*--space-inset-item-flat-y-md\s*\);/);
    assert.match(css, /--space-gap-group--test-12-16-md: 16px;/);
    assert.match(css, /--space-gap-group--test-12-16: var\(--space-gap-group\);/);
    // Only the families it lists.
    assert.match(css, /@utility px-inset-item-flat--test-14 \{/);
    assert.match(css, /@utility p-inset-item-flat--test-14 \{/);
    assert.doesNotMatch(css, /@utility py-inset-item-flat--test-14 /);
    assert.match(css, /@utility gap-group--test-12-16 \{/);
    assert.match(css, /@utility mt-group--test-12-16 \{/);
});

test('a chrome exception carries its own snapped values, one scale step apart', (context) => {
    const dir = scratch(context);
    addException(dir, 'gap-nav-related--test-12', ['gap'], 12, 12, {
        base: { new: px(12), looser: px(16), compact: px(8) },
        md: { new: px(12), looser: px(16), compact: px(8) },
    });
    const css = spacingCss(dir);
    assert.match(css, /\[data-spacing="looser"\] \{[^}]*--space-gap-nav-related--test-12: 16px;/s);
    const bad = scratch(context);
    addException(bad, 'gap-nav-related--test-12', ['gap'], 12, 12, {
        base: { new: px(12), looser: px(24), compact: px(8) },
        md: { new: px(12), looser: px(16), compact: px(8) },
    });
    assert.throws(() => generateAll({ sourceDir: bad }), /chrome exception gap-nav-related--test-12\.base/);
});

const roleSide = (json, role, axis, side) => (axis ? json.space.role[role][axis][side] : json.space.role[role][side]);
const modeOf = (token) => token.$extensions['org.aragon.gov-ui-kit'].modes;
for (const [name, file, change, expected] of [
    [
        'a preview value off the scale',
        'spacing.roles.tokens.json',
        (json) => {
            modeOf(roleSide(json, 'gap-group', null, 'md')).new = px(28);
        },
        /gap-group\.md new 28px is not on the scale/,
    ],
    [
        'a compact value above New',
        'spacing.roles.tokens.json',
        (json) => {
            modeOf(roleSide(json, 'inset-item', 'x', 'base')).compact = px(20);
        },
        /inset-item\.x\.base must hold compact <= new <= looser/,
    ],
    [
        'a role that steps down at md',
        'spacing.roles.tokens.json',
        (json) => {
            modeOf(roleSide(json, 'gap-tight', null, 'md')).looser = px(4);
            modeOf(roleSide(json, 'gap-tight', null, 'md')).new = px(4);
            modeOf(roleSide(json, 'gap-tight', null, 'base')).new = px(4);
            modeOf(roleSide(json, 'gap-tight', null, 'base')).looser = px(6);
            modeOf(roleSide(json, 'gap-tight', null, 'md')).compact = px(2);
        },
        /gap-tight looser steps down at md/,
    ],
    [
        'gap levels out of order',
        'spacing.roles.tokens.json',
        (json) => {
            for (const side of ['base', 'md']) {
                modeOf(roleSide(json, 'gap-related', null, side)).looser = px(24);
            }
        },
        /gap levels .* out of order in looser/,
    ],
    [
        'a phone page gutter below the floor',
        'spacing.roles.tokens.json',
        (json) => {
            modeOf(roleSide(json, 'inset-page', 'x', 'base')).compact = px(12);
        },
        /inset-page\.x\.base compact 12px is below the floor 16px/,
    ],
    [
        'a chrome role off its step rule',
        'spacing.roles.tokens.json',
        (json) => {
            modeOf(roleSide(json, 'gap-nav-group', null, 'base')).looser = px(24);
        },
        /chrome role gap-nav-group\.base/,
    ],
    [
        'a compact control under 28 px',
        'spacing.sizes.tokens.json',
        (json) => {
            modeOf(json.size['control-sm'].height.base).compact = px(24);
        },
        /control-sm\.height\.base compact 24px is below the floor 28px/,
    ],
]) {
    test(`the spacing source rejects ${name}`, (context) => {
        const dir = scratch(context);
        edit(dir, file, change);
        assert.throws(() => generateAll({ sourceDir: dir }), expected);
    });
}

for (const [name, args, expected] of [
    [
        'an exception of no role',
        ['gap-huge--fixed-8', ['gap'], 8, 8],
        /exception gap-huge--fixed-8 must be named <role>--<pattern> after an existing role/,
    ],
    ['an exception without a pattern', ['gap-group', ['gap'], 8, 8], /must be named <role>--<pattern>/],
    ['a family of another kind', ['gap-group--fixed-8', ['px'], 8, 8], /family px is not a gap-group family/],
    ['a size family the size lacks', ['control-md--fixed-10', ['py'], 10, 10], /family py is not a control-md family/],
    ['an exception equal to its role', ['gap-group--fixed-16', ['gap'], 16, 16], /renders its role's Today value/],
    [
        'an exception with preview modes',
        [
            'gap-group--fixed-8',
            ['gap'],
            8,
            8,
            { base: { new: px(8), looser: px(8), compact: px(8) }, md: { new: px(8), looser: px(8), compact: px(8) } },
        ],
        /must not carry modes/,
    ],
]) {
    test(`the spacing source rejects ${name}`, (context) => {
        const dir = scratch(context);
        addException(dir, ...args);
        assert.throws(() => generateAll({ sourceDir: dir }), expected);
    });
}

test('spacing token files without spacing.config.json are rejected', (context) => {
    const dir = scratch(context);
    rmSync(join(dir, 'spacing.config.json'));
    assert.throws(() => generateAll({ sourceDir: dir }), /spacing\..*tokens\.json without spacing\.config\.json/);
});
