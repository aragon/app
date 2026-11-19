#!/usr/bin/env node
// Generates the semantic colour layer (`src/theme/tokens/semantic/colors.css`) from the checked-in Figma export and
// the two hand-kept maps next to it:
//
// - design-system/tokens/semantic-colors.tokens.json   Figma tokens (Light = $value, Dark = extension) + palette
// - design-system/tokens/semantic-colors.mapping.json  provisional renames / merges and code-only additions
// - design-system/tokens/semantic-colors.parity.json   default-theme ("parity") values: overrides + fallback rule
//
// Output: private palette properties (--guk-palette-*), three value sets under one set of names (`:root` = today's
// colours, `[data-theme="next"]` = Figma Light, `[data-theme="dark"]` = Figma Dark) and one Tailwind `@utility` per
// token. Usage: `node scripts/generate-semantic-tokens.mjs [--check | --report]`.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const kitRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = resolve(kitRoot, 'design-system/tokens');
const outputFile = resolve(kitRoot, 'src/theme/tokens/semantic/colors.css');
const primitivesFile = resolve(kitRoot, 'src/theme/tokens/primitives/colors.css');
const EXT = 'org.aragon.gov-ui-kit';

const readJson = (name) => JSON.parse(readFileSync(resolve(dataDir, name), 'utf8'));

const fail = (message) => {
    console.error(`generate-semantic-tokens: ${message}`);
    process.exit(1);
};

// Utility per property: how a token's variable is applied. Gradients stay variables only.
const shadowGeometry = {
    sm: ['0px 1px 2px 0px'],
    default: ['0px 1px 3px 0px', '0px 1px 2px -1px'],
    md: ['0px 4px 6px -1px', '0px 2px 4px -2px'],
    '2xl': ['0px 25px 50px -12px'],
};
const utilityBody = (property, name, variable) => {
    switch (property) {
        case 'bg':
            return `background-color: var(${variable});`;
        case 'text':
        case 'icon':
            return `color: var(${variable});`;
        case 'border':
            return `border-color: var(${variable});`;
        case 'ring':
            return `@apply ring-(color:${variable});`;
        case 'shadow': {
            const geometry = shadowGeometry[name.split('/')[2]];
            if (geometry == null) {
                fail(`no shadow geometry for ${name}`);
            }
            return `@apply shadow-[${geometry.map((g) => `${g} var(${variable})`.replaceAll(' ', '_')).join(',')}];`;
        }
        case 'gradient':
            return null;
        default:
            return fail(`unknown token property in ${name}`);
    }
};

const flatten = (group, prefix = []) =>
    Object.entries(group).flatMap(([key, child]) => {
        if (key.startsWith('$')) {
            return [];
        }
        return Object.hasOwn(child, '$value') ? [[[...prefix, key], child]] : flatten(child, [...prefix, key]);
    });

const { palette, color } = readJson('semantic-colors.tokens.json');
const { renames, additions } = readJson('semantic-colors.mapping.json');
const { fallbackRamps, rawFallback, overrides } = readJson('semantic-colors.parity.json');

// Palette: name -> hex.
const paletteHex = new Map(flatten(palette).map(([path, token]) => [path.join('/'), token.$value]));
const paletteVariable = (name) => `--guk-palette-${name.replace('/', '-')}`;

const parseRef = (value) => {
    if (value.startsWith('#')) {
        return { raw: value };
    }
    const match = value.match(/^\{palette\.([a-z]+)\.([0-9a]+)\}$/);
    if (match == null || !paletteHex.has(`${match[1]}/${match[2]}`)) {
        return fail(`unresolvable value ${value}`);
    }
    return { name: `${match[1]}/${match[2]}` };
};

