// Semantic typography layer: renders `src/theme/tokens/typography.css` from the typography mode files
// (typography.today.tokens.json / typography.next.tokens.json), the primitives and typography.config.json.
//
// Tokens (DTCG `typography` composites, two per style: `base` below the desktop breakpoint, `md` from it):
// - type.role.<role>              the 14 purpose roles;
// - type.exception.<role>--<pattern>   a place whose Today rendering differs from its role's: Today keeps the place's
//                                 bundle, every other mode follows the role (a composite alias of the role);
// - type.modifier.strong / mono   a font weight / a font family applied on top of any role.
// Output: one value set per mode as custom properties (`--type-<style>-<property>` and `--type-<style>-md-<property>`),
// the Today set on `config.modes.today.selector`, every other set on its own attribute selector, and one Tailwind
// `@utility type-<style>` per role and exception. A utility sets the base values and switches to the `md` values
// through Tailwind's own `md` variant, so it follows whatever `md` means in the stylesheet that compiles it (a media
// query in the kit, a container query on the app column in the app). Themes swap variables, never utilities.
//
// Today leaves the properties in `config.todayInherits` unset where they hold the default stated in the config (the
// variable is not declared, which makes the declaration fall back to inheritance): a role never overrides the family or
// the letter spacing an element inherits today. A Today value other than the default is declared like any other.

import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { aliasTarget, declaration, dimensionToCss, isAlias } from './dtcg.mjs';
import { indentLines, renderSet } from './scopes.mjs';

const PROPERTIES = [
    ['fontFamily', 'font-family'],
    ['fontSize', 'font-size'],
    ['lineHeight', 'line-height'],
    ['fontWeight', 'font-weight'],
    ['letterSpacing', 'letter-spacing'],
];
const BREAKPOINTS = ['base', 'md'];
const ROOT = 'type';

