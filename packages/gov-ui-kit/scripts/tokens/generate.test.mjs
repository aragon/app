// Tests of the token generator (`pnpm test:tokens`). Mutations run against a scratch copy of the token source; the
// repository files are never touched.

import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { generate, staleFiles } from './generate.mjs';

const kitRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const sourceDir = resolve(kitRoot, 'design-system/tokens/source');
const cssFile = (name) => resolve(kitRoot, `src/theme/tokens/primitives/${name}.css`);

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
]) {
    test(`the generator rejects ${name}`, (context) => {
        assert.throws(() => generate(mutated(context, file, change)), expected);
    });
}
