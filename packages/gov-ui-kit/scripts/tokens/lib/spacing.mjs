// Semantic spacing layer: renders `src/theme/tokens/spacing.css` (and the TypeScript name lists) from
// spacing.roles.tokens.json, spacing.sizes.tokens.json, spacing.exceptions.tokens.json and spacing.config.json.
//
// Tokens (DTCG dimensions; every token has a phone value `base` and a desktop value `md`; `$value` is Today, the preview
// modes are in the `modes` extension):
// - space.role.<role>[.x|.y]       the spacing roles: insets (both axes) and gaps (one value);
// - size.<size>.<dimension>        component sizes: control heights, their inner padding and gap, the tag, the row;
// - space.exception.<role>--<pattern>   a place whose Today value differs from its role (role may also be a size): Today
//                                  renders the exception's value, every preview mode renders the role (per axis or
//                                  dimension of the family). Exceptions of a navigation chrome role carry their own mode
//                                  values under the chrome rule instead.
// Output: one value set per mode (`--<prefix>-<name>[-<axis|dimension>][-md]`) on the mode's selector, the coarse-pointer
// fallback, and one Tailwind `@utility` per role or size × family and per exception × the families it lists. Every
// utility has the same shape: the base value, then the md value through Tailwind's own `md` variant (so it steps on the
// app column in the app), even when both are equal. Themes swap variables, never utilities. Nothing is written into
// Tailwind's `--spacing-*` namespace, so widths, sizes and offsets never read a role.

import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { EXT } from './dtcg.mjs';

const MODES = ['today', 'new', 'looser', 'compact'];
const SIDES = ['base', 'md'];
const INDENT = '    ';

const formatWithBiome = (kitRoot, file, text) =>
    execFileSync(resolve(kitRoot, 'node_modules/.bin/biome'), ['format', `--stdin-file-path=${file}`], {
        cwd: kitRoot,
        input: text,
        encoding: 'utf8',
    });

const pxOf = (dimension, label, fail) => {
    if (dimension == null || typeof dimension.value !== 'number' || dimension.unit !== 'px') {
        fail(`spacing: ${label} must be a px dimension`);
    }
    return dimension.value;
};

// One side of a token: its Today value and the three preview modes, in px.
const readSide = (token, label, fail, { modesRequired = true } = {}) => {
    if (token == null || !Object.hasOwn(token, '$value')) {
        fail(`spacing: ${label} is missing`);
    }
    const values = { today: pxOf(token.$value, label, fail) };
    const modes = token.$extensions?.[EXT]?.modes;
    if (modes == null) {
        if (modesRequired) {
            fail(`spacing: ${label} has no modes extension (new, looser, compact)`);
        }
        return values;
    }
    for (const mode of MODES.slice(1)) {
        values[mode] = pxOf(modes[mode], `${label} (${mode})`, fail);
    }
    const extra = Object.keys(modes).filter((mode) => !MODES.includes(mode));
    if (extra.length > 0) {
        fail(`spacing: ${label} has unknown modes ${extra.join(', ')}`);
    }
    return values;
};

const readStepped = (group, label, fail, options) =>
    Object.fromEntries(SIDES.map((side) => [side, readSide(group?.[side], `${label}.${side}`, fail, options)]));

// Family specs: the CSS properties of one family and, per property, the token dimension it reads ('' = a gap's value).
const familySpec = (kind, family, spec) => {
    const properties = [spec.property ?? []].flat();
    const dims = kind === 'inset' ? [spec.axis].flat() : kind === 'size' ? [spec.dimension].flat() : [''];
    return { family, properties, dims, negate: spec.negate === true, space: spec.space ?? null };
};

