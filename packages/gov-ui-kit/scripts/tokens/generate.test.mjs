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

test('a source without typography.config.json generates the primitives only', (context) => {
    const dir = scratch(context);
    for (const name of readdirSync(dir).filter(
        (file) => file === 'typography.config.json' || file.endsWith('.tokens.json'),
    )) {
        if (name !== 'primitives.tokens.json') {
            rmSync(join(dir, name));
        }
    }
    const { outputs, typography } = generateAll({ sourceDir: dir });
    assert.equal(typography, null);
    assert.equal(outputs.size, 9);
    assert.ok(![...outputs.keys()].some((file) => file.endsWith('tokens/typography.css')));
    // The primitive outputs do not depend on the typography layer.
    for (const [file, text] of outputs) {
        assert.equal(text, generateAll().outputs.get(file), file);
    }
});

test('the typography layer keeps Today inherited and swaps families in Next only', () => {
    const { outputs, typography } = generateAll();
    const css = outputs.get('packages/gov-ui-kit/src/theme/tokens/typography.css');
    const [today, next] = css.split('[data-typography="next"] {');
    // Today: sizes, line heights and weights are set; family and letter spacing are left to inheritance.
    assert.match(today, /--type-supporting-font-size: var\(--text-sm\);/);
    assert.doesNotMatch(today, /--type-supporting-font-family/);
    assert.doesNotMatch(today, /--type-title-item-letter-spacing/);
    // Next: the designer's faces, and every exception follows its role.
    assert.match(next, /--type-display-font-family: var\(--font-sora\);/);
    assert.match(next, /--type-body-font-family: var\(--font-inter-display\);/);
    const exception = typography.exceptionNames[0];
    const role = typography.styles.get(exception).role;
    assert.match(next, new RegExp(`--type-${exception}-font-size: var\\(\\s*--type-${role}-font-size\\s*\\);`));
    // One utility per role and exception, switching through the md variant; the modifiers.
    assert.match(css, /@utility type-supporting \{[^}]*@variant md \{/s);
    for (const modifier of ['strong', 'mono', 'numeric']) {
        assert.match(css, new RegExp(`@utility type-${modifier} \\{`));
    }
    assert.equal([...css.matchAll(/@utility type-/g)].length, typography.styles.size + 3);
});

for (const [name, file, change, expected] of [
    [
        'a Next mode that misses a Today token',
        'typography.next.tokens.json',
        (json) => {
            const [first] = Object.keys(json.type.exception);
            delete json.type.exception[first];
        },
        /typography mode next differs from today: missing type\.exception\./,
    ],
    [
        'an exception not named after a role',
        'typography.today.tokens.json',
        (json) => {
            const [first] = Object.keys(json.type.exception);
            json.type.exception[`nonexistent--${first.split('--')[1]}`] = json.type.exception[first];
            delete json.type.exception[first];
        },
        /must be named <role>--<pattern>|differs from today/,
    ],
    [
        'an exception that follows another role in Next',
        'typography.next.tokens.json',
        (json) => {
            const [first] = Object.keys(json.type.exception);
            const role = first.split('--')[0] === 'caption' ? 'body' : 'caption';
            json.type.exception[first].base.$value = `{type.role.${role}.base}`;
        },
        /may only alias type\.role\./,
    ],
]) {
    test(`the typography layer rejects ${name}`, (context) => {
        const dir = scratch(context);
        edit(dir, file, change);
        assert.throws(() => generateAll({ sourceDir: dir }), expected);
    });
}

test('typography mode files without typography.config.json are rejected', (context) => {
    const dir = scratch(context);
    rmSync(join(dir, 'typography.config.json'));
    assert.throws(
        () => generateAll({ sourceDir: dir }),
        /typography\..+\.tokens\.json without typography\.config\.json/,
    );
});

test('a number ratio must equal the stored value', (context) => {
    const dir = scratch(context);
    edit(dir, 'primitives.tokens.json', (json) => {
        const [key] = Object.keys(json.font.leadingDefault).filter((k) => !k.startsWith('$'));
        json.font.leadingDefault[key].$extensions = { 'org.aragon.gov-ui-kit': { ratio: [1, 3] } };
    });
    assert.throws(() => generateAll({ sourceDir: dir }), /does not equal its value/);
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