// Tokens after renames and merges, in Figma order (code-only additions last).
const tokens = new Map();
for (const [path, token] of flatten(color)) {
    const figmaName = path.join('/');
    const name = renames[figmaName] ?? figmaName;
    const entry = { light: token.$value, dark: token.$extensions?.[EXT]?.dark, figma: [figmaName] };
    if (entry.dark == null) {
        fail(`${figmaName} has no dark value`);
    }
    const existing = tokens.get(name);
    if (existing != null) {
        if (existing.light !== entry.light || existing.dark !== entry.dark) {
            fail(`cannot merge ${figmaName} into ${name}: values differ from ${existing.figma.join(', ')}`);
        }
        existing.figma.push(figmaName);
        continue;
    }
    tokens.set(name, entry);
}
for (const [name, addition] of Object.entries(additions)) {
    if (tokens.has(name)) {
        fail(`addition ${name} already exists`);
    }
    tokens.set(name, { light: addition.light, dark: addition.dark, alias: addition.alias, figma: [] });
}
for (const [name, token] of tokens) {
    if (token.alias != null && (!tokens.has(token.alias) || tokens.get(token.alias).alias != null)) {
        fail(`${name} aliases ${token.alias}, which is not a token with values of its own`);
    }
}
const figmaNames = new Set(flatten(color).map(([path]) => path.join('/')));
for (const name of Object.keys(renames)) {
    if (!figmaNames.has(name)) {
        fail(`rename source ${name} is not a Figma token`);
    }
}
for (const name of Object.keys(overrides)) {
    if (!tokens.has(name)) {
        fail(`parity override for unknown token ${name}`);
    }
}

// Today's primitive steps per ramp, read from the primitive colour tokens.
const todaySteps = new Map();
for (const [, ramp, step] of readFileSync(primitivesFile, 'utf8').matchAll(/--color-([a-z]+)-(\d+):/g)) {
    todaySteps.set(ramp, [...(todaySteps.get(ramp) ?? []), Number(step)]);
}

const parityCss = (value) => (/^[a-z]+-\d+$/.test(value) ? `var(--color-${value})` : value);

const fallbacks = [];
const parityOf = (name, token) => {
    if (token.alias != null) {
        return { css: `var(${variableOf(token.alias)})`, comment: `alias of ${token.alias}` };
    }
    const override = overrides[name];
    if (override != null) {
        return { css: parityCss(override.value), comment: 'verified from code' };
    }
    const ref = parseRef(token.light);
    if (ref.raw != null) {
        const value = rawFallback[name];
        if (value == null) {
            fail(`no parity value for raw-valued token ${name}`);
        }
        fallbacks.push({ name, figma: ref.raw, parity: value, note: 'today’s shadow colour' });
        return { css: value, comment: 'fallback, unverified' };
    }
    const [ramp, stepName] = ref.name.split('/');
    const [, stepText, alphaText] = stepName.match(/^(\d+)(?:a(\d+))?$/);
    const step = Number(stepText);
    const targetRamp = fallbackRamps[ramp];
    const steps = todaySteps.get(targetRamp);
    if (steps == null) {
        fail(`no ramp ${targetRamp} today for ${name}`);
    }
    const nearest = steps.reduce((best, s) => (Math.abs(s - step) < Math.abs(best - step) ? s : best), steps[0]);
    const base = `${targetRamp}-${nearest}`;
    const notes = [];
    if (nearest !== step) {
        notes.push(`nearest step, ${ramp}/${step} has no ${targetRamp}-${step}`);
    }
    let css = parityCss(base);
    if (alphaText != null) {
        const alpha = Math.round((Number.parseInt(paletteHex.get(ref.name).slice(7, 9), 16) / 255) * 100);
        css = `color-mix(in srgb, ${css} ${alpha}%, transparent)`;
        notes.push(`alpha ${alpha}%`);
    }
    fallbacks.push({ name, figma: ref.name, parity: base, note: notes.join('; ') });
    return {
        css,
        comment: `fallback, unverified: ${ref.name} -> ${base}${notes.length ? ` (${notes.join('; ')})` : ''}`,
    };
};

const themeValue = (value) => {
    const ref = parseRef(value);
    return ref.raw ?? `var(${paletteVariable(ref.name)})`;
};

const variableOf = (name) => `--guk-${name.replaceAll('/', '-')}`;
const indent = '    ';
const block = (selector, lines) => [
    `${indent}${selector} {`,
    ...lines.map((l) => `${indent}${indent}${l}`),
    `${indent}}`,
];