export const renderSpacing = ({ kitRoot, config, documents, validateDimension, fail }) => {
    const { prefix, scale, desktopVariant } = config;
    const modeNames = Object.keys(config.modes);
    if (modeNames.join() !== MODES.join()) {
        fail(`spacing.config.json: the modes must be ${MODES.join(', ')} (Today first)`);
    }
    const onScale = (value) => scale.includes(value);
    const up = (value) => scale.find((step) => step > value);
    const down = (value) => [...scale].reverse().find((step) => step < value);
    const snap = (value) =>
        scale.reduce((best, step) => (Math.abs(step - value) <= Math.abs(best - value) ? step : best), scale[0]);
    // Navigation chrome (owner decision 6): Today snapped in New, at most one scale step in looser and compact.
    const chromeOk = (v) =>
        v.new === snap(v.today) && [v.new, up(v.new)].includes(v.looser) && [v.new, down(v.new)].includes(v.compact);

    // ------------------------------------------------------------------------------------------------------------
    // Roles and sizes
    // ------------------------------------------------------------------------------------------------------------
    const tokens = new Map();
    for (const [name, group] of Object.entries(documents.roles.space?.role ?? {})) {
        const meta = group.$extensions?.[EXT] ?? {};
        if (meta.kind !== 'inset' && meta.kind !== 'gap') {
            fail(`spacing: role ${name} needs kind "inset" or "gap"`);
        }
        if (meta.kind === 'gap' && !name.startsWith('gap-')) {
            fail(`spacing: gap role ${name} must be named gap-<level>`);
        }
        if (meta.kind === 'inset' && !name.startsWith('inset-')) {
            fail(`spacing: inset role ${name} must be named inset-<scope>`);
        }
        const dims =
            meta.kind === 'inset'
                ? { x: readStepped(group.x, `role ${name}.x`, fail), y: readStepped(group.y, `role ${name}.y`, fail) }
                : { '': readStepped(group, `role ${name}`, fail) };
        tokens.set(name, {
            name,
            kind: meta.kind,
            chrome: meta.chrome === true,
            invariant: meta.invariant === true,
            dims,
            description: group.$description,
        });
    }
    for (const [name, group] of Object.entries(documents.sizes.size ?? {})) {
        if (name.startsWith('$')) {
            continue;
        }
        if (tokens.has(name)) {
            fail(`spacing: ${name} is both a role and a size`);
        }
        const dims = {};
        for (const [dim, token] of Object.entries(group)) {
            if (!dim.startsWith('$')) {
                dims[dim] = readStepped(token, `size ${name}.${dim}`, fail);
            }
        }
        tokens.set(name, { name, kind: 'size', chrome: false, dims, description: group.$description });
    }

    const families = {
        inset: Object.entries(config.families.inset).map(([f, s]) => familySpec('inset', f, s)),
        gap: Object.entries(config.families.gap).map(([f, s]) => familySpec('gap', f, s)),
        size: Object.entries(config.families.size).map(([f, s]) => familySpec('size', f, s)),
    };
    const familyOf = (kind, family) => families[kind].find((spec) => spec.family === family);
    const roleFamilies = (token) =>
        token.kind === 'size'
            ? config.roleFamilies.size
                  .map((family) => familyOf('size', family))
                  .filter((spec) => spec.dims.every((dim) => Object.hasOwn(token.dims, dim)))
            : families[token.kind];

    // ------------------------------------------------------------------------------------------------------------
    // Validation of the value tables
    // ------------------------------------------------------------------------------------------------------------
    const sideValues = (token, dim, side) => token.dims[dim][side];
    const label = (token, dim, side) => `${token.name}${dim ? `.${dim}` : ''}.${side}`;
    for (const token of tokens.values()) {
        for (const [dim, sides] of Object.entries(token.dims)) {
            for (const side of SIDES) {
                const v = sides[side];
                for (const mode of MODES) {
                    validateDimension({ value: v[mode], unit: 'px' }, `${label(token, dim, side)} (${mode})`);
                    if (!onScale(v[mode]) && token.kind !== 'size') {
                        fail(`spacing: ${label(token, dim, side)} ${mode} ${v[mode]}px is not on the scale`);
                    }
                }
                if (!(v.compact <= v.new && v.new <= v.looser)) {
                    fail(`spacing: ${label(token, dim, side)} must hold compact <= new <= looser`);
                }
                if (token.invariant && !(v.looser === v.new && v.compact === v.new && v.new === snap(v.today))) {
                    fail(
                        `spacing: density-invariant role ${label(token, dim, side)} must be new = looser = compact = Today snapped (${snap(v.today)})`,
                    );
                }
                if (token.chrome && !chromeOk(v)) {
                    fail(
                        `spacing: chrome role ${label(token, dim, side)} must be new = Today snapped (${snap(v.today)}), looser ${snap(v.today)} or one step up (${up(snap(v.today))}), compact ${snap(v.today)} or one step down (${down(snap(v.today))})`,
                    );
                }
            }
            for (const mode of MODES) {
                if (sides.md[mode] < sides.base[mode]) {
                    fail(`spacing: ${token.name}${dim ? `.${dim}` : ''} ${mode} steps down at md`);
                }
            }
        }
    }
    for (const levels of [config.gapLevels, config.chromeGapLevels]) {
        for (const name of levels) {
            if (tokens.get(name)?.kind !== 'gap') {
                fail(`spacing.config.json: gap level ${name} is not a gap role`);
            }
        }
        for (const mode of MODES) {
            for (const side of SIDES) {
                const values = levels.map((name) => sideValues(tokens.get(name), '', side)[mode]);
                if (values.some((value, index) => index > 0 && value < values[index - 1])) {
                    fail(`spacing: gap levels ${levels.join(' < ')} out of order in ${mode} (${side}): ${values}`);
                }
            }
        }
    }
    const tokenGlob = (pattern) => new RegExp(`^${pattern.replace(/\./g, '\\.').replace(/\*/g, '[a-z0-9-]+')}$`);
    for (const floor of config.floors) {
        const matcher = tokenGlob(floor.token);
        let matched = 0;
        for (const token of tokens.values()) {
            for (const dim of Object.keys(token.dims)) {
                const path = `${token.kind === 'size' ? 'size' : 'role'}.${token.name}${dim ? `.${dim}` : ''}`;
                if (!matcher.test(path)) {
                    continue;
                }
                matched++;
                for (const side of floor.side === 'both' ? SIDES : [floor.side]) {
                    for (const mode of floor.modes) {
                        const value = token.dims[dim][side][mode];
                        if (value < floor.min) {
                            fail(`spacing: ${path}.${side} ${mode} ${value}px is below the floor ${floor.min}px`);
                        }
                    }
                }
            }
        }
        if (matched === 0) {
            fail(`spacing.config.json: floor ${floor.token} matches no token`);
        }
    }
    // Coarse pointers (touch screens): the listed tokens of one mode fall back to another mode. `tokens` are paths with
    // `*` globs (`size.control-*.height`, `role.<name>.<axis>`); every block dimension (`blockDimensions`: what sets a
    // target's height) of every size that is a target (all sizes but `exempt`) must be listed, so no control's height
    // can escape the fallback.
    const coarse = config.coarsePointer;
    const pathOf = (token, dim) => `${token.kind === 'size' ? 'size' : 'role'}.${token.name}${dim ? `.${dim}` : ''}`;
    const coarseTokens = [];
    for (const pattern of coarse.tokens) {
        const matcher = tokenGlob(pattern);
        const before = coarseTokens.length;
        for (const token of tokens.values()) {
            for (const dim of Object.keys(token.dims)) {
                if (matcher.test(pathOf(token, dim)) && !coarseTokens.some((c) => c.token === token && c.dim === dim)) {
                    coarseTokens.push({ token, dim });
                }
            }
        }
        if (coarseTokens.length === before) {
            fail(`spacing.config.json: coarse-pointer token ${pattern} matches no token`);
        }
    }
    for (const name of coarse.exempt ?? []) {
        if (tokens.get(name)?.kind !== 'size') {
            fail(`spacing.config.json: coarse-pointer exemption ${name} is not a size`);
        }
    }
    for (const token of tokens.values()) {
        if (token.kind !== 'size' || (coarse.exempt ?? []).includes(token.name)) {
            continue;
        }
        for (const dim of coarse.blockDimensions ?? []) {
            if (Object.hasOwn(token.dims, dim) && !coarseTokens.some((c) => c.token === token && c.dim === dim)) {
                fail(
                    `spacing.config.json: ${pathOf(token, dim)} sets a target's height but has no coarse-pointer fallback (list it in coarsePointer.tokens, or exempt the size)`,
                );
            }
        }
    }

    // ------------------------------------------------------------------------------------------------------------
    // Exceptions
    // ------------------------------------------------------------------------------------------------------------
    const exceptions = new Map();
    for (const [name, group] of Object.entries(documents.exceptions.space?.exception ?? {})) {
        const match = name.match(/^([a-z0-9-]+?)--([a-z0-9-]+)$/);
        const role = match == null ? null : tokens.get(match[1]);
        if (role == null) {
            fail(`spacing: exception ${name} must be named <role>--<pattern> after an existing role or size`);
        }
        const meta = group.$extensions?.[EXT] ?? {};
        const familyNames = meta.families ?? [];
        if (familyNames.length === 0 || new Set(familyNames).size !== familyNames.length) {
            fail(`spacing: exception ${name} must list its utility families once each`);
        }
        const specs = familyNames.map((family) => {
            const spec = familyOf(role.kind, family);
            if (spec == null || !roleFamilies(role).includes(spec)) {
                fail(`spacing: exception ${name}: family ${family} is not a ${role.name} family`);
            }
            return spec;
        });
        const dims = [...new Set(specs.flatMap((spec) => spec.dims))];
        const values = readStepped(group, `exception ${name}`, fail, { modesRequired: role.chrome });
        for (const side of SIDES) {
            validateDimension({ value: values[side].today, unit: 'px' }, `exception ${name}.${side}`);
            if (role.chrome) {
                const v = values[side];
                if (!chromeOk(v)) {
                    fail(
                        `spacing: chrome exception ${name}.${side} must be new = Today snapped (${snap(v.today)}), looser ${snap(v.today)} or ${up(snap(v.today))}, compact ${snap(v.today)} or ${down(snap(v.today))}`,
                    );
                }
            } else if (group[side].$extensions?.[EXT]?.modes != null) {
                fail(`spacing: exception ${name}.${side} must not carry modes: every preview mode renders its role`);
            }
        }
        const redundant = dims.every(
            (dim) => values.base.today === role.dims[dim].base.today && values.md.today === role.dims[dim].md.today,
        );
        if (redundant) {
            fail(
                `spacing: exception ${name} renders its role's Today value (${dims.join(', ') || 'gap'}): use the role`,
            );
        }
        exceptions.set(name, {
            name,
            role,
            pattern: match[2],
            specs,
            dims,
            values,
            description: group.$description,
            places: meta.places ?? null,
            resolution: meta.resolution ?? '',
        });
    }

    // ------------------------------------------------------------------------------------------------------------
    // Change budget of New (owner decision 0): every role's own places and every exception move by at most the budget.
    // ------------------------------------------------------------------------------------------------------------
    const allowed = (today) => (today <= config.newBudget.upTo ? config.newBudget.small : config.newBudget.large);
    const changes = [];
    for (const name of Object.keys(config.budgetExemptRoles ?? {})) {
        if (!tokens.has(name)) {
            fail(`spacing.config.json: budget-exempt role ${name} does not exist`);
        }
    }
    for (const token of tokens.values()) {
        for (const [dim, sides] of Object.entries(token.dims)) {
            for (const side of SIDES) {
                const { today, new: next } = sides[side];
                changes.push({
                    name: label(token, dim, side),
                    change: Math.abs(next - today),
                    allowed: allowed(today),
                });
            }
        }
    }
    for (const exception of exceptions.values()) {
        for (const dim of exception.dims) {
            for (const side of SIDES) {
                const today = exception.values[side].today;
                const next = exception.role.chrome ? exception.values[side].new : exception.role.dims[dim][side].new;
                changes.push({
                    name: `${exception.name}${dim ? `.${dim}` : ''}.${side}`,
                    change: Math.abs(next - today),
                    allowed: allowed(today),
                    weight: exception.places ?? 1,
                    exempt: Object.hasOwn(config.budgetExemptRoles ?? {}, exception.role.name),
                });
            }
        }
    }
    const overBudget = changes.filter((c) => c.change > c.allowed && !c.exempt);
    if (overBudget.length > 0) {
        fail(
            `spacing: over the New change budget (decision 0: reclassify the place or split the role): ${overBudget
                .map((c) => `${c.name} moves ${c.change}px (max ${c.allowed})`)
                .join('; ')}`,
        );
    }

    // ------------------------------------------------------------------------------------------------------------
    // CSS
    // ------------------------------------------------------------------------------------------------------------
    const variable = (name, dim, side) => `--${prefix}-${name}${dim ? `-${dim}` : ''}${side === 'md' ? '-md' : ''}`;
    const px = (value) => (value === 0 ? '0px' : `${value}px`);

    const setLines = (mode) => {
        const lines = [];
        for (const token of tokens.values()) {
            lines.push(`/* ${token.kind === 'size' ? 'size' : 'role'} ${token.name} */`);
            for (const [dim, sides] of Object.entries(token.dims)) {
                for (const side of SIDES) {
                    lines.push(`${variable(token.name, dim, side)}: ${px(sides[side][mode])};`);
                }
            }
        }
        for (const exception of exceptions.values()) {
            lines.push(
                `/* exception ${exception.name} (${mode === 'today' ? 'its own Today value' : exception.role.chrome ? 'chrome: its own snapped value' : `follows ${exception.role.name}`}) */`,
            );
            for (const dim of exception.dims) {
                for (const side of SIDES) {
                    const value =
                        mode === 'today' || exception.role.chrome
                            ? px(exception.values[side][mode])
                            : `var(${variable(exception.role.name, dim, side)})`;
                    lines.push(`${variable(exception.name, dim, side)}: ${value};`);
                }
            }
        }
        return lines;
    };
    const block = (selector, lines, depth = 1) => {
        const pad = INDENT.repeat(depth);
        return [`${pad}${selector} {`, ...lines.map((line) => `${pad}${INDENT}${line}`), `${pad}}`];
    };
    const coarseLines = coarseTokens.flatMap(({ token, dim }) =>
        SIDES.map((side) => `${variable(token.name, dim, side)}: ${px(token.dims[dim][side][coarse.fallback])};`),
    );

    const stem = (token) => (token.kind === 'gap' ? token.name.replace(/^gap-/, '') : token.name);
    const utilityName = (family, name) => `${family}-${name}`;
    const declarations = (spec, name, side) => {
        const value = (dim) =>
            spec.negate ? `calc(var(${variable(name, dim, side)}) * -1)` : `var(${variable(name, dim, side)})`;
        if (spec.space != null) {
            const axis = spec.space;
            const [start, end] =
                axis === 'x'
                    ? ['margin-inline-start', 'margin-inline-end']
                    : ['margin-block-start', 'margin-block-end'];
            return [
                `--tw-space-${axis}-reverse: 0;`,
                `${start}: calc(${value('')} * var(--tw-space-${axis}-reverse));`,
                `${end}: calc(${value('')} * calc(1 - var(--tw-space-${axis}-reverse)));`,
            ];
        }
        // One shorthand property over several axes (`padding: <y> <x>`, Tailwind's own `p-*` shorthand) or one value
        // per property (`size`: width and height).
        if (spec.properties.length === 1) {
            return [`${spec.properties[0]}: ${spec.dims.map((dim) => value(dim)).join(' ')};`];
        }
        return spec.properties.map((property, index) => `${property}: ${value(spec.dims[index] ?? spec.dims[0])};`);
    };
    const utilityCss = (className, spec, name) => {
        const body = [
            ...declarations(spec, name, 'base'),
            '',
            `@variant ${desktopVariant} {`,
            ...declarations(spec, name, 'md').map((line) => `${INDENT}${line}`),
            '}',
        ];
        const wrapped =
            spec.space != null ? [':where(& > :not(:last-child)) {', ...body.map((l) => `${INDENT}${l}`), '}'] : body;
        return [`@utility ${className} {`, ...wrapped.map((l) => (l ? `${INDENT}${l}` : '')), '}'].join('\n');
    };

    const utilities = [];
    for (const token of tokens.values()) {
        for (const spec of roleFamilies(token)) {
            utilities.push({
                className: utilityName(spec.family, stem(token)),
                spec,
                name: token.name,
                of: token.name,
            });
        }
    }
    for (const exception of exceptions.values()) {
        for (const spec of exception.specs) {
            utilities.push({
                className: utilityName(spec.family, `${stem(exception.role)}--${exception.pattern}`),
                spec,
                name: exception.name,
                of: exception.name,
            });
        }
    }
    const classNames = new Set();
    for (const { className } of utilities) {
        if (classNames.has(className)) {
            fail(`spacing: utility ${className} is generated twice`);
        }
        classNames.add(className);
    }

    const roleCount = [...tokens.values()].filter((t) => t.kind !== 'size').length;
    const sizeCount = tokens.size - roleCount;
    const rawCss = `/*
 * GENERATED by scripts/tokens/generate.mjs from design-system/tokens/source/ (spacing.roles.tokens.json,
 * spacing.sizes.tokens.json, spacing.exceptions.tokens.json and spacing.config.json). Do not edit: change those files and
 * run \`pnpm tokens:generate\`.
 *
 * Semantic spacing: ${roleCount} roles, ${sizeCount} component sizes and ${exceptions.size} Today exceptions, ${utilities.length} utilities. A utility is
 * <family>-<role> (px-inset-item, gap-group, mt-related, space-y-section; gap roles drop their \`gap-\` prefix),
 * <family>-<size> (h-control-md, px-tag, min-h-row) or <family>-<role>--<pattern> for an exception (gap-group--16-24).
 * Every utility reads --${prefix}-<name>[-<axis or dimension>] and, through the \`${desktopVariant}\` variant, the same variable with -md.
 * Value sets:
${modeNames.map((mode) => ` * - ${config.modes[mode].selector.padEnd(26)}${config.modes[mode].description}`).join('\n')}
 * - ${coarse.media} ${coarse.mode}: ${coarseTokens.map(({ token, dim }) => pathOf(token, dim)).join(', ')} take their ${coarse.fallback} values.
 */

@layer theme {
${modeNames.map((mode) => block(config.modes[mode].selector, setLines(mode)).join('\n')).join('\n\n')}

${INDENT}@media ${coarse.media} {
${block(config.modes[coarse.mode].selector, coarseLines, 2).join('\n')}
${INDENT}}
}

${utilities.map(({ className, spec, name }) => utilityCss(className, spec, name)).join('\n\n')}
`;
    const outputFile = resolve(kitRoot, config.output);
    const css = formatWithBiome(kitRoot, outputFile, rawCss);

    const roleNames = [...tokens.values()].filter((t) => t.kind !== 'size').map((t) => t.name);
    const sizeNames = [...tokens.values()].filter((t) => t.kind === 'size').map((t) => t.name);
    const exceptionNames = [...exceptions.keys()];
    const list = (names) => `[${names.map((n) => `'${n}'`).join(', ')}]`;
    const rawTs = `/*
 * GENERATED by scripts/tokens/generate.mjs from design-system/tokens/source/spacing.*.tokens.json.
 * Do not edit: change the tokens and run \`pnpm tokens:generate\`.
 */

/**
 * Spacing roles: one per job of a space (insets inside a box, gaps between things, the navigation chrome). The class of
 * a role is \`<family>-<role>\` (\`px-inset-item\`), gap roles drop their \`gap-\` prefix (\`gap-group\`, \`mt-related\`).
 */
export const spacingRoles = ${list(roleNames)} as const;

/**
 * Component size tokens: control heights with their inner padding and gap, the tag pill, the clickable row
 * (\`h-control-md\`, \`px-control-md\`, \`h-tag\`, \`min-h-row\`).
 */
export const spacingSizes = ${list(sizeNames)} as const;

/**
 * Spacing exceptions: a place that keeps today's value under its role (\`<role>--<pattern>\`); every preview mode renders
 * the role. Each is meant to be resolved (dropped, moved to another role or promoted).
 */
export const spacingExceptions = ${list(exceptionNames)} as const;

export type SpacingRole = (typeof spacingRoles)[number];

export type SpacingSize = (typeof spacingSizes)[number];

export type SpacingException = (typeof spacingExceptions)[number];
`;
    const ts = formatWithBiome(kitRoot, resolve(kitRoot, config.typesOutput), rawTs);

    return { css, ts, tokens, exceptions, utilities, roleNames, sizeNames, exceptionNames, stem, changes, config };
};

