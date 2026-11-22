// Breakpoint scopes of the value sets (spacing, typography): a utility reads one variable, and the variable changes its
// value once per breakpoint, at the scope where the breakpoint is measured, instead of every utility carrying its own
// desktop rule.
//
// - Root scope: `:root` under the desktop media query. This is the kit's own breakpoint (Tailwind's `md`, a viewport
//   media query), and in the app everything outside the application column (dialogs and menus portalled to the body, the
//   assistant panel, the column element itself), where the app's `md` variant is also a viewport media query.
// - Column scope (the app only, `scopes.config.json`): the direct children of the application column, which the app's
//   `md` variant measures with a container query. They set every variable that changes at the breakpoint to its phone
//   value, then to its desktop value under the container query, so a viewport that is wide while the column is narrow
//   (the assistant docked beside it) keeps the phone values inside the column. A container query never applies to its own
//   container, so the column element itself stays in the root scope, exactly as the app's `md` variant treats it.
//
// A value set is a Map of custom property -> value for the phone values and a Map for the values that differ from the
// phone ones at the breakpoint. Variables that alias another variable (a preview exception following its role) are
// declared again in the column scope next to the variable they alias: a custom property resolves `var()` on the element
// that declares it, so an alias declared on the root alone would keep the root's value in the column. On the same
// element the cascade settles it, so the desktop rules need no alias of their own.

import { relative } from 'node:path';
import { dimensionToCss } from './dtcg.mjs';

const INDENT = '    ';

export const indentLines = (lines, depth = 1) =>
    lines.map((line) => (line === '' ? line : INDENT.repeat(depth) + line));

// `selector { declarations }`; an item is [property, value] or a comment string.
export const rule = (selector, items) => [
    `${selector} {`,
    ...indentLines(items.map((item) => (typeof item === 'string' ? `/* ${item} */` : `${item[0]}: ${item[1]};`))),
    '}',
];

export const atRule = (head, lines) => [`${head} {`, ...indentLines(lines), '}'];

// The desktop breakpoint of the scopes, from the md primitive of the token source (the app's `md` variant repeats it;
// breakpoints.test.ts pins that copy to the theme).
export const desktopQuery = (primitives) => {
    const entry = primitives.get('breakpoint.css.md');
    if (entry == null) {
        throw new Error('scopes: the primitives have no breakpoint.css.md');
    }
    return `(width >= ${dimensionToCss(entry.value)})`;
};

/**
 * One value set as CSS rules.
 * @param {object} options
 * @param {string[]} options.selectors root-scope selectors of the set
 * @param {string|null} options.columnSelector column-scope selector (null without a column scope)
 * @param {Array} options.items phone declarations, with comments, in order: [property, value] | comment
 * @param {Map<string,string>} options.desktop declarations that differ at the breakpoint
 * @param {Set<string>} options.aliases custom properties whose value is `var()` of another custom property of the set
 * @param {Set<string>} options.columnKeys custom properties the column scope declares (the set's phone and desktop
 *   values of every variable that changes at the breakpoint in the root scope or in Today)
 * @param {string} options.query desktop media / container condition
 * @param {string} options.container name of the application column container
 * @param {string|null} options.wrap an at-rule head around the whole set (`@media (pointer: coarse)`)
 * @returns {{ root: string[], column: string[] }}
 */
export const renderSet = ({
    selectors,
    columnSelector,
    items,
    desktop,
    aliases,
    columnKeys,
    query,
    container,
    wrap,
}) => {
    const phone = new Map(items.filter((item) => typeof item !== 'string'));
    const root = [...rule(selectors.join(',\n'), items)];
    if (desktop.size > 0) {
        root.push(...atRule(`@media ${query}`, rule(selectors.join(',\n'), [...desktop])));
    }
    const column = [];
    if (columnSelector != null && columnKeys.size > 0) {
        const keys = [...columnKeys];
        const phoneItems = keys.map((key) => {
            if (!phone.has(key)) {
                throw new Error(`scopes: ${key} changes at the breakpoint but has no phone value (${columnSelector})`);
            }
            return [key, phone.get(key)];
        });
        const aliasItems = [...aliases]
            .filter((alias) => !columnKeys.has(alias) && keys.some((key) => phone.get(alias) === `var(${key})`))
            .map((alias) => [alias, phone.get(alias)]);
        column.push(...rule(columnSelector, [...phoneItems, ...aliasItems]));
        const desktopItems = [...desktop].filter(([key]) => columnKeys.has(key));
        if (desktopItems.length > 0) {
            column.push(...atRule(`@container ${container} ${query}`, rule(columnSelector, desktopItems)));
        }
    }
    return wrap == null
        ? { root, column }
        : { root: atRule(wrap, root), column: column.length > 0 ? atRule(wrap, column) : column };
};

// Repo-relative path of an output given relative to the kit root.
export const repoPath = (kitRoot, repoRoot, file) => relative(repoRoot, new URL(file, `file://${kitRoot}/`).pathname);