const paletteLines = [...paletteHex].map(([name, hex]) => `${paletteVariable(name)}: ${hex};`);
const parityLines = [...tokens].flatMap(([name, token]) => {
    const { css, comment } = parityOf(name, token);
    return [`/* ${comment} */`, `${variableOf(name)}: ${css};`];
});
// Aliases are re-declared in every value set: a custom property resolves var() where it is declared, so an alias
// declared on :root only would keep the parity value inside a nested [data-theme] subtree.
const setValue = (token, value) => (token.alias != null ? `var(${variableOf(token.alias)})` : themeValue(value));
const lightLines = [...tokens].map(([name, token]) => `${variableOf(name)}: ${setValue(token, token.light)};`);
const darkLines = [...tokens].map(([name, token]) => `${variableOf(name)}: ${setValue(token, token.dark)};`);

const utilities = [...tokens]
    .map(([name]) => {
        const body = utilityBody(name.split('/')[0], name, variableOf(name));
        return body == null ? null : `@utility ${name.replaceAll('/', '-')} {\n${indent}${body}\n}`;
    })
    .filter((u) => u != null);

const sources = ['tokens', 'mapping', 'parity'].map((n) => `design-system/tokens/semantic-colors.${n}.json`);
const rawCss = `/*
 * GENERATED by scripts/generate-semantic-tokens.mjs from
 * ${sources.join(',\n * ')}.
 * Do not edit: change the data files and run \`pnpm tokens:semantic\`.
 *
 * Semantic colour tokens. Every token is a variable --guk-<property>-<group>-<role> with three value sets:
 * - :root                  today's colours ("parity"), so converted components keep their pixels;
 * - [data-theme="next"]    Figma Light values on the Figma palette;
 * - [data-theme="dark"]    Figma Dark values on the Figma palette.
 * Parity values marked "fallback, unverified" were derived by rule, not checked against a converted component.
 * The Figma palette is private (--guk-palette-*): it is not a Tailwind theme colour and has no utilities.
 */

@layer theme {
${block(':root', [...paletteLines, '', ...parityLines]).join('\n')}

${block('[data-theme="next"]', lightLines).join('\n')}

${block('[data-theme="dark"]', darkLines).join('\n')}
}

${utilities.join('\n\n')}
`;

// Formatted with the repo's Biome config, so the committed file passes `lint:check` and `--check` stays byte-exact.
const css = execFileSync(resolve(kitRoot, 'node_modules/.bin/biome'), ['format', `--stdin-file-path=${outputFile}`], {
    cwd: kitRoot,
    input: rawCss,
    encoding: 'utf8',
});

const mode = process.argv[2];
if (mode === '--check') {
    const current = readFileSync(outputFile, 'utf8');
    if (current !== css) {
        fail(`${relative(kitRoot, outputFile)} is stale: run \`pnpm tokens:semantic\` and commit the result.`);
    }
    console.log(`generate-semantic-tokens: ok (${tokens.size} tokens, ${utilities.length} utilities)`);
} else if (mode === '--report') {
    const overridden = [...tokens.keys()].filter((name) => overrides[name] != null);
    console.log(`${tokens.size} tokens, ${utilities.length} utilities, ${paletteHex.size} palette entries`);
    console.log(`parity: ${overridden.length} from code (verified), ${fallbacks.length} by fallback (unverified)`);
    console.log('\nFallback parity values (token | Figma light | parity | note):');
    for (const f of fallbacks) {
        console.log(`${f.name} | ${f.figma} | ${f.parity} | ${f.note}`);
    }
    console.log('\nOverrides that differ from the Figma light step (token | Figma light | parity | evidence):');
    for (const name of overridden) {
        const ref = parseRef(tokens.get(name).light);
        const { value, evidence, conflict } = overrides[name];
        const figmaStep = ref.raw ?? `${fallbackRamps[ref.name.split('/')[0]]}-${ref.name.split('/')[1]}`;
        if (figmaStep !== value || conflict != null) {
            console.log(
                `${name} | ${ref.raw ?? ref.name} | ${value} | ${evidence}${conflict ? ` | CONFLICT: ${conflict}` : ''}`,
            );
        }
    }
} else {
    writeFileSync(outputFile, css);
    console.log(`generate-semantic-tokens: wrote ${relative(kitRoot, outputFile)} (${tokens.size} tokens)`);
}