export const renderTypography = ({
    kitRoot,
    outputFile,
    primitives,
    modes,
    todayDocument,
    config,
    varOf,
    scopes,
    fail,
}) => {
    const { prefix, todayInherits, todayDefaults, modifiers: modifierConfig } = config;
    const modeNames = Object.keys(config.modes);
    if (modeNames[0] !== 'today') {
        fail('typography.config.json: the first mode must be "today"');
    }
    const today = modes.today;

    // Every mode declares exactly the token paths of Today.
    for (const mode of modeNames.slice(1)) {
        const missing = [...today.keys()].filter((path) => !modes[mode].has(path));
        const extra = [...modes[mode].keys()].filter((path) => !today.has(path));
        if (missing.length > 0 || extra.length > 0) {
            fail(
                `typography mode ${mode} differs from today: missing ${missing.join(', ')}; extra ${extra.join(', ')}`,
            );
        }
    }

    // Styles: roles and exceptions, each with a base and an md composite.
    const styles = new Map();
    for (const [path, entry] of today) {
        const match = path.match(/^type\.(role|exception)\.([a-z0-9-]+)\.(base|md)$/);
        if (match == null) {
            if (!/^type\.modifier\.[a-z]+$/.test(path)) {
                fail(`typography: unexpected token ${path} (type.role.*, type.exception.*, type.modifier.*)`);
            }
            continue;
        }
        if (entry.type !== 'typography') {
            fail(`typography: ${path} must be a typography composite`);
        }
        const [, kind, name] = match;
        const style = styles.get(name) ?? { name, kind, role: null, pattern: null, extensions: null };
        if (style.kind !== kind) {
            fail(`typography: ${name} is both a role and an exception`);
        }
        styles.set(name, style);
    }
    for (const style of styles.values()) {
        for (const breakpoint of BREAKPOINTS) {
            if (!today.has(`${ROOT}.${style.kind}.${style.name}.${breakpoint}`)) {
                fail(`typography: ${style.kind} ${style.name} has no ${breakpoint} composite`);
            }
        }
        if (style.kind === 'exception') {
            const [role, pattern] = style.name.split('--');
            if (pattern == null || !styles.has(role) || styles.get(role).kind !== 'role') {
                fail(`typography: exception ${style.name} must be named <role>--<pattern> after an existing role`);
            }
            style.role = role;
            style.pattern = pattern;
        }
    }
    const roleNames = [...styles.values()].filter((s) => s.kind === 'role').map((s) => s.name);
    const exceptionNames = [...styles.values()].filter((s) => s.kind === 'exception').map((s) => s.name);

    const variable = (name, property) => `--${prefix}-${name}-${property}`;

    // A primitive as CSS. The preview stylesheet is plain CSS that Tailwind does not process, and Tailwind only emits the
    // theme variables its own CSS reads (Next's faces are read by nothing else), so a preview value carries the literal
    // as the fallback of the variable.
    const reference = (mode, target) => {
        const name = varOf(target);
        if (mode === 'today') {
            return `var(${name})`;
        }
        const literal = declaration(name, primitives.get(target), varOf, true)
            .replace(/^[^:]+:\s*/, '')
            .replace(/;\s*$/, '')
            .replace(/\s+/g, ' ');
        return `var(${name}, ${literal})`;
    };

    // A composite part as CSS: an alias of a primitive is its variable, a literal is formatted by its type.
    const partCss = (mode, path, key, value) => {
        if (isAlias(value)) {
            const target = aliasTarget(value);
            if (!primitives.has(target)) {
                fail(`typography ${mode}: ${path}.${key} references ${target}, which is not a primitive`);
            }
            return reference(mode, target);
        }
        switch (key) {
            case 'fontSize':
            case 'letterSpacing':
                return dimensionToCss(value);
            case 'lineHeight':
            case 'fontWeight':
                return String(value);
            default:
                return fail(`typography ${mode}: ${path}.${key} must reference a font family primitive`);
        }
    };

    // Value set of one mode: [property, phone value] items with comments, the values that differ at the desktop
    // breakpoint, and the properties that alias another one (an exception following its role).
    const modeValues = (mode) => {
        const items = [];
        const desktop = new Map();
        const aliases = new Set();
        for (const style of styles.values()) {
            items.push(
                `${style.kind} ${style.name}${style.role ? ` (Today: its own bundle; ${mode === 'today' ? 'kept' : `follows ${style.role}`})` : ''}`,
            );
            const cssOf = {};
            for (const breakpoint of BREAKPOINTS) {
                const path = `${ROOT}.${style.kind}.${style.name}.${breakpoint}`;
                const { value } = modes[mode].get(path);
                cssOf[breakpoint] = {};
                if (isAlias(value)) {
                    // A composite alias: allowed only from an exception to its own role (same breakpoint).
                    const target = aliasTarget(value);
                    if (
                        mode === 'today' ||
                        style.kind !== 'exception' ||
                        target !== `${ROOT}.role.${style.role}.${breakpoint}`
                    ) {
                        fail(`typography ${mode}: ${path} may only alias ${ROOT}.role.${style.role}.${breakpoint}`);
                    }
                    for (const [, property] of PROPERTIES) {
                        cssOf[breakpoint][property] = `var(${variable(style.role, property)})`;
                    }
                    continue;
                }
                for (const [key, property] of PROPERTIES) {
                    // Today leaves an inherited property unset where its value is the default, so it keeps inheriting;
                    // a style that renders another value today (letter spacing of uppercase column labels) sets it.
                    if (
                        mode === 'today' &&
                        todayInherits.includes(key) &&
                        JSON.stringify(value[key]) === JSON.stringify(todayDefaults[key])
                    ) {
                        continue;
                    }
                    cssOf[breakpoint][property] = partCss(mode, path, key, value[key]);
                }
            }
            for (const [, property] of PROPERTIES) {
                const phone = cssOf.base[property];
                const wide = cssOf.md[property];
                if (phone == null && wide == null) {
                    continue;
                }
                if (phone == null || wide == null) {
                    fail(`typography ${mode}: ${style.name} sets ${property} at one breakpoint only`);
                }
                items.push([variable(style.name, property), phone]);
                if (wide !== phone) {
                    desktop.set(variable(style.name, property), wide);
                }
                if (phone.startsWith('var(')) {
                    aliases.add(variable(style.name, property));
                }
            }
        }
        // Modifiers: token modifiers (strong, mono) and the non-token ones of the config (numeric).
        for (const [name, { property, type }] of Object.entries(modifierConfig)) {
            const path = `${ROOT}.modifier.${name}`;
            let css = null;
            if (type === 'token') {
                const entry = modes[mode].get(path);
                if (entry == null) {
                    fail(`typography ${mode}: modifier ${name} has no token ${path}`);
                }
                css = isAlias(entry.value) ? reference(mode, aliasTarget(entry.value)) : String(entry.value);
                if (isAlias(entry.value) && !primitives.has(aliasTarget(entry.value))) {
                    fail(
                        `typography ${mode}: ${path} references ${aliasTarget(entry.value)}, which is not a primitive`,
                    );
                }
            } else {
                css = modifierConfig[name].values[mode] ?? null;
            }
            if (css != null) {
                items.push(`modifier ${name}`, [`--${prefix}-${name}-${property}`, css]);
            }
        }
        return { items, desktop, aliases };
    };
    for (const name of Object.keys(modifierConfig)) {
        if (modifierConfig[name].type === 'token' && !today.has(`${ROOT}.modifier.${name}`)) {
            fail(`typography: modifier ${name} has no token`);
        }
    }
    for (const path of today.keys()) {
        const match = path.match(/^type\.modifier\.([a-z]+)$/);
        if (match != null && modifierConfig[match[1]]?.type !== 'token') {
            fail(`typography: ${path} is not a token modifier of the config`);
        }
    }

    const indent = '    ';
    const utilityOf = (name) => {
        const declarations = PROPERTIES.map(([key, property]) =>
            key === 'lineHeight'
                ? `@apply leading-(${variable(name, property)});`
                : `${property}: var(${variable(name, property)});`,
        );
        return [`@utility ${prefix}-${name} {`, ...declarations.map((l) => `${indent}${l}`), '}'].join('\n');
    };
    const modifierUtilities = Object.entries(modifierConfig).map(
        ([name, { property }]) =>
            `@utility ${prefix}-${name} {\n${indent}${property}: var(--${prefix}-${name}-${property});\n}`,
    );

    const todayValues = modeValues('today');
    const columnPart = scopes.column;
    const sets = {};
    for (const mode of modeNames) {
        const values = modeValues(mode);
        const selector = config.modes[mode].selector;
        // Today's column rules set its exceptions' own values on the children, so a mode that makes an exception follow
        // its role must set it there too (as an alias, next to the variable it aliases).
        const keys = new Set([...todayValues.desktop.keys(), ...values.desktop.keys()]);
        sets[mode] = renderSet({
            selectors: mode === 'today' ? [selector] : [`:root${selector}`, selector],
            columnSelector:
                columnPart == null ? null : `${mode === 'today' ? '' : `${selector} `}:where(${columnPart.selector})`,
            items: values.items,
            desktop: values.desktop,
            aliases: values.aliases,
            columnKeys: mode === 'today' ? new Set(todayValues.desktop.keys()) : keys,
            query: scopes.query,
            container: columnPart?.container,
            wrap: null,
        });
    }

    const rawCss = `/*
 * GENERATED by scripts/tokens/generate.mjs from design-system/tokens/source/ (typography.*.tokens.json,
 * primitives.tokens.json and typography.config.json). Do not edit: change those files and run \`pnpm tokens:generate\`.
 *
 * Semantic typography. One utility per role (${roleNames.length}) and per exception (${exceptionNames.length}): ${prefix}-<role>, ${prefix}-<role>--<pattern>,
 * plus the modifiers ${Object.keys(modifierConfig)
     .map((m) => `${prefix}-${m}`)
     .join(', ')}. Every utility reads
 * variables --${prefix}-<style>-<property>, which hold the phone value and take the desktop value under the desktop
 * media query (the app also sets them on the children of its application column, tokensColumn.css).
 * This file holds Today's value set (${config.modes.today.selector}): an exception keeps its place's bundle; ${todayInherits.join(' and ')}
 * are not declared, so they stay inherited exactly as today. The preview modes are in the preview stylesheets:
${modeNames
    .slice(1)
    .map((mode) => ` * - ${config.modes[mode].selector.padEnd(26)}${config.modes[mode].description}`)
    .join('\n')}
 */

@layer theme {
${indentLines(sets.today.root).join('\n')}
}

${[...[...styles.keys()].map(utilityOf), ...modifierUtilities].join('\n\n')}
`;
    const preview = {
        comments: modeNames.slice(1).map((mode) => `${config.modes[mode].selector}: ${config.modes[mode].description}`),
        root: modeNames.slice(1).flatMap((mode) => sets[mode].root),
        column: modeNames.slice(1).flatMap((mode) => sets[mode].column),
    };
    const todayColumn = sets.today.column;

    const css = execFileSync(
        resolve(kitRoot, 'node_modules/.bin/biome'),
        ['format', `--stdin-file-path=${outputFile}`],
        {
            cwd: kitRoot,
            input: rawCss,
            encoding: 'utf8',
        },
    );

    // The style names as a TypeScript union, for components that take a typography style as a prop (Heading).
    const rawTs = `/*
 * GENERATED by scripts/tokens/generate.mjs from design-system/tokens/source/typography.today.tokens.json.
 * Do not edit: change the tokens and run \`pnpm tokens:generate\`.
 */

/**
 * Typography roles: one per purpose of a text element. The class of a role is \`${prefix}-<role>\`.
 */
export const typographyRoles = [${roleNames.map((n) => `'${n}'`).join(', ')}] as const;

/**
 * Typography exceptions: a place that keeps today's rendering under its role (\`<role>--<pattern>\`); in the Next
 * preview it renders its role. Each is meant to be resolved (dropped, moved to another role or promoted).
 */
export const typographyExceptions = [${exceptionNames.map((n) => `'${n}'`).join(', ')}] as const;

/**
 * The utility class of every role and exception, spelled out so that Tailwind finds each class in the source (a class
 * name built at runtime is never generated).
 */
export const typographyClassNames = {
${[...roleNames, ...exceptionNames].map((n) => `    '${n}': '${prefix}-${n}',`).join('\n')}
} as const;

export type TypographyRole = (typeof typographyRoles)[number];

export type TypographyException = (typeof typographyExceptions)[number];

/**
 * A typography role or exception, rendered by the \`${prefix}-<style>\` utility.
 */
export type TypographyStyle = TypographyRole | TypographyException;
`;
    const tsFile = resolve(kitRoot, config.typesOutput);
    const ts = execFileSync(resolve(kitRoot, 'node_modules/.bin/biome'), ['format', `--stdin-file-path=${tsFile}`], {
        cwd: kitRoot,
        input: rawTs,
        encoding: 'utf8',
    });

    const describe = (name, mode, breakpoint) => {
        const style = styles.get(name);
        const { value } = modes[mode].get(`${ROOT}.${style.kind}.${name}.${breakpoint}`);
        return value;
    };
    // Exception groups: their pattern ($description) and resolution ($extensions), for the report.
    const groups = new Map(
        Object.entries(todayDocument?.type?.exception ?? {}).map(([name, group]) => [
            name,
            { description: group.$description, extensions: group.$extensions?.['org.aragon.gov-ui-kit'] },
        ]),
    );
    return { css, ts, preview, todayColumn, styles, roleNames, exceptionNames, describe, today, groups };
};
