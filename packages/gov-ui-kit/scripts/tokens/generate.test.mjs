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
const cssFile = (name, layer = 'primitives') => resolve(kitRoot, `src/theme/tokens/${layer}/${name}.css`);
const previewFile = (name) => resolve(kitRoot, `design-system/tokens/preview/${name}.css`);

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
    assert.match(css('typography'), /--leading-default-lg: calc\(1\.75 \/ 1\.125\);/);
    // Pixel breakpoints stay in a plain :root rule, rem breakpoints in @theme.
    assert.match(css('breakpoints'), /:root \{\n {4}--breakpoint-sm-px: 640;/);
    assert.match(css('breakpoints'), /@theme \{\n {4}--breakpoint-\*: initial;\n {4}--breakpoint-sm: 40rem;/);
    assert.match(css('index'), /@import "\.\/borderRadius\.css";\n@import "\.\/breakpoints\.css";/);
});

test('a typography composite becomes one theme variable per part, a part alias a var()', () => {
    const css = generate().get(cssFile('roles', 'typography'));
    assert(
        css.includes(
            [
                '--guk-type-font-family-display: var(--font-sans);',
                '--guk-type-font-size-display: var(--text-3xl);',
                '--guk-type-font-weight-display: var(--font-weight-normal);',
                '--guk-type-letter-spacing-display: 0px;',
                '--guk-type-line-height-display: var(--leading-tight);',
                '--guk-type-md-font-size-display: var(--text-5xl);',
                '--guk-type-md-line-height-display: var(--leading-tight);',
                '--guk-type-md-letter-spacing-display: 0px;',
            ].join('\n    '),
        ),
    );
    assert.match(css, /--guk-type-line-height-supporting--framework-leading: var\(--leading-default-sm\);/);
    assert.match(css, /--guk-type-strong: var\(--font-weight-semibold\);/);
    assert.doesNotMatch(css, /--guk-type-md-font-(family|weight)-/);
});

test('a layer lays out the tokens of its own document, in its own dir', () => {
    const files = generate();
    const css = (path) => files.get(resolve(kitRoot, path));
    assert.match(css('design-system/tokens/app/colors.css'), /--guk-bg-body-sidebar: var\(--color-neutral-25\);/);
    assert.doesNotMatch(css('src/theme/tokens/semantic/colors.css'), /--guk-bg-body-sidebar:/);
    assert.match(css('design-system/tokens/app/typography.css'), /--guk-type-font-size-body--xmaquina-header:/);
    assert.doesNotMatch(css('src/theme/tokens/typography/roles.css'), /xmaquina/);
});

