// Semantic colour layer: renders `src/theme/tokens/semantic/colors.css` from the palette, the primitives, the three
// semantic mode files (today / next / dark) and semantic.config.json.
//
// Output: private palette properties (--guk-palette-*), three value sets under one set of names (`:root` = today's
// colours, `[data-theme="next"]` = the designer's Light plus the primitive colours remapped onto the palette
// (`config.primitiveRemap`), `[data-theme="dark"]` = the designer's Dark), one Tailwind `@utility` per token for its
// own property (bg, text, icon, border, shadow, ring) and the extra utilities declared in `config.utilities`:
// single-side borders, gradient stops and fades, fill / stroke / caret, and the few cross-family utilities that apply
// a token of one family to another property.

import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { aliasTarget, colorToCss, colorToHex, isAlias } from './dtcg.mjs';

const SEMANTIC_ROOT = 'semantic.';

// Utility per property: how a token's variable is applied. A gradient token is a colour stop, not a property of its
// own: it is applied through the stop and fade utilities of `config.utilities`.
const shadowGeometry = {
    sm: ['0px 1px 2px 0px'],
    default: ['0px 1px 3px 0px', '0px 1px 2px -1px'],
    md: ['0px 4px 6px -1px', '0px 2px 4px -2px'],
    '2xl': ['0px 25px 50px -12px'],
};