// ----------------------------------------------------------------------------------------------------------------
// Report (`pnpm tokens:report`): the role, size and exception tables of spacing.decisions.md, with uses from a scan of
// the four scopes.
// ----------------------------------------------------------------------------------------------------------------

const SCAN_ROOTS = ['packages/gov-ui-kit/src', 'apps/app/src', 'packages/assistant-chat/src', 'apps/docs/src'];
const SCAN_EXTENSIONS = /\.(tsx?|jsx?|css|mdx)$/;

const walk = (dir, files = []) => {
    let names = [];
    try {
        names = readdirSync(dir);
    } catch {
        return files;
    }
    for (const name of names) {
        if (name === 'node_modules' || name.startsWith('.')) {
            continue;
        }
        const path = join(dir, name);
        if (statSync(path).isDirectory()) {
            walk(path, files);
        } else if (SCAN_EXTENSIONS.test(name) && !/\.(test|spec)\./.test(name) && !name.endsWith('.d.ts')) {
            files.push(path);
        }
    }
    return files;
};

export const spacingUses = ({ spacing, repoRoot }) => {
    const generated = new Set(
        ['src/theme/tokens/spacing.css', 'src/core/types/spacingStyles.ts'].map((file) =>
            resolve(repoRoot, 'packages/gov-ui-kit', file),
        ),
    );
    const byClass = new Map(spacing.utilities.map((u) => [u.className, { uses: 0, files: new Set() }]));
    const classPattern = /(?<![\w-])(-?[a-z][a-z0-9-]*(?:--[a-z0-9-]+)?)(?![\w-])/g;
    for (const root of SCAN_ROOTS) {
        for (const file of walk(resolve(repoRoot, root))) {
            if (generated.has(file)) {
                continue;
            }
            const text = readFileSync(file, 'utf8');
            for (const [, token] of text.matchAll(classPattern)) {
                const entry = byClass.get(token);
                if (entry != null) {
                    entry.uses++;
                    entry.files.add(relative(repoRoot, file));
                }
            }
        }
    }
    const byName = new Map();
    for (const { className, of } of spacing.utilities) {
        const entry = byName.get(of) ?? { uses: 0, files: new Set(), classes: [] };
        const found = byClass.get(className);
        entry.uses += found.uses;
        for (const file of found.files) {
            entry.files.add(file);
        }
        if (found.uses > 0) {
            entry.classes.push(className);
        }
        byName.set(of, entry);
    }
    return byName;
};

