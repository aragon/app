// Real Tailwind compiles of the stylesheet entries that render the mapped sources, and a model of what each class
// writes: for every rule of a class, its context (wrapping at-rules + selector with the class replaced by `&`), its
// specificity, its position in the output and its declarations with every non-Tailwind `var()` resolved through the
// default theme (`:root`, never `[data-theme=…]`).
//
// Used by validate-app-map.mjs. The compile is the same one the app build runs (`@tailwindcss/postcss` on the entry
// file), plus `@source inline(…)` with every class the validator needs, so classes that no source uses yet (the
// replacements) are emitted in their real order.

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';

export const STYLESHEETS = {
    // apps/app and packages/assistant-chat (rendered by the app, which sources the chat package).
    app: 'apps/app/src/modules/application/components/layouts/layoutRoot/layoutRoot.css',
    // apps/docs has its own entry (kit tokens + Fumadocs preset).
    docs: 'apps/docs/src/app/globals.css',
};

export const createCompiler = (repoRoot) => {
    const require = createRequire(resolve(repoRoot, 'apps/app/package.json'));
    const postcss = require('postcss');
    const tailwind = require('@tailwindcss/postcss');
    const docsRequire = createRequire(
        resolve(repoRoot, 'apps/docs/package.json'),
    );
    const docsTailwind = docsRequire('@tailwindcss/postcss');

    const compile = async (which, classes) => {
        const entry = resolve(repoRoot, STYLESHEETS[which]);
        // `@source inline` expands braces; none of the colour classes has one, but fail rather than guess.
        const bad = classes.filter((c) => /[{}"]/.test(c));
        if (bad.length > 0) {
            throw new Error(
                `cannot inline classes with braces or quotes: ${bad.join(' ')}`,
            );
        }
        const css = `${readFileSync(entry, 'utf8')}\n@source inline("${[...new Set(classes)].join(' ')}");\n`;
        const plugin = (which === 'docs' ? docsTailwind : tailwind)({
            optimize: false,
            base: dirname(entry),
        });
        const result = await postcss([plugin]).process(css, { from: entry });
        return parseCompiled(postcss, result.css);
    };
    return { compile, postcss };
};

const unescapeCss = (s) => s.replace(/\\(.)/g, '$1');
const CLASS_IN_SELECTOR = /\.((?:\\.|[^\s.:>+~,[\]()#*])+)/g;

// Specificity of one selector, approximately: :where() counts nothing, :is()/:has()/:not() count their argument.
const specificity = (selector) => {
    let s = selector
        .replace(/\\./g, '_')
        .replace(/:where\((?:[^()]|\([^()]*\))*\)/g, '');
    const ids = (s.match(/#[\w-]+/g) ?? []).length;
    s = s.replace(/#[\w-]+/g, '');
    const classes =
        (s.match(/\.[^\s.:>+~,[\]()#*]+/g) ?? []).length +
        (s.match(/\[[^\]]*\]/g) ?? []).length +
        (s.match(/(?<!:):(?!is\(|has\(|not\(|where\()[a-z-]+/g) ?? []).length;
    const elements =
        (s.match(/::[a-z-]+/g) ?? []).length +
        (s.match(/(?:^|[\s>+~(])(?:[a-z][a-z0-9]*)/g) ?? []).length;
    return [ids, classes, elements];
};
const compareSpec = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

export const parseCompiled = (postcss, css) => {
    const root = postcss.parse(css);
    const rootVars = new Map();
    const byClass = new Map();
    let index = 0;
    root.walkRules((rule) => {
        index++;
        const chain = [];
        for (
            let p = rule.parent;
            p != null && p.type !== 'root';
            p = p.parent
        ) {
            if (p.type === 'atrule') {
                chain.unshift(`@${p.name} ${p.params}`.trim());
            } else if (p.type === 'rule') {
                chain.unshift(p.selector);
            }
        }
        const selectors = rule.selectors;
        // Default theme: `:root` / `:host` blocks only (the kit's [data-theme] value sets are other selectors).
        if (selectors.every((s) => /^\s*(:root|:host)\s*$/.test(s))) {
            rule.each((d) => {
                if (d.type === 'decl' && d.prop.startsWith('--')) {
                    rootVars.set(d.prop, d.value);
                }
            });
        }
        const names = new Set();
        for (const sel of selectors) {
            for (const m of sel.matchAll(CLASS_IN_SELECTOR)) {
                names.add(unescapeCss(m[1]));
            }
        }
        if (names.size === 0) {
            return;
        }
        const decls = [];
        rule.each((d) => {
            if (d.type === 'decl') {
                decls.push({
                    prop: d.prop,
                    value: d.value,
                    important: d.important === true,
                });
            }
        });
        if (decls.length === 0) {
            return;
        }
        for (const name of names) {
            const context = [
                ...chain,
                selectors
                    .map((sel) =>
                        sel.replace(CLASS_IN_SELECTOR, (all, raw) =>
                            unescapeCss(raw) === name ? '.&' : all,
                        ),
                    )
                    .join(', '),
            ].join(' » ');
            const spec = selectors
                .map((sel) => specificity(sel))
                .sort(compareSpec)
                .at(-1);
            const list = byClass.get(name) ?? [];
            list.push({ index, context, spec, decls });
            byClass.set(name, list);
        }
    });

    // Resolves every var() that is not Tailwind's own (--tw-*) through the default theme, then normalises colours.
    const resolveVars = (value, depth = 0) => {
        if (depth > 40 || !value.includes('var(')) {
            return value;
        }
        let out = '';
        let i = 0;
        while (i < value.length) {
            const j = value.indexOf('var(', i);
            if (j < 0) {
                out += value.slice(i);
                break;
            }
            out += value.slice(i, j);
            let k = j + 4;
            let level = 1;
            while (k < value.length && level > 0) {
                if (value[k] === '(') {
                    level++;
                } else if (value[k] === ')') {
                    level--;
                }
                k++;
            }
            const inner = value.slice(j + 4, k - 1);
            const comma = inner.indexOf(',');
            const name = (comma < 0 ? inner : inner.slice(0, comma)).trim();
            const fallback = comma < 0 ? null : inner.slice(comma + 1).trim();
            if (name.startsWith('--tw-')) {
                out += `var(${name}${fallback != null ? `, ${resolveVars(fallback, depth + 1)}` : ''})`;
            } else if (rootVars.has(name)) {
                out += resolveVars(rootVars.get(name), depth + 1);
            } else if (fallback != null) {
                out += resolveVars(fallback, depth + 1);
            } else {
                out += `var(${name})`;
            }
            i = k;
        }
        return out;
    };
    const normalise = (value) =>
        normaliseColours(resolveVars(value).replace(/\s+/g, ' ').trim());
    const rulesOf = (cls) =>
        (byClass.get(cls) ?? []).map((r) => ({
            ...r,
            decls: r.decls.map((d) => ({ ...d, value: normalise(d.value) })),
        }));
    return { rulesOf, rootVars, resolve: normalise, compareSpec };
};

const hexToRgba = (hex) => {
    let h = hex.slice(1).toLowerCase();
    if (h.length <= 4) {
        h = [...h].map((c) => c + c).join('');
    }
    const n = Number.parseInt(h.slice(0, 6), 16);
    const a = h.length === 8 ? Number.parseInt(h.slice(6, 8), 16) / 255 : 1;
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${Math.round(a * 1000) / 1000})`;
};
// Hex and rgb()/rgba() become `rgba(r, g, b, a)`; lengths `0px` become `0`. color-mix() keeps its interpolation space,
// so an oklab mix is never taken for an srgb one.
const normaliseColours = (value) =>
    value
        .toLowerCase()
        .replace(/#[0-9a-f]{3,8}\b/g, hexToRgba)
        .replace(
            /rgba?\(\s*(\d+)[,\s]\s*(\d+)[,\s]\s*(\d+)\s*(?:[,/]\s*([\d.]+%?))?\s*\)/g,
            (_m, r, g, b, a) =>
                `rgba(${r}, ${g}, ${b}, ${a == null ? 1 : a.endsWith('%') ? Number.parseFloat(a) / 100 : Math.round(Number(a) * 1000) / 1000})`,
        )
        .replace(/(^|[\s(,])0px\b/g, '$10')
        .replace(/\(\s+/g, '(')
        .replace(/\s+\)/g, ')')
        .replace(/\s*,\s*/g, ', ');
