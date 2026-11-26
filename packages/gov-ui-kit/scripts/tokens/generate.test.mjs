// Tests of the token generator (`pnpm test:tokens`). Mutations run against a scratch copy of the token source; the
// repository files are never touched.

import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { compile } from 'tailwindcss';
import { generate, staleFiles } from './generate.mjs';

const kitRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const sourceDir = resolve(kitRoot, 'design-system/tokens/source');
const cssFile = (name) => resolve(kitRoot, `src/theme/tokens/primitives/${name}.css`);
const previewFile = resolve(kitRoot, 'design-system/tokens/preview/colors.css');

// A scratch copy of the source with one JSON file changed.
const mutated = (context, file, change) => {
    const dir = mkdtempSync(join(tmpdir(), 'govkit-tokens-'));
    context.after(() => rmSync(dir, { recursive: true, force: true }));
    cpSync(sourceDir, dir, { recursive: true });
    const json = JSON.parse(readFileSync(join(dir, file), 'utf8'));
    change(json);
    writeFileSync(join(dir, file), `${JSON.stringify(json, null, 4)}\n`);
    return dir;
};

test('the files on disk are what the source generates, and generation is deterministic', () => {
    const files = generate();
    assert.deepEqual(staleFiles(files), []);
    assert.deepEqual([...generate()], [...files]);
});