test('a spacing value becomes a theme variable per dimension and width, the app-only ones in the app layer', () => {
    const files = generate();
    const css = (path) => files.get(resolve(kitRoot, path));
    const roles = css('src/theme/tokens/spacing/roles.css');
    assert(
        roles.includes(
            [
                '--guk-space-x-inset-item: 16px;',
                '--guk-space-md-x-inset-item: 24px;',
                '--guk-space-y-inset-item: 12px;',
                '--guk-space-md-y-inset-item: 20px;',
            ].join('\n    '),
        ),
    );
    // A gap drops its `gap-` prefix; a size names its dimension; an exception keeps its pattern.
    assert.match(roles, /--guk-space-gap-related: 12px;\n {4}--guk-space-md-gap-related: 12px;/);
    assert.match(roles, /--guk-space-height-control-md: 40px;/);
    assert.match(roles, /--guk-space-gap-related--8-12: 8px;\n {4}--guk-space-md-gap-related--8-12: 12px;/);
    assert.match(css('design-system/tokens/app/spacing.css'), /--guk-space-x-inset-page: 16px;/);
    assert.doesNotMatch(roles, /inset-page/);
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
        'a typography part alias of another type',
        'typography.tokens.json',
        ({ type }) => {
            type.role.display.base.$value.fontSize = '{color.primary.500}';
        },
        /Alias type mismatch: type\.role\.display\.base\.fontSize/,
    ],
    [
        'a ratio that is not its number',
        'primitives.tokens.json',
        ({ font }) => {
            font.leadingDefault.lg.$extensions['org.aragon.gov-ui-kit'].ratio = [1.75, 1.25];
        },
        /The ratio 1\.75 \/ 1\.25 is not 1\.5555555555555556/,
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

// A preview file's declarations per mode selector, for a scratch source (or the repository's).
const previewModes = (dir, file = 'colors') =>
    Object.fromEntries(
        [
            ...generate(dir)
                .get(previewFile(file))
                .matchAll(/\n(\S[^{\n]*) \{\n([^}]*)\}/g),
        ].map(([, selector, body]) => [selector, body.trim().split(/\n\s*/)]),
    );
const NEXT = ':root[data-theme="next"], [data-theme="next"]';
const NEXT_TYPOGRAPHY = ':root[data-typography="next"], [data-typography="next"]';

test('in a mode, an exception follows its role by the rule, and a CSS line is written as is', (context) => {
    const dir = mutated(context, 'modes/typography.next.tokens.json', ({ type }) => {
        type.role.caption.base.$value.fontSize = '{font.size.5xl}';
    });
    // The kit's exceptions and the app's alike.
    const exceptions = ['typography', 'app'].flatMap((layer) =>
        Object.keys(JSON.parse(readFileSync(join(sourceDir, `${layer}.tokens.json`), 'utf8')).type.exception),
    );
    const captions = ['caption', ...exceptions.filter((name) => name.startsWith('caption--'))];
    const lines = previewModes(dir, 'typography')[NEXT_TYPOGRAPHY];
    assert.deepEqual(
        lines.filter((line) => /^--guk-type-font-size-caption(--|:)/.test(line)).sort(),
        captions.map((name) => `--guk-type-font-size-${name}: 3rem;`).sort(),
    );
    assert.equal(lines.at(-1), '--guk-type-numeric: tabular-nums;');
});

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

const spacingPreview = (dir) => generate(dir).get(previewFile('spacing'));
const SPACING = (mode) => `:root[data-spacing="${mode}"], [data-spacing="${mode}"]`;
// The declarations of one top-level block of a preview file, or of the block inside one at-rule.
const declarations = (css, selector, atRule) => {
    const scope = atRule ? css.slice(css.indexOf(`\n${atRule} {`)) : css;
    const body = scope.slice(scope.indexOf(`${selector} {\n`) + selector.length + 3);
    return body.slice(0, body.indexOf('}')).trim().split(/\n\s*/);
};

test('in a mode, an exception the mode document sets keeps its value; the others follow their role', (context) => {
    const dir = mutated(context, 'modes/spacing.new.tokens.json', ({ space }) => {
        space.role['gap-related'].base.$value.value = 20;
    });
    const lines = declarations(spacingPreview(dir), SPACING('new'));
    assert(lines.includes('--guk-space-gap-related: 20px;'));
    assert(lines.includes('--guk-space-gap-related--8-12: 20px;'));
    // gap-related--fixed-12 has its own value in the New document.
    assert(lines.includes('--guk-space-gap-related--fixed-12: 8px;'));
});

test('a mode inside an at-rule adds to the same mode outside it and writes only what differs from it', (context) => {
    const coarse = declarations(spacingPreview(), SPACING('compact'), '@media (pointer: coarse)');
    const compact = declarations(spacingPreview(), SPACING('compact'));
    assert(coarse.includes('--guk-space-height-control-md: 40px;'));
    assert(compact.includes('--guk-space-height-control-md: 36px;'));
    // An exception that follows its size follows it inside the at-rule too.
    assert(coarse.includes('--guk-space-y-control-lg--fixed-16: 12px;'));
    assert.deepEqual(
        coarse.filter((line) => compact.includes(line)),
        [],
    );
    const dir = mutated(context, 'modes/spacing.compact.coarse.tokens.json', ({ space }) => {
        space.size['control-md'].height.base.$value.value = 36;
    });
    const after = declarations(spacingPreview(dir), SPACING('compact'), '@media (pointer: coarse)');
    assert.deepEqual(
        coarse.filter((line) => !after.includes(line)),
        ['--guk-space-height-control-md: 40px;'],
    );
});

test('in looser no spacing value is tighter than the default, in compact none is looser', () => {
    const files = generate();
    const values = (lines) =>
        new Map(
            lines.map((line) => {
                const [, name, px] = line.match(/^(--[\w-]+): (\d+)px;$/);
                return [name, Number(px)];
            }),
        );
    const defaults = values(
        [cssFile('roles', 'spacing'), resolve(kitRoot, 'design-system/tokens/app/spacing.css')].flatMap((file) =>
            declarations(files.get(file), '@theme'),
        ),
    );
    const preview = files.get(previewFile('spacing'));
    // The coarse block writes only what differs from compact; the rest is checked with compact.
    const blocks = [
        ['spacing.looser', declarations(preview, SPACING('looser')), (px, def) => px < def],
        ['spacing.compact', declarations(preview, SPACING('compact')), (px, def) => px > def],
        [
            'spacing.compact.coarse',
            declarations(preview, SPACING('compact'), '@media (pointer: coarse)'),
            (px, def) => px > def,
        ],
    ];
    const wrongWay = blocks.flatMap(([document, lines, isWrong]) =>
        [...values(lines)]
            .filter(([name, px]) => isWrong(px, defaults.get(name)))
            .map(([name, px]) => `${document}: ${name} is ${px}px, default ${defaults.get(name)}px`),
    );
    assert.deepEqual(
        wrongWay,
        [],
        'Set these to their default value in modes/<document>.tokens.json: an exception the document leaves out follows its role or size',
    );
});

// The kit's token CSS and Tailwind compiled with `extra` CSS after them, for the given class candidates.
const compileTokens = async (extra, candidates) => {
    const loadStylesheet = async (id, base) => {
        const path =
            id === 'tailwindcss' ? fileURLToPath(import.meta.resolve('tailwindcss/index.css')) : resolve(base, id);
        return { path, base: dirname(path), content: readFileSync(path, 'utf8') };
    };
    const entry = ['@import "./src/theme/tokens/index.css";', '@import "tailwindcss";', extra].join('\n');
    const { build } = await compile(entry, { base: kitRoot, loadStylesheet });
    return build(candidates);
};

test('role classes compile once, after their primitive siblings, and keep variants and @apply', async () => {
    const css = await compileTokens('.probe { @apply bg-surface-primary; }', [
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

test('type roles compile with variants and @apply, before raw type classes and the modifiers', async () => {
    const css = await compileTokens('.probe { @apply type-supporting type-strong; }', [
        'type-supporting',
        'type-title-item--entity-list',
        'md:type-control',
        'placeholder:type-caption',
        'text-lg',
        'leading-normal',
        'font-semibold',
        'tracking-wide',
        'type-strong',
        'type-mono',
        'type-numeric',
        'type-nonexistent',
    ]);
    const role = css.slice(css.indexOf('.type-supporting {'), css.indexOf('.type-title-item--entity-list {'));
    assert.match(role, /^\.type-supporting \{\n\s+font-family: var\(--guk-type-font-family-supporting\);/);
    // The md step sets the parts that may step, not the family and the weight.
    assert.match(
        role,
        /@media \(width >= 48rem\) \{\n\s+font-size: var\(--guk-type-md-font-size-supporting\);\n\s+line-height: var\(--guk-type-md-line-height-supporting\);\n\s+letter-spacing: var\(--guk-type-md-letter-spacing-supporting\);\n\s+\}/,
    );
    assert.match(css, /\.placeholder\\:type-caption::placeholder \{/);
    assert.match(css, /@media \(width >= 48rem\) \{\n\s+\.md\\:type-control \{/);
    assert.match(css, /\.probe \{[\s\S]*\n {2}\}\n {2}font-weight: var\(--guk-type-strong\);\n\}/);
    for (const later of ['.text-lg {', '.leading-normal {', '.font-semibold {', '.tracking-wide {', '.type-strong {']) {
        assert(css.indexOf('.type-title-item--entity-list {') < css.indexOf(later), `the roles before ${later}`);
    }
    // The modifiers' variables are emitted with their classes; numeric falls back to the parent's figures.
    assert.match(css, /--guk-type-strong: var\(--font-weight-semibold\);/);
    assert.match(css, /--guk-type-mono: var\(--font-mono\);/);
    assert.match(css, /\.type-numeric \{\n\s+font-variant-numeric: var\(--guk-type-numeric, inherit\);/);
    assert.doesNotMatch(css, /--tw-leading: var\(--guk|--guk-type-font-size-display:|type-nonexistent/);
});

test('a type role steps with the md variant of the build that compiles it', async () => {
    const css = await compileTokens('@custom-variant md { @container app (width >= 48rem) { @slot; } }', [
        'type-supporting',
    ]);
    assert.match(css, /@container app \(width >= 48rem\) \{\n\s+font-size: var\(--guk-type-md-font-size-supporting\);/);
});

test('spacing roles step with md and sort before raw classes of their property; between two the later name wins', async () => {
    const candidates = ['gap-3', 'gap-related--8-12', 'gap-related', 'p-4', 'p-inset-surface', 'mt-2', 'mt-section'];
    const css = await compileTokens('', [
        ...candidates,
        'h-10',
        'h-control-md',
        'space-y-4',
        'space-y-section',
        'gap-related!',
    ]);
    const at = (selector) => {
        const index = css.indexOf(`\n  ${selector} `);
        assert(index >= 0, selector);
        return index;
    };
    assert(at('.gap-related') < at('.gap-related--8-12'));
    for (const [role, raw] of [
        ['.gap-related--8-12', '.gap-3'],
        ['.p-inset-surface', '.p-4'],
        ['.mt-section', '.mt-2'],
        ['.h-control-md', '.h-10'],
        [':where(.space-y-section', ':where(.space-y-4'],
    ]) {
        assert(at(role) < at(raw), `${role} before ${raw}`);
    }
    assert.match(
        css,
        /\.p-inset-surface \{\n\s+padding: var\(--guk-space-y-inset-surface\) var\(--guk-space-x-inset-surface\);\n\s+@media \(width >= 48rem\) \{\n\s+padding: var\(--guk-space-md-y-inset-surface\) var\(--guk-space-md-x-inset-surface\);/,
    );
    // A gap role reads the gaps from any padding or margin family.
    assert.match(css, /\.mt-section \{\n\s+margin-top: var\(--guk-space-gap-section\);/);
    assert.match(css, /\.gap-related\\! \{\n\s+gap: var\(--guk-space-gap-related\) !important;/);
    assert.match(css, /\.h-control-md \{\n\s+height: var\(--guk-space-height-control-md\);/);
});

// A lint rule's regexes, matched like Grit: against the whole node text.
const lintPatterns = (rule, language = 'js') =>
    readFileSync(resolve(kitRoot, `biome-plugins/${language}/${rule}.grit`), 'utf8').match(/r"[^"]*"/g);
const lintMatcher = (rule) => {
    const patterns = lintPatterns(rule).map(
        (pattern) => new RegExp(`^(?:${pattern.slice(2, -1).replace('(?s)', '')})$`, 's'),
    );
    return (text) => patterns.some((pattern) => pattern.test(text));
};

for (const rule of ['noPrimitiveColors', 'noPrimitiveTypography', 'noPrimitiveSpacing']) {
    test(`the js and css plugins of ${rule} match the same classes`, () => {
        assert(lintPatterns(rule).length > 0);
        assert.deepEqual(lintPatterns(rule, 'css'), lintPatterns(rule));
    });
}

test('the spacing lint flags raw spacing classes and nothing that merely starts like one', () => {
    const flagged = lintMatcher('noPrimitiveSpacing');
    for (const text of [
        'flex p-4',
        'md:gap-x-2.5',
        '-ml-1',
        'mt-px',
        'pt-[72px]',
        'mt-(--offset)',
        'py-2!',
        'gap-0.5',
    ]) {
        assert(flagged(text), text);
    }
    for (const text of [
        'p-0 gap-0',
        'mx-auto',
        'px-inset-item',
        'gap-related--8-12',
        'top-4',
        'h-10',
        'space-y-reverse',
    ]) {
        assert(!flagged(text), text);
    }
});

test('the typography lint flags primitive type classes and nothing that merely starts like one', () => {
    const flagged = lintMatcher('noPrimitiveTypography');
    for (const text of [
        'p-2 text-sm',
        'md:text-lg/6',
        'leading-6',
        'font-semibold!',
        '-tracking-wide',
        'text-[13px]',
    ]) {
        assert(flagged(text), text);
    }
    for (const text of ['text-(length:--x)', 'leading-(--x)', 'leading-[1.2]', 'font-[550]', '[font-size:12px]']) {
        assert(flagged(text), text);
    }
    for (const text of [
        'tracking-id',
        'leading-zero',
        'text-surface-primary',
        'font-mono',
        'type-supporting',
        'context-sm',
    ]) {
        assert(!flagged(text), text);
    }
});
