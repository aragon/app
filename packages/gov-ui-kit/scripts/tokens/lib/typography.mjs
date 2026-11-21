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
// Today leaves the properties in `config.todayInherits` unset (the variable is not declared, which makes the
// declaration fall back to inheritance): a role never overrides the family or the letter spacing an element inherits
// today, and those Today values must be the defaults stated in the config.

import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { aliasTarget, dimensionToCss, isAlias } from './dtcg.mjs';

const PROPERTIES = [
    ['fontFamily', 'font-family'],
    ['fontSize', 'font-size'],
    ['lineHeight', 'line-height'],
    ['fontWeight', 'font-weight'],
    ['letterSpacing', 'letter-spacing'],
];
const BREAKPOINTS = ['base', 'md'];
const ROOT = 'type';

export const renderTypography = ({ kitRoot, outputFile, primitives, modes, config, varOf, fail }) => {
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

    const variable = (name, breakpoint, property) =>
        `--${prefix}-${name}${breakpoint === 'md' ? '-md' : ''}-${property}`;

    // A composite part as CSS: an alias of a primitive is its variable, a literal is formatted by its type.
    const partCss = (mode, path, key, value) => {
        if (isAlias(value)) {
            const target = aliasTarget(value);
            if (!primitives.has(target)) {
                fail(`typography ${mode}: ${path}.${key} references ${target}, which is not a primitive`);
            }
            return `var(${varOf(target)})`;
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

    // Value set of one mode: [variable, value] lines.
    const setLines = (mode) => {
        const lines = [];
        for (const style of styles.values()) {
            lines.push(
                `/* ${style.kind} ${style.name}${style.role ? ` (Today: its own bundle; ${mode === 'today' ? 'kept' : `follows ${style.role}`})` : ''} */`,
            );
            for (const breakpoint of BREAKPOINTS) {
                const path = `${ROOT}.${style.kind}.${style.name}.${breakpoint}`;
                const { value } = modes[mode].get(path);
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
                    for (const [key, property] of PROPERTIES) {
                        lines.push(
                            `${variable(style.name, breakpoint, property)}: var(${variable(style.role, breakpoint, property)});`,
                        );
                        void key;
                    }
                    continue;
                }
                for (const [key, property] of PROPERTIES) {
                    if (mode === 'today' && todayInherits.includes(key)) {
                        if (JSON.stringify(value[key]) !== JSON.stringify(todayDefaults[key])) {
                            fail(
                                `typography today: ${path}.${key} must be ${JSON.stringify(todayDefaults[key])} (inherited today)`,
                            );
                        }
                        continue;
                    }
                    lines.push(
                        `${variable(style.name, breakpoint, property)}: ${partCss(mode, path, key, value[key])};`,
                    );
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
                css = isAlias(entry.value) ? `var(${varOf(aliasTarget(entry.value))})` : String(entry.value);
                if (isAlias(entry.value) && !primitives.has(aliasTarget(entry.value))) {
                    fail(
                        `typography ${mode}: ${path} references ${aliasTarget(entry.value)}, which is not a primitive`,
                    );
                }
            } else {
                css = modifierConfig[name].values[mode] ?? null;
            }
            if (css != null) {
                lines.push(`/* modifier ${name} */`, `--${prefix}-${name}-${property}: ${css};`);
            }
        }
        return lines;
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
    const block = (selector, lines) => [
        `${indent}${selector} {`,
        ...lines.map((l) => `${indent}${indent}${l}`),
        `${indent}}`,
    ];

    const utilityOf = (name) => {
        const declarations = (breakpoint) =>
            PROPERTIES.map(([key, property]) =>
                key === 'lineHeight'
                    ? `@apply leading-(${variable(name, breakpoint, property)});`
                    : `${property}: var(${variable(name, breakpoint, property)});`,
            );
        return [
            `@utility ${prefix}-${name} {`,
            ...declarations('base').map((l) => `${indent}${l}`),
            '',
            `${indent}@variant ${config.desktopVariant} {`,
            ...declarations('md').map((l) => `${indent}${indent}${l}`),
            `${indent}}`,
            '}',
        ].join('\n');
    };
    const modifierUtilities = Object.entries(modifierConfig).map(
        ([name, { property }]) =>
            `@utility ${prefix}-${name} {\n${indent}${property}: var(--${prefix}-${name}-${property});\n}`,
    );

    const valueSets = modeNames.map((mode) => block(config.modes[mode].selector, setLines(mode)).join('\n'));

    const rawCss = `/*
 * GENERATED by scripts/tokens/generate.mjs from design-system/tokens/source/ (typography.*.tokens.json,
 * primitives.tokens.json and typography.config.json). Do not edit: change those files and run \`pnpm tokens:generate\`.
 *
 * Semantic typography. One utility per role (${roleNames.length}) and per exception (${exceptionNames.length}): ${prefix}-<role>, ${prefix}-<role>--<pattern>,
 * plus the modifiers ${Object.keys(modifierConfig)
     .map((m) => `${prefix}-${m}`)
     .join(', ')}. Every utility reads
 * variables --${prefix}-<style>-<property> and, through the \`${config.desktopVariant}\` variant, --${prefix}-<style>-md-<property>.
 * Value sets:
 * - ${config.modes.today.selector.padEnd(24)}today's rendering: an exception keeps its place's bundle; ${todayInherits.join(' and ')}
 *                            are not declared, so they stay inherited exactly as today;
${modeNames
    .slice(1)
    .map((mode) => ` * - ${config.modes[mode].selector.padEnd(24)}${config.modes[mode].description}`)
    .join('\n')}
 */

@layer theme {
${valueSets.join('\n\n')}
}

${[...[...styles.keys()].map(utilityOf), ...modifierUtilities].join('\n\n')}
`;

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
    return { css, ts, styles, roleNames, exceptionNames, describe, today };
};