test('the generated CSS keeps its constructs', () => {
    const files = generate();
    const css = (name) => files.get(cssFile(name));
    assert.match(css('colors'), /GENERATED/);
    assert.match(css('colors'), /@theme \{\n {4}--color-\*: initial;\n {4}--color-primary-50: #f5f8ff;/);
    assert.match(css('colors'), /--color-primary-500: #003bf5;/);
    assert.match(css('colors'), /--color-transparent: transparent;/);
    assert.match(css('borderRadius'), /--radius-none: none;/);
    assert.match(css('focusRing'), /--ring-color-primary: var\(--color-primary-200\);/);
    assert.match(css('shadows'), /--shadow-neutral: 0px 1px 3px 0px rgba\(97, 110, 124, 0\.1\), 0px 1px 2px -1px rgba/);
    assert.match(css('typography'), /--font-sans: "Manrope", ui-sans-serif, /);
    // Pixel breakpoints stay in a plain :root rule, rem breakpoints in @theme.
    assert.match(css('breakpoints'), /:root \{\n {4}--breakpoint-sm-px: 640;/);
    assert.match(css('breakpoints'), /@theme \{\n {4}--breakpoint-\*: initial;\n {4}--breakpoint-sm: 40rem;/);
    assert.match(css('index'), /@import "\.\/borderRadius\.css";\n@import "\.\/breakpoints\.css";/);
});

test('a layer lays out the tokens of its own document, in its own dir', () => {
    const files = generate();
    const css = (path) => files.get(resolve(kitRoot, path));
    assert.match(css('design-system/tokens/app/colors.css'), /--guk-bg-body-sidebar: var\(--color-neutral-25\);/);
    assert.doesNotMatch(css('src/theme/tokens/semantic/colors.css'), /--guk-bg-body-sidebar:/);
});

test('a status shadow primitive has no class name, and each status shadow role aliases one', () => {
    const files = generate();
    const declarations = (layer) =>
        [...files.get(resolve(kitRoot, `src/theme/tokens/${layer}/shadows.css`)).matchAll(/^ {4}(--[\w-]+): (.+);$/gm)]
            .map(([, name, value]) => [name, value])
            .filter(([name]) => /^--shadow-(?:success|warning|critical|info)(?:-|$)/.test(name));
    assert.deepEqual(declarations('primitives'), []);
    const roles = declarations('semantic');
    assert(roles.length > 0);
    for (const [name, value] of roles) {
        assert.match(value, /^var\(--guk-shadow-[\w-]+\)$/, name);
    }
});

test('a changed token makes its file stale', (context) => {
    const dir = mutated(context, 'primitives.tokens.json', (json) => {
        json.radius.md.$value.value = 5;
    });
    assert.deepEqual(staleFiles(generate(dir)), [cssFile('borderRadius')]);
});

test('a shadow preserves inset per layer and supports a whole-token alias', (context) => {
    const dir = mutated(context, 'primitives.tokens.json', ({ shadow }) => {
        shadow.neutral.$value[0].inset = true;
        shadow.neutral.$value[1].inset = false;
        shadow['neutral-sm'].$value = '{shadow.neutral}';
    });
    const css = generate(dir).get(cssFile('shadows'));
    assert.match(css, /--shadow-neutral-sm: var\(--shadow-neutral\);/);
    assert.match(css, /--shadow-neutral: inset 0px 1px 3px 0px rgba\([^)]+\), 0px 1px 2px -1px rgba/);
});

for (const [field, reference] of [
    ['offsetX', '{spacing.base}'],
    ['color', '{color.primary.500}'],
    ['inset', { $ref: '#/shadow/neutral/$value/0/inset' }],
]) {
    test(`a shadow reference in ${field} identifies the unsupported field`, (context) => {
        const dir = mutated(context, 'primitives.tokens.json', ({ shadow }) => {
            shadow['neutral-sm'].$value[0][field] = reference;
        });
        assert.throws(() => generate(dir), { message: `Unsupported shadow reference at shadow.neutral-sm.0.${field}` });
    });
}

test('a reference used as a shadow layer identifies the unsupported layer', (context) => {
    const dir = mutated(context, 'primitives.tokens.json', ({ shadow }) => {
        shadow['neutral-sm'].$value.push('{shadow.primary}');
    });
    assert.throws(() => generate(dir), { message: 'Unsupported shadow reference at shadow.neutral-sm.1' });
});

test('a colour without a hex gets it written into the source', (context) => {
    const dir = mutated(context, 'primitives.tokens.json', (json) => {
        delete json.color.primary['500'].$value.hex;
    });
    const files = generate(dir);
    const source = join(dir, 'primitives.tokens.json');
    assert.deepEqual(staleFiles(files), [source]);
    assert.equal(files.get(source), readFileSync(join(sourceDir, 'primitives.tokens.json'), 'utf8'));
});

for (const [name, file, change, expected] of [
    [
        'a dangling alias',
        'primitives.tokens.json',
        (json) => {
            json.ring.color.primary.$value = '{color.missing.100}';
        },
        /Missing alias target: color\.missing\.100 \(from ring\.color\.primary\)/,
    ],
    [
        'an alias cycle',
        'primitives.tokens.json',
        (json) => {
            json.ring.color.primary.$value = '{ring.color.success}';
            json.ring.color.success.$value = '{ring.color.primary}';
        },
        /Alias cycle/,
    ],
    [
        'an alias of another type',
        'primitives.tokens.json',
        (json) => {
            json.ring.color.primary.$value = '{spacing.base}';
        },
        /Alias type mismatch: ring\.color\.primary/,
    ],
    [
        'a value of another type',
        'primitives.tokens.json',
        (json) => {
            json.color.transparent.$value = structuredClone(json.spacing.base.$value);
        },
        /DTCG value color\.transparent/,
    ],
    [
        'a hex that disagrees with its components',
        'primitives.tokens.json',
        (json) => {
            json.color.primary['500'].$value.hex = '#112233';
        },
        /Colour hex #112233 does not match its components \(#003bf5\).*set the components to \[0\.0666/,
    ],
    [
        'a changed schema version',
        'primitives.tokens.json',
        (json) => {
            json.$schema = 'https://example.com/other.json';
        },
        /DTCG schema version changed/,
    ],
    [
        'a token the layout does not place',
        'primitives.tokens.json',
        (json) => {
            json.zindex = { $type: 'number', modal: { $value: 30 } };
        },
        /places no CSS for: zindex\.modal/,
    ],
    [
        'a token the layout places twice',
        'primitives.config.json',
        (json) => {
            json.files['colors.css']['@theme'].push('color.primary');
        },
        /token color\.primary\.50 is placed twice/,
    ],
    [
        'a layout line that matches no token',
        'primitives.config.json',
        (json) => {
            json.files['colors.css']['@theme'].push('colour');
        },
        /no token at or under colour/,
    ],
    [
        'two tokens with one CSS name',
        'semantic.config.json',
        (json) => {
            json.cssNames['semantic.text.*.*'] = '--guk-bg-$1-$2';
        },
        /semantic\.text\.\S+ and semantic\.bg\.\S+ share the CSS name --guk-bg-/,
    ],
    [
        'a dangling alias in a mode',
        'modes/semantic.next.tokens.json',
        ({ semantic }) => {
            semantic.bg.surface.primary.$value = '{palette.missing.0}';
        },
        /Missing alias target: palette\.missing\.0 \(from semantic\.bg\.surface\.primary\)/,
    ],
]) {
    test(`the generator rejects ${name}`, (context) => {
        assert.throws(() => generate(mutated(context, file, change)), expected);
    });
}

// The preview's declarations per mode selector, for a scratch source (or the repository's).
const previewModes = (dir) =>
    Object.fromEntries(
        [
            ...generate(dir)
                .get(previewFile)
                .matchAll(/\n(\S[^{\n]*) \{\n([^}]*)\}/g),
        ].map(([, selector, body]) => [selector, body.trim().split(/\n\s*/)]),
    );
const NEXT = ':root[data-theme="next"], [data-theme="next"]';

test('a mode override adds exactly its declaration to its mode in the preview', (context) => {
    const dir = mutated(context, 'modes/semantic.next.tokens.json', ({ semantic }) => {
        semantic.bg.surface.primary.$value = { colorSpace: 'srgb', components: [0x11 / 255, 0x22 / 255, 0x33 / 255] };
    });
    const before = previewModes();
    const after = previewModes(dir);
    assert.deepEqual(
        after[NEXT].filter((line) => !before[NEXT].includes(line)),
        ['--guk-bg-surface-primary: #112233;'],
    );
    assert.equal(after[NEXT].length, before[NEXT].length + 1);
    assert.deepEqual({ ...after, [NEXT]: [] }, { ...before, [NEXT]: [] });
});

test('a token a mode leaves at its default value is not written', (context) => {
    const { color } = JSON.parse(readFileSync(join(sourceDir, 'primitives.tokens.json'), 'utf8'));
    const dir = mutated(context, 'modes/semantic.next.tokens.json', ({ semantic }) => {
        semantic.text.surface.placeholder.$value = color.neutral['300'].$value;
    });
    const before = previewModes()[NEXT];
    const after = previewModes(dir)[NEXT];
    assert.deepEqual(
        before.filter((line) => !after.includes(line)),
        before.filter((line) => line.startsWith('--guk-text-surface-placeholder:')),
    );
    assert.equal(after.length, before.length - 1);
});

test('role classes compile once, after their primitive siblings, and keep variants and @apply', async () => {
    const loadStylesheet = async (id, base) => {
        const path =
            id === 'tailwindcss' ? fileURLToPath(import.meta.resolve('tailwindcss/index.css')) : resolve(base, id);
        return { path, base: dirname(path), content: readFileSync(path, 'utf8') };
    };
    const entry = [
        '@import "./src/theme/tokens/index.css";',
        '@import "tailwindcss";',
        '.probe { @apply bg-surface-primary; }',
    ].join('\n');
    const { build } = await compile(entry, { base: kitRoot, loadStylesheet });
    const css = build([
        'bg-surface-primary',
        'bg-neutral-0',
        'text-surface-primary',
        'icon-surface-primary',
        'text-sm',
        'border-2',
        'border-surface-primary',
        'border-t-surface-primary',
        'ring-accent-focus',
        'hover:bg-surface-hover',
        'aria-disabled:text-surface-disabled',
        'md:border-x-accent-default',
        'shadow-success-sm',
    ]);
    const rule = (selector) => {
        const rules = css.match(
            new RegExp(`\\n\\s*${selector.replace(/[\\.:[\]()"=]/g, '\\$&')} \\{\\n([^}]*)\\}`, 'g'),
        );
        assert.equal(rules?.length, 1, `one rule for ${selector}`);
        return rules[0].split('{')[1].trim().replace(/\s+/g, ' ');
    };
    assert.equal(rule('.bg-surface-primary'), 'background-color: var(--guk-bg-surface-primary); }');
    assert.equal(rule('.text-surface-primary'), 'color: var(--guk-text-surface-primary); }');
    assert.equal(rule('.icon-surface-primary'), 'color: var(--guk-icon-surface-primary); }');
    assert.equal(rule('.border-surface-primary'), 'border-color: var(--guk-border-surface-primary); }');
    assert.equal(rule('.border-t-surface-primary'), 'border-top-color: var(--guk-border-surface-primary); }');
    assert.equal(rule('.ring-accent-focus'), '--tw-ring-color: var(--guk-ring-accent-focus); }');
    assert.equal(rule('.bg-neutral-0'), 'background-color: var(--color-neutral-0); }');
    assert.match(rule('.text-sm'), /^font-size: var\(--text-sm\);/);
    assert.match(rule('.border-2'), /border-width: 2px;/);
    assert.equal(rule('.hover\\:bg-surface-hover:hover'), 'background-color: var(--guk-bg-surface-hover); }');
    assert.equal(
        rule('.aria-disabled\\:text-surface-disabled[aria-disabled="true"]'),
        'color: var(--guk-text-surface-disabled); }',
    );
    assert.equal(rule('.md\\:border-x-accent-default'), 'border-inline-color: var(--guk-border-accent-default); }');
    assert.equal(rule('.probe'), 'background-color: var(--guk-bg-surface-primary); }');
    // A status shadow class reads the primitive's variable, which a preview mode overrides.
    assert.match(rule('.shadow-success-sm'), /^--tw-shadow: var\(--guk-shadow-success-sm\);/);
    assert(css.indexOf('.bg-neutral-0 {') < css.indexOf('.bg-surface-primary {'));
    assert(css.indexOf('.icon-surface-primary {') < css.indexOf('.text-surface-primary {'));
    assert.match(css, /--guk-bg-surface-primary: var\(--color-neutral-0\);/);
    assert.doesNotMatch(css, /--guk-bg-surface-tertiary:/);
});

test('the js and css lint plugins match the same classes', () => {
    const patterns = (language) =>
        readFileSync(resolve(kitRoot, `biome-plugins/${language}/noPrimitiveColors.grit`), 'utf8').match(/r"[^"]*"/g);
    assert.equal(patterns('js').length, 2);
    assert.deepEqual(patterns('css'), patterns('js'));
});