export const renderSemantic = ({ kitRoot, outputFile, palette, primitives, modes, config, varOf, fail }) => {
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

    const { renames, additions, utilities: extraUtilities, primitiveRemap, rampPairs } = config;

    // Palette: name ("gray/50") -> hex.
    const paletteHex = new Map(
        [...palette].map(([path, entry]) => [path.slice('palette.'.length).replace('.', '/'), colorToHex(entry.value)]),
    );
    const paletteVariable = (name) => `--guk-palette-${name.replace('/', '-')}`;
    const paletteNameOf = (path) => {
        const match = path.match(/^palette\.([a-z]+)\.([0-9a]+)$/);
        const name = match && `${match[1]}/${match[2]}`;
        if (name == null || !paletteHex.has(name)) {
            fail(`unresolvable palette alias {${path}}`);
        }
        return name;
    };

    const figmaNameOf = (path) => path.slice(SEMANTIC_ROOT.length).replaceAll('.', '/');
    const todayEntries = modes.today;
    const isAddition = (figmaName) => Object.hasOwn(additions, figmaName);

    for (const [mode, entries] of Object.entries(modes)) {
        if (mode !== 'today') {
            const missing = [...todayEntries.keys()].filter((path) => !entries.has(path));
            const extra = [...entries.keys()].filter((path) => !todayEntries.has(path));
            if (missing.length > 0 || extra.length > 0) {
                fail(`mode ${mode} differs from mode today: missing ${missing.join(', ')}; extra ${extra.join(', ')}`);
            }
        }
    }
    const semanticPaths = [...todayEntries.keys()];
    const figmaNames = semanticPaths.map(figmaNameOf);
    for (const name of Object.keys(additions)) {
        if (!figmaNames.includes(name)) {
            fail(`addition ${name} has no token in the mode files`);
        }
    }
    for (const name of Object.keys(renames)) {
        if (!figmaNames.includes(name) || isAddition(name)) {
            fail(`rename source ${name} is not a Figma token`);
        }
    }
    const codeNameOf = (figmaName) => renames[figmaName] ?? figmaName;
    const codeNameOfPath = (path) => {
        if (!todayEntries.has(path)) {
            fail(`alias target {${path}} is not a semantic token`);
        }
        return codeNameOf(figmaNameOf(path));
    };

    // Value of a token in a mode, as a comparable plain object.
    const modeValue = (mode, path) => {
        const entry = modes[mode].get(path);
        return { value: entry.value, extensions: entry.extensions };
    };

    // Tokens after renames and merges, in the designer's order (code-only additions last, in `additions` order).
    const tokens = new Map();
    for (const path of semanticPaths) {
        const figmaName = figmaNameOf(path);
        if (isAddition(figmaName)) {
            continue;
        }
        const name = codeNameOf(figmaName);
        const entry = { path, figma: [figmaName] };
        const existing = tokens.get(name);
        if (existing != null) {
            for (const mode of Object.keys(modes)) {
                if (JSON.stringify(modeValue(mode, existing.path)) !== JSON.stringify(modeValue(mode, path))) {
                    fail(
                        `cannot merge ${figmaName} into ${name}: ${mode} values differ from ${existing.figma.join(', ')}`,
                    );
                }
            }
            existing.figma.push(figmaName);
            continue;
        }
        tokens.set(name, entry);
    }
    for (const name of Object.keys(additions)) {
        if (tokens.has(name)) {
            fail(`addition ${name} already exists`);
        }
        tokens.set(name, { path: `${SEMANTIC_ROOT}${name.replaceAll('/', '.')}`, figma: [] });
    }
    for (const entry of tokens.values()) {
        entry.today = modes.today.get(entry.path);
        entry.next = modes.next.get(entry.path);
        entry.dark = modes.dark.get(entry.path);
        const follows = [entry.next, entry.dark].map(
            ({ value }) => isAlias(value) && aliasTarget(value).startsWith(SEMANTIC_ROOT),
        );
        if (follows[0] !== follows[1]) {
            fail(`${entry.path}: next and dark must both follow another token, or neither`);
        }
        if (follows[0]) {
            const [next, dark] = [entry.next, entry.dark].map(({ value }) => codeNameOfPath(aliasTarget(value)));
            if (next !== dark) {
                fail(`${entry.path}: next follows ${next} but dark follows ${dark}`);
            }
            entry.alias = next;
        }
    }
    for (const [name, token] of tokens) {
        if (token.alias != null && (!tokens.has(token.alias) || tokens.get(token.alias).alias != null)) {
            fail(`${name} aliases ${token.alias}, which is not a token with values of its own`);
        }
    }

    // Today's primitive steps per ramp, read from the primitive colour tokens.
    const todaySteps = new Map();
    for (const path of primitives.keys()) {
        const match = path.match(/^color\.([a-z]+)\.(\d+)$/);
        if (match != null) {
            todaySteps.set(match[1], [...(todaySteps.get(match[1]) ?? []), Number(match[2])]);
        }
    }

    const variableOf = (name) => `--guk-${name.replaceAll('/', '-')}`;

    // A Today value as CSS: an alias of a primitive is its variable, a colour with a `mix` extension is that primitive
    // mixed with transparent (DTCG has no colour modifier), any other colour is a literal.
    const primitiveVar = (reference) => {
        const path = aliasTarget(reference);
        if (!primitives.has(path) || primitives.get(path).type !== 'color') {
            fail(`today value ${reference} is not a primitive colour`);
        }
        return `var(${varOf(path)})`;
    };
    const todayCss = (name, { value, extensions }) => {
        if (isAlias(value)) {
            return primitiveVar(value);
        }
        if (extensions?.mix != null) {
            const { of, percent } = extensions.mix;
            const base = primitives.get(aliasTarget(of));
            const sameColour =
                base != null && JSON.stringify(base.value.components) === JSON.stringify(value.components);
            if (!sameColour || Math.abs((value.alpha ?? 1) * 100 - percent) > 1e-9) {
                fail(`${name}: the colour does not equal ${of} at ${percent}% (mix extension)`);
            }
            return `color-mix(in srgb, ${primitiveVar(of)} ${percent}%, transparent)`;
        }
        return colorToCss(value);
    };

    // Today ("parity") value and its provenance comment.
    const fallbacks = [];
    const parityOf = (name, token) => {
        const today = token.today;
        const evidence = today.extensions?.evidence;
        if (evidence != null) {
            return { css: todayCss(name, today), comment: 'verified from code' };
        }
        if (isAlias(today.value) && todayEntries.has(aliasTarget(today.value))) {
            if (token.alias == null || codeNameOfPath(aliasTarget(today.value)) !== token.alias) {
                fail(`${name}: today follows another token without being its alias`);
            }
            return { css: `var(${variableOf(token.alias)})`, comment: `alias of ${token.alias}` };
        }
        if (!isAlias(token.next.value)) {
            // The designer's value is a raw colour (the shadows): today keeps the colour of today's shadow.
            fallbacks.push({
                name,
                figma: colorToHex(token.next.value),
                parity: todayCss(name, today),
                note: 'today’s shadow colour',
            });
            return { css: todayCss(name, today), comment: 'fallback, unverified' };
        }
        // Rule: the same step of today's corresponding ramp (nearest existing step; same alpha for alpha steps).
        if (token.alias != null) {
            fail(`${name}: a today value that is neither an alias of its token nor verified needs evidence`);
        }
        const figmaRef = paletteNameOf(aliasTarget(token.next.value));
        const [ramp, stepName] = figmaRef.split('/');
        const [, stepText, alphaText] = stepName.match(/^(\d+)(?:a(\d+))?$/);
        const step = Number(stepText);
        const targetRamp = rampPairs[ramp];
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
        let alpha = null;
        if (alphaText != null) {
            alpha = Math.round((Number.parseInt(paletteHex.get(figmaRef).slice(7, 9), 16) / 255) * 100);
            notes.push(`alpha ${alpha}%`);
        }
        const expected =
            alpha == null ? `{color.${targetRamp}.${nearest}}` : `{color.${targetRamp}.${nearest}}@${alpha}`;
        const stored =
            today.extensions?.mix != null ? `${today.extensions.mix.of}@${today.extensions.mix.percent}` : today.value;
        if (stored !== expected) {
            fail(`${name}: today is ${stored}, the fallback rule gives ${expected}; a different value needs evidence`);
        }
        const css = todayCss(name, today);
        fallbacks.push({ name, figma: figmaRef, parity: base, note: notes.join('; ') });
        return {
            css,
            comment: `fallback, unverified: ${figmaRef} -> ${base}${notes.length ? ` (${notes.join('; ')})` : ''}`,
        };
    };

    const themeValue = (value) =>
        isAlias(value) ? `var(${paletteVariable(paletteNameOf(aliasTarget(value)))})` : colorToHex(value);

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
    const setValue = (token, mode) =>
        token.alias != null ? `var(${variableOf(token.alias)})` : themeValue(token[mode].value);
    const lightLines = [...tokens].map(([name, token]) => `${variableOf(name)}: ${setValue(token, 'next')};`);
    const darkLines = [...tokens].map(([name, token]) => `${variableOf(name)}: ${setValue(token, 'dark')};`);

    // Palette-change preview (`config.primitiveRemap`, L-01): in "next" only, every primitive colour variable is
    // redeclared as the same step of its Figma ramp, so primitive classes follow the new palette there. The semantic
    // tokens above never read a primitive variable in "next" (every value set declares every token from the palette),
    // so the remap cannot feed back into them; the palette properties are literal colours, so it cannot form a cycle.
    const remapLines = [];
    if (primitiveRemap != null) {
        const figmaRampOf = new Map(Object.entries(rampPairs).map(([figma, today]) => [today, figma]));
        const rampSteps = (figmaRamp) =>
            [...paletteHex.keys()]
                .map((name) => name.split('/'))
                .filter(([ramp, step]) => ramp === figmaRamp && /^\d+$/.test(step))
                .map(([, step]) => Number(step));
        const stepOverrides = primitiveRemap.steps ?? {};
        const used = new Set();
        for (const [ramp, steps] of todaySteps) {
            const figmaRamp = figmaRampOf.get(ramp);
            if (figmaRamp == null) {
                fail(`primitiveRemap: no Figma ramp for --color-${ramp}-* (add it to rampPairs)`);
            }
            const available = rampSteps(figmaRamp);
            for (const step of steps) {
                const key = `${ramp}-${step}`;
                let target = stepOverrides[key];
                if (target != null) {
                    used.add(key);
                    if (!paletteHex.has(target)) {
                        fail(`primitiveRemap.steps: ${key} -> ${target} is not a palette entry`);
                    }
                } else if (available.includes(step)) {
                    target = `${figmaRamp}/${step}`;
                } else {
                    const distance = (s) => Math.abs(s - step);
                    const best = Math.min(...available.map(distance));
                    const nearest = available.filter((s) => distance(s) === best);
                    if (nearest.length !== 1) {
                        fail(
                            `primitiveRemap: ${key} is equally near ${nearest.map((s) => `${figmaRamp}/${s}`).join(' and ')}; decide it in steps`,
                        );
                    }
                    target = `${figmaRamp}/${nearest[0]}`;
                }
                remapLines.push(`--color-${key}: var(${paletteVariable(target)});`);
            }
        }
        for (const key of Object.keys(stepOverrides)) {
            if (!used.has(key)) {
                fail(`primitiveRemap.steps: --color-${key} is not a primitive colour`);
            }
        }
    }
    // The remap is a rule of its own, outside the theme layer and on `:root[data-theme]`: Tailwind emits the primitive
    // theme variables unlayered in some pipelines (the kit's own PostCSS, Rollup and Storybook builds) and layered in
    // others (the app), and an unlayered declaration beats any layered one. Unlayered, with one class more specificity
    // than Tailwind's `:root, :host`, it wins in either order; on a nested [data-theme] it is the element's own
    // declaration.
    const remapCss =
        remapLines.length > 0
            ? [
                  '/* Palette-change preview in "next": primitive colours on the Figma palette (mapping.primitiveRemap) */',
                  ':root[data-theme="next"],',
                  '[data-theme="next"] {',
                  ...remapLines.map((l) => `${indent}${l}`),
                  '}',
                  '',
              ].join('\n')
            : '';

    const classOf = (name) => name.replaceAll('/', '-');
    const familyOf = (name) => name.split('/')[0];
    const familyTokens = (family) => [...tokens.keys()].filter((name) => familyOf(name) === family);
    // A colour applied through Tailwind's documented arbitrary-value form, so Tailwind writes the property (and, for
    // gradient stops and shadow colours, its own stop / colour wiring) exactly as for its palette classes.
    const applyColour = (applier, name, alpha) =>
        `@apply ${applier}-(color:${variableOf(name)})${alpha == null ? '' : `/${alpha}`};`;

    // [class, body] per utility: first one per token for its own property, then the declared extra families.
    const utilityEntries = [...tokens]
        .map(([name]) => [classOf(name), utilityBody(familyOf(name), name, variableOf(name))])
        .filter(([, body]) => body != null);
    if (extraUtilities != null) {
        const { borderSides, appliers, fadeDirections, alphaStops, crossFamily } = extraUtilities;
        const requireToken = (name, where) => {
            if (!tokens.has(name)) {
                fail(`utilities.${where}: unknown token ${name}`);
            }
        };
        // Single-side borders keep Tailwind's grammar: the side replaces the family (`border-t-accent-secondary`).
        for (const side of borderSides) {
            for (const name of familyTokens('border')) {
                const applier = `border-${side}`;
                utilityEntries.push([
                    `${applier}-${classOf(name).slice('border-'.length)}`,
                    applyColour(applier, name),
                ]);
            }
        }
        // Other properties: the applier is followed by the full token class (`fill-bg-surface-primary`).
        for (const { applier, families } of appliers) {
            for (const name of families.flatMap(familyTokens)) {
                utilityEntries.push([`${applier}-${classOf(name)}`, applyColour(applier, name)]);
            }
        }
        // Fades: a gradient token to its `-transparent` twin, one utility per direction.
        for (const name of familyTokens('gradient').filter((n) => tokens.has(`${n}-transparent`))) {
            for (const direction of fadeDirections) {
                const body = `@apply bg-linear-to-${direction} from-(color:${variableOf(name)}) to-(color:${variableOf(`${name}-transparent`)});`;
                utilityEntries.push([`${classOf(name)}-to-${direction}`, body]);
            }
        }
        for (const { applier, token, alpha } of alphaStops) {
            requireToken(token, 'alphaStops');
            utilityEntries.push([`${applier}-${classOf(token)}/${alpha}`, applyColour(applier, token, alpha)]);
        }
        for (const { applier, token } of crossFamily) {
            requireToken(token, 'crossFamily');
            if (applier === familyOf(token)) {
                fail(`utilities.crossFamily: ${token} already has its own ${applier} utility`);
            }
            utilityEntries.push([`${applier}-${classOf(token)}`, applyColour(applier, token)]);
        }
    }
    const seen = new Set();
    for (const [name] of utilityEntries) {
        if (seen.has(name)) {
            fail(`two utilities named ${name}`);
        }
        seen.add(name);
    }
    // `/` is legal in a utility name (as in Tailwind's own `w-1/2`) but must be escaped in the CSS identifier.
    const utilities = utilityEntries.map(
        ([name, body]) => `@utility ${name.replaceAll('/', String.raw`\/`)} {\n${indent}${body}\n}`,
    );

    const rawCss = `/*
 * GENERATED by scripts/tokens/generate.mjs from design-system/tokens/source/ (palette.tokens.json,
 * primitives.tokens.json, semantic.{today,next,dark}.tokens.json and semantic.config.json).
 * Do not edit: change those files and run \`pnpm tokens:generate\`.
 *
 * Semantic colour tokens. Every token is a variable --guk-<property>-<group>-<role>. This file holds the value set of
 * ${config.modes.today.selector}: today's colours ("parity"), so converted components keep their pixels. The Figma palette
 * (--guk-palette-*) and the other value sets are in the preview stylesheets:
 * - [data-theme="next"]    Figma Light values on the Figma palette, plus the primitive colours (--color-*) on the
 *                          same step of the Figma palette (palette-change preview, so primitive classes follow);
 * - [data-theme="dark"]    Figma Dark values on the Figma palette (primitive colours unchanged).
 * Parity values marked "fallback, unverified" were derived by rule, not checked against a converted component.
 * Utilities: <family>-<group>-<role> per token for its own property; border-<side>-<group>-<role> per border token;
 * <applier>-<family>-<group>-<role> for another property (from/via/to, fill, stroke, caret and the declared
 * cross-family ones); <gradient token>-to-<direction> fades a gradient token to its -transparent twin.
 * The Figma palette is private (--guk-palette-*): it is not a Tailwind theme colour and has no utilities.
 */

@layer theme {
${block(config.modes.today.selector, parityLines).join('\n')}
}

${utilities.join('\n\n')}
`;
    const previewSelectors = (mode) => {
        const selector = config.modes[mode].selector;
        return `:root${selector},\n${indent}${selector}`;
    };
    const preview = {
        comments: [
            `${config.modes.next.selector}: ${'Figma Light values on the Figma palette, plus the primitive colours remapped onto it.'}`,
            `${config.modes.dark.selector}: Figma Dark values on the Figma palette.`,
        ],
        root: [
            ...block(':root', ['/* Figma palette (private) */', ...paletteLines]),
            '',
            ...block(previewSelectors('next'), lightLines),
            '',
            ...block(previewSelectors('dark'), darkLines),
        ],
        // Outside the theme layer, see the remap rule above.
        unlayered: remapCss === '' ? [] : remapCss.trimEnd().split('\n'),
        column: [],
    };

    // Formatted with the repo's Biome config, so the committed file passes `lint:check` and `--check` stays byte-exact.
    const css = execFileSync(
        resolve(kitRoot, 'node_modules/.bin/biome'),
        ['format', `--stdin-file-path=${outputFile}`],
        {
            cwd: kitRoot,
            input: rawCss,
            encoding: 'utf8',
        },
    );

    return { css, preview, tokens, utilities, paletteHex, fallbacks };
};