export const spacingReport = ({ spacing, repoRoot }) => {
    const uses = spacingUses({ spacing, repoRoot });
    const pair = (sides, mode) =>
        sides.base[mode] === sides.md[mode] ? `${sides.base[mode]}` : `${sides.base[mode]}→${sides.md[mode]}`;
    const tokenValue = (token, mode) =>
        Object.entries(token.dims)
            .map(([dim, sides]) => `${dim ? `${dim} ` : ''}${pair(sides, mode)}`)
            .join(' · ');
    const lines = [];
    lines.push('### Roles', '');
    lines.push(
        '| Role | Kind | Today | New | Looser | Compact | Uses | Files |',
        '| --- | --- | --- | --- | --- | --- | --- | --- |',
    );
    for (const token of spacing.tokens.values()) {
        if (token.kind === 'size') {
            continue;
        }
        const u = uses.get(token.name);
        lines.push(
            `| ${token.name} | ${token.kind}${token.chrome ? ' (chrome)' : ''} | ${MODES.map((m) => tokenValue(token, m)).join(' | ')} | ${u.uses} | ${u.files.size} |`,
        );
    }
    lines.push('', '### Sizes', '');
    lines.push(
        '| Size | Today | New | Looser | Compact | Uses | Files |',
        '| --- | --- | --- | --- | --- | --- | --- |',
    );
    for (const token of spacing.tokens.values()) {
        if (token.kind !== 'size') {
            continue;
        }
        const u = uses.get(token.name);
        lines.push(
            `| ${token.name} | ${MODES.map((m) => tokenValue(token, m)).join(' | ')} | ${u.uses} | ${u.files.size} |`,
        );
    }
    lines.push('', '### Exceptions', '');
    lines.push(
        '| Exception | Role | Families | Pattern | Today | Role Today | Role New | Uses | Places | Resolution |',
        '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    );
    const unused = [];
    for (const exception of spacing.exceptions.values()) {
        const u = uses.get(exception.name);
        if (u.uses === 0) {
            unused.push(exception.name);
        }
        const roleValue = (mode) =>
            exception.dims.map((dim) => `${dim ? `${dim} ` : ''}${pair(exception.role.dims[dim], mode)}`).join(' · ');
        lines.push(
            `| ${exception.name} | ${exception.role.name} | ${exception.specs.map((s) => s.family).join(', ')} | ${exception.description ?? ''} | ${pair(exception.values, 'today')} | ${roleValue('today')} | ${exception.role.chrome ? `${pair(exception.values, 'new')} (chrome)` : roleValue('new')} | ${u.uses} | ${[...u.files].map((f) => `\`${f.replace(/^(packages\/gov-ui-kit|apps\/app)\/src\//, '')}\``).join(', ')} | ${exception.resolution} |`,
        );
    }
    const exceptionChanges = spacing.changes.filter((c) => c.weight != null && !c.exempt);
    const weight = exceptionChanges.reduce((sum, c) => sum + c.weight, 0);
    const mean = weight === 0 ? 0 : exceptionChanges.reduce((sum, c) => sum + c.change * c.weight, 0) / weight;
    const max = Math.max(0, ...spacing.changes.filter((c) => !c.exempt).map((c) => c.change));
    const exempt = spacing.changes.filter((c) => c.exempt).length;
    lines.push(
        '',
        `Change in New (decision 0 budget): max ${max}px over roles and exceptions; exceptions mean ${mean.toFixed(2)}px per side (weighted by places); ${exempt} exempt sides (${Object.keys(spacing.config.budgetExemptRoles ?? {}).join(', ')}).`,
    );
    if (unused.length > 0) {
        lines.push('', `Unused exceptions (remove them from the source): ${unused.join(', ')}`);
    }
    return { text: lines.join('\n'), unused };
};
