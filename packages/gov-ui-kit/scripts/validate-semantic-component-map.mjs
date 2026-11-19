#!/usr/bin/env node
// Proves that design-system/tokens/semantic-colors.component-map.json is safe to apply, without applying it:
//
// 1. Coverage: every primitive colour class in the in-scope component sources appears exactly once, in source order,
//    and the map lists nothing else. Stories, tests and story helpers are listed completely in their own sections.
// 2. Parity: every converted entry keeps its default-theme value. Both sides are resolved through the CSS: the old
//    class through the primitive tokens (colors.css, shadows.css, focusRing.css, opacity modifiers included), the new
//    classes through the generated semantic utilities and their `:root` values (aliases, color-mix, shadow geometry).
//    Variant prefixes must be carried unchanged; a converted class may not add or drop a CSS property.
// 3. Tokens: no forbidden token, every token exists, every token used has a parity value verified from code (not the
//    fallback rule), and the generated CSS is up to date.
// 4. Unconverted entries carry a known reason; a `conflict` names an existing token whose default value really
//    differs from the class (otherwise it should have been converted); a `forbidden-token` names a forbidden token.
// 5. Ordering: Tailwind orders same-variant, same-property utilities by name, so renaming can change which of two
//    classes wins. A TypeScript pass works out which classes can sit on the same element at once (classes reach an
//    element through className attributes and the const variables / lookup maps they reference; branches of a
//    ternary and different keys of a lookup map exclude each other). Every such pair whose winner (and colour)
//    would change fails, unless it is listed in orderingReviewed with a justification.
//    Declared cross-component overrides (a class passed via className to another kit component) are checked too.
// 6. Summary counts and the batch split (every file in exactly one batch) match the entries.
//
// Once scripts/apply-semantic-component-map.mjs has run, the map carries `applied` (the commit it was applied on) and
// its line numbers describe the sources of that commit: Biome then re-sorted and re-wrapped some of the edited lines.
// Step 1 checks the applied state per file instead: the primitive classes left are exactly the unconverted entries, no
// converted `old` is left, every class of every converted `new` is there (as often as the entries need it), and every
// listed test assertion uses its `new` class. Step 5's pairwise pass ran on the sources it was proven against and is
// skipped (renaming is done; the outcome is what the screenshot comparison covers); the cross-component overrides,
// steps 2-4 and 6 only read the map, the token data and the generated CSS and run unchanged.
//
// Usage: node scripts/validate-semantic-component-map.mjs   (exit 1 on any failure)

import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const kitRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(resolve(kitRoot, p), 'utf8');
const map = JSON.parse(read('design-system/tokens/semantic-colors.component-map.json'));

const errors = [];
const fail = (message) => errors.push(message);
const applied = map.applied != null;
const escapeRe = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Whole-class occurrences of `cls` in a text (same boundaries as CLASS_RE).
const countClass = (text, cls) =>
    [...text.matchAll(new RegExp(String.raw`(?<=^|[\s'"\`{(,])${escapeRe(cls)}(?=$|[\s'"\`},)])`, 'gm'))].length;
// Applied state: every class of every converted entry's replacement is in the file, as often as the entries need it.
const checkApplied = (file, entries) => {
    const text = read(file);
    const expected = new Map();
    for (const e of entries.filter((x) => x.new != null)) {
        for (const cls of e.new.split(' ')) {
            expected.set(cls, (expected.get(cls) ?? 0) + 1);
        }
    }
    for (const [cls, count] of expected) {
        const found = countClass(text, cls);
        if (found < count) {
            fail(`${file}: applied map expects ${count} × "${cls}", found ${found}`);
        }
    }
};
// Applied state: the primitive classes left are exactly the unconverted ones (as a multiset; lines may have moved).
const sameClasses = (found, entries) =>
    found
        .map((o) => o.old)
        .sort()
        .join('|') ===
    entries
        .map((e) => e.old)
        .sort()
        .join('|');

const FORBIDDEN = new Set([
    'bg/accent/default-inverse',
    'bg/accent/hover-inverse',
    'bg/accent/active-inverse',
    'bg/surface/primary-inverse',
    'bg/surface/secondary-inverse',
    'bg/surface/tertiary-inverse',
    'bg/surface/hover-inverse',
    'bg/surface/disabled-inverse',
    'border/accent/primary-inverse',
    'bg/info/secondary',
]);
const REASONS = new Set(['conflict', 'no-utility', 'no-token', 'forbidden-token', 'comment', 'ordering']);

// ---------------------------------------------------------------------------------------------------------------
// Scope and extraction
// ---------------------------------------------------------------------------------------------------------------

const RAMP = 'primary|neutral|info|success|warning|critical';
const CLASS_RE = new RegExp(
    String.raw`(?<=^|[\s'"\`{(,])((?:(?:[A-Za-z0-9_@*&>.%#=+/-]|\[[^\]\s'"\`]*\])+:)*)(!?)((?:bg|text|border(?:-[xytrblse])?|outline|ring|ring-offset|divide(?:-[xy])?|fill|stroke|from|via|to|placeholder|caret|accent|decoration|inset-shadow|drop-shadow|shadow)-(?:${RAMP})-\d+(?:\/\d+)?|shadow-(?:${RAMP})(?:-(?:sm|md|lg|xl|2xl))?|focus-ring-(?:${RAMP})|gradient-[a-z0-9-]*(?:${RAMP})[a-z0-9-]*|prose-(?:${RAMP}))(!?)(?=$|[\s'"\`},)])`,
    'gm',
);
// Anything that looks like a ramp colour, used to prove the strict pattern misses nothing.
const LOOSE_RE = new RegExp(
    String.raw`(?<![\w-])[\w:/\[\]=&*.@!-]*?(?:${RAMP})-\d+|(?:shadow|focus-ring|gradient|prose)-[a-z0-9-]*(?:${RAMP})`,
    'g',
);

const walk = (dir) =>
    readdirSync(resolve(kitRoot, dir)).flatMap((name) => {
        const path = join(dir, name);
        return statSync(resolve(kitRoot, path)).isDirectory() ? walk(path) : [path];
    });
const sources = ['src/core/components', 'src/modules/components']
    .flatMap(walk)
    .filter((f) => /\.(tsx?|css)$/.test(f))
    .sort();
const isAux = (f) => /\.(stories|test|spec)\.tsx?$/.test(f) || /StoryComponent\.tsx$/.test(f);
const isButton = (f) => f === 'src/core/components/button/button.tsx';

// Semantic utility names. Two of them equal a primitive shadow class (shadow-warning-sm, shadow-critical-sm: the map
// converts them to themselves); in the applied state a class with a semantic name counts as converted.
const semanticNames = new Set(
    [...read('src/theme/tokens/semantic/colors.css').matchAll(/@utility ([a-z0-9-]+) \{/g)].map((m) => m[1]),
);
const SEMANTIC_RE =
    /(?<=^|[\s'"`{(,])(?:(?:[A-Za-z0-9_@*&>.%#=+/-]|\[[^\]\s'"`]*\])+:)*!?([a-z0-9-]+)!?(?=$|[\s'"`},)])/g;
const scan = (file, checkLoose = true, skipSemantic = false) => {
    const found = [];
    read(file)
        .split('\n')
        .forEach((text, index) => {
            const strict = [...text.matchAll(CLASS_RE)].filter((m) => !(skipSemantic && semanticNames.has(m[3])));
            const semantic = skipSemantic ? [...text.matchAll(SEMANTIC_RE)].filter((m) => semanticNames.has(m[1])) : [];
            for (const m of strict) {
                found.push({ line: index + 1, old: m[0], variant: m[1], important: m[2] + m[4], util: m[3] });
            }
            // Every loose hit must be part of a strict hit, or be a CSS variable reference (listed separately).
            for (const m of checkLoose ? text.matchAll(LOOSE_RE) : []) {
                const inside = [...strict, ...semantic].some(
                    (s) => m.index >= s.index && m.index < s.index + s[0].length,
                );
                if (
                    !inside &&
                    !/var\(--color-/.test(text.slice(Math.max(0, m.index - 12), m.index + m[0].length)) &&
                    !/\.\.?\//.test(m[0])
                ) {
                    fail(`${file}:${index + 1}: unrecognised colour-like text "${m[0]}" (extend the extractor)`);
                }
            }
        });
    return found;
};

// 1. Coverage
const inScope = sources.filter((f) => !isAux(f) && !isButton(f));
const mapFiles = map.files ?? {};
let occurrenceCount = 0;
const occurrencesByFile = new Map();
for (const file of inScope) {
    const found = scan(file, true, applied);
    occurrencesByFile.set(file, found);
    occurrenceCount += found.length;
    const allEntries = mapFiles[file] ?? [];
    // Applied: only the unconverted entries are still primitive classes in the source.
    const entries = applied ? allEntries.filter((e) => e.new == null) : allEntries;
    if (applied && mapFiles[file] != null) {
        checkApplied(file, allEntries);
        if (!sameClasses(found, entries)) {
            fail(
                `${file}: applied map leaves [${entries.map((e) => e.old).join(', ')}], source has [${found.map((o) => o.old).join(', ')}]`,
            );
        }
        continue;
    }
    if (found.length === 0 && entries.length > 0) {
        fail(`${file}: has map entries but no primitive colour classes`);
    }
    if (found.length > 0 && mapFiles[file] == null) {
        fail(`${file}: ${found.length} primitive colour classes but no map entries`);
        continue;
    }
    const max = Math.max(found.length, entries.length);
    for (let i = 0; i < max; i++) {
        const o = found[i];
        const e = entries[i];
        if (o == null || e == null || o.line !== e.line || o.old !== e.old) {
            fail(
                `${file}: occurrence #${i + 1} is ${o ? `${o.line} ${o.old}` : 'missing'} in source but ${e ? `${e.line} ${e.old}` : 'missing'} in map`,
            );
            break;
        }
    }
}
for (const file of Object.keys(mapFiles)) {
    if (!inScope.includes(file)) {
        fail(`${file}: in the map but out of scope (Button, story, test or not a component source)`);
    }
}
for (const [section, pick] of [
    ['storiesToUpdate', (f) => isAux(f) && !/\.(test|spec)\./.test(f)],
    ['testsToUpdate', (f) => /\.(test|spec)\./.test(f)],
]) {
    const listed = map[section] ?? {};
    for (const file of sources.filter(pick)) {
        // Stories carry non-class colour names (Storybook background names, CSS comments): strict pattern only.
        // Applied: the test assertions were updated to their `new` class; stories are not updated by the apply step.
        if (applied && section === 'testsToUpdate') {
            const entries = listed[file] ?? [];
            checkApplied(file, entries);
            if (
                !sameClasses(
                    scan(file, false),
                    entries.filter((e) => e.new == null),
                )
            ) {
                fail(`${section}: ${file} still asserts a converted primitive class, or an unlisted one`);
            }
            continue;
        }
        const found = scan(file, false).map((o) => `${o.line} ${o.old}`);
        const have = (listed[file] ?? []).map((o) => `${o.line} ${o.old}`);
        if (found.join('|') !== have.join('|')) {
            fail(`${section}: ${file} lists ${have.length} classes, source has ${found.length}`);
        }
    }
    for (const file of Object.keys(listed)) {
        if (!sources.filter(pick).includes(file)) {
            fail(`${section}: ${file} is not a ${section} source`);
        }
    }
}

// ---------------------------------------------------------------------------------------------------------------
// Colour resolution
// ---------------------------------------------------------------------------------------------------------------

const primitiveColours = new Map(
    [...read('src/theme/tokens/primitives/colors.css').matchAll(/--color-([a-z]+-\d+):\s*(#[0-9a-f]{6});/g)].map(
        (m) => [m[1], m[2]],
    ),
);
const hexToRgba = (hex, alpha = 1) => {
    const n = Number.parseInt(hex.slice(1, 7), 16);
    const a = hex.length === 9 ? Number.parseInt(hex.slice(7, 9), 16) / 255 : 1;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, Math.round(a * alpha * 1000) / 1000];
};
const colourKey = (rgba) => `rgba(${rgba.join(', ')})`;

const semanticCss = read('src/theme/tokens/semantic/colors.css');
const rootBlock = semanticCss.match(/:root\s*\{([\s\S]*?)\n\s*\}/)[1];
const rootVars = new Map();
const rootComments = new Map();
{
    let comment = null;
    for (const m of rootBlock.matchAll(/\/\*\s*([\s\S]*?)\s*\*\/|(--[a-z0-9-]+):\s*([^;]+);/g)) {
        if (m[1] != null) {
            comment = m[1].replace(/\s+/g, ' ');
            continue;
        }
        rootVars.set(m[2], m[3].replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').trim());
        rootComments.set(m[2], comment);
        comment = null;
    }
}
// Resolves a CSS colour expression in the default theme to [r, g, b, a].
const resolveColour = (expr, depth = 0) => {
    const value = expr.trim();
    if (depth > 10) {
        throw new Error(`alias loop at ${value}`);
    }
    let m = value.match(/^var\(--color-([a-z]+-\d+)\)$/);
    if (m) {
        if (!primitiveColours.has(m[1])) {
            throw new Error(`unknown primitive ${m[1]}`);
        }
        return hexToRgba(primitiveColours.get(m[1]));
    }
    m = value.match(/^var\((--guk-[a-z0-9-]+)\)$/);
    if (m) {
        if (!rootVars.has(m[1])) {
            throw new Error(`unknown variable ${m[1]}`);
        }
        return resolveColour(rootVars.get(m[1]), depth + 1);
    }
    // color-mix with transparent keeps the colour and scales its alpha, whatever the interpolation space.
    m = value.match(/^color-mix\(in [a-z]+,\s*(.+?)\s+(\d+(?:\.\d+)?)%,\s*transparent\)$/);
    if (m) {
        const [r, g, b, a] = resolveColour(m[1], depth + 1);
        return [r, g, b, Math.round(a * Number(m[2]) * 10) / 1000];
    }
    m = value.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/);
    if (m) {
        return [Number(m[1]), Number(m[2]), Number(m[3]), Math.round(Number(m[4]) * 1000) / 1000];
    }
    if (/^#[0-9a-f]{6}([0-9a-f]{2})?$/.test(value)) {
        return hexToRgba(value);
    }
    throw new Error(`cannot resolve colour "${value}"`);
};

// Shadow values: list of "geometry colour" layers -> normalised string.
const shadowLayers = (value) =>
    value
        .split(/,(?![^(]*\))/)
        .map((layer) => layer.trim())
        .map((layer) => {
            const m = layer.match(/^((?:-?\d+(?:px)?\s+){3}-?\d+(?:px)?)\s+(.+)$/);
            if (m == null) {
                throw new Error(`cannot parse shadow layer "${layer}"`);
            }
            const geometry = m[1].replace(/\s+/g, ' ');
            return `${geometry} ${colourKey(resolveColour(m[2]))}`;
        })
        .join(', ');

const primitiveShadows = new Map(
    [...read('src/theme/tokens/primitives/shadows.css').matchAll(/--shadow-([a-z0-9-]+):\s*([^;]+);/g)].map((m) => [
        m[1],
        m[2].replace(/\s+/g, ' ').trim(),
    ]),
);
const ringColours = new Map(
    [...read('src/theme/tokens/primitives/focusRing.css').matchAll(/--ring-color-([a-z]+):\s*([^;]+);/g)].map((m) => [
        m[1],
        m[2].trim(),
    ]),
);

// Old primitive utility -> { property: value }, or null when the utility has no modelled value.
const PROPERTY = { bg: 'background-color', text: 'color', border: 'border-color' };
const resolveOld = (util) => {
    let m = util.match(/^(bg|text|border)-([a-z]+-\d+)(?:\/(\d+))?$/);
    if (m) {
        const hex = primitiveColours.get(m[2]);
        if (hex == null) {
            throw new Error(`unknown primitive colour ${m[2]}`);
        }
        const alpha = m[3] == null ? 1 : Number(m[3]) / 100;
        return { [PROPERTY[m[1]]]: colourKey(hexToRgba(hex, alpha)) };
    }
    m = util.match(/^shadow-([a-z]+)(?:-(sm|md|lg|xl|2xl))?$/);
    if (m) {
        const name = m[2] ? `${m[1]}-${m[2]}` : m[1];
        if (!primitiveShadows.has(name)) {
            throw new Error(`unknown primitive shadow ${name}`);
        }
        return { 'box-shadow': shadowLayers(primitiveShadows.get(name)) };
    }
    m = util.match(/^focus-ring-([a-z]+)$/);
    if (m) {
        if (!ringColours.has(m[1])) {
            throw new Error(`unknown focus ring ${m[1]}`);
        }
        return { 'focus-ring': 'on', 'ring-color': colourKey(resolveColour(ringColours.get(m[1]))) };
    }
    return null;
};

// Semantic utilities from the generated CSS.
const utilities = new Map();
for (const m of semanticCss.matchAll(/@utility ([a-z0-9-]+) \{\s*([^}]*?)\s*\}/g)) {
    utilities.set(m[1], m[2].trim());
}
const tokenOfUtility = (name) => {
    const m = name.match(/^(bg|text|border|icon|shadow|ring|gradient)-([a-z]+)-(.+)$/);
    return m ? `${m[1]}/${m[2]}/${m[3]}` : null;
};
const resolveNew = (cls) => {
    if (cls === 'focus-ring') {
        return { 'focus-ring': 'on' };
    }
    const body = utilities.get(cls);
    if (body == null) {
        throw new Error(`no semantic utility ${cls}`);
    }
    let m = body.match(/^(background-color|color|border-color):\s*(var\(--guk-[a-z0-9-]+\));$/);
    if (m) {
        return { [m[1]]: colourKey(resolveColour(m[2])) };
    }
    m = body.match(/^@apply ring-\(color:(--guk-[a-z0-9-]+)\);$/);
    if (m) {
        return { 'ring-color': colourKey(resolveColour(`var(${m[1]})`)) };
    }
    m = body.match(/^@apply shadow-\[(.+)\];$/);
    if (m) {
        return { 'box-shadow': shadowLayers(m[1].replaceAll('_', ' ')) };
    }
    throw new Error(`cannot model utility ${cls}: ${body}`);
};

// ---------------------------------------------------------------------------------------------------------------
// 2-4. Entries
// ---------------------------------------------------------------------------------------------------------------

const tokensUsed = new Map(); // token -> count
const splitClass = (cls) => {
    const m = cls.match(/^((?:(?:[^\s:[\]]|\[[^\]]*\])+:)*)(!?)(.+?)(!?)$/);
    return { variant: m[1], important: m[2] + m[4], util: m[3] };
};
for (const [file, entries] of Object.entries(mapFiles)) {
    for (const e of entries) {
        const where = `${file}:${e.line} ${e.old}`;
        if (typeof e.part !== 'string' || e.part === '' || typeof e.reason !== 'string' || e.reason === '') {
            fail(`${where}: part and reason are required`);
        }
        const old = splitClass(e.old);
        let oldValue;
        try {
            oldValue = resolveOld(old.util);
        } catch (error) {
            fail(`${where}: ${error.message}`);
            continue;
        }
        if (e.new == null) {
            const code = e.reason.split(':')[0];
            if (!REASONS.has(code)) {
                fail(`${where}: unconverted entry needs a reason starting with one of ${[...REASONS].join(', ')}`);
            }
            if (code === 'conflict' || code === 'forbidden-token') {
                const name = e.token;
                const cls = name?.replaceAll('/', '-');
                if (name == null || !utilities.has(cls)) {
                    fail(`${where}: ${code} must name an existing token in "token"`);
                    continue;
                }
                if (code === 'forbidden-token' && !FORBIDDEN.has(name)) {
                    fail(`${where}: ${name} is not a forbidden token`);
                }
                if (code === 'conflict') {
                    if (FORBIDDEN.has(name)) {
                        fail(`${where}: conflict names forbidden token ${name}`);
                    }
                    let tokenValue = {};
                    try {
                        tokenValue = resolveNew(cls);
                    } catch (error) {
                        fail(`${where}: ${error.message}`);
                    }
                    const same =
                        oldValue != null &&
                        Object.keys(tokenValue).every((p) => oldValue[p] === tokenValue[p]) &&
                        Object.keys(oldValue).length === Object.keys(tokenValue).length;
                    if (same) {
                        fail(`${where}: listed as a conflict on ${name}, but the token already has this value`);
                    }
                    const declared = e.reason.match(/default value `[^`]+`/);
                    if (declared == null) {
                        fail(`${where}: conflict reason must state the token's default value`);
                    }
                }
            }
            continue;
        }
        if (oldValue == null) {
            fail(`${where}: converted, but this primitive has no modelled value (should be no-utility)`);
            continue;
        }
        const merged = {};
        for (const cls of e.new.split(' ')) {
            const parts = splitClass(cls);
            if (parts.variant !== old.variant || parts.important !== old.important) {
                fail(`${where}: "${cls}" does not keep the variant prefix "${old.variant}${old.important}"`);
            }
            if (parts.util !== 'focus-ring') {
                const token = tokenOfUtility(parts.util);
                if (token == null) {
                    fail(`${where}: "${cls}" is not a semantic token class`);
                    continue;
                }
                if (FORBIDDEN.has(token)) {
                    fail(`${where}: uses forbidden token ${token}`);
                }
                tokensUsed.set(token, (tokensUsed.get(token) ?? 0) + 1);
            }
            let value;
            try {
                value = resolveNew(parts.util);
            } catch (error) {
                fail(`${where}: ${error.message}`);
                continue;
            }
            for (const [p, v] of Object.entries(value)) {
                if (merged[p] != null) {
                    fail(`${where}: property ${p} set twice by the replacement`);
                }
                merged[p] = v;
            }
        }
        const props = new Set([...Object.keys(oldValue), ...Object.keys(merged)]);
        for (const p of props) {
            if (oldValue[p] !== merged[p]) {
                fail(`${where}: ${p} is ${oldValue[p] ?? 'unset'} today but ${merged[p] ?? 'unset'} after "${e.new}"`);
            }
        }
    }
}

// Every token used must have a value verified from code (or be an alias of one).
for (const token of tokensUsed.keys()) {
    const variable = `--guk-${token.replaceAll('/', '-')}`;
    const comment = rootComments.get(variable) ?? '';
    if (!/^verified from code$|^alias of /.test(comment)) {
        fail(`${token}: used by the map but its default value is "${comment}", not verified from code`);
    }
}
const listed = map.tokensUsed ?? {};
if (Object.keys(listed).sort().join('|') !== [...tokensUsed.keys()].sort().join('|')) {
    fail('tokensUsed does not list exactly the tokens the entries use');
}

// Generated CSS must match the data files.
try {
    execFileSync(process.execPath, [resolve(kitRoot, 'scripts/generate-semantic-tokens.mjs'), '--check'], {
        stdio: 'pipe',
    });
} catch (error) {
    fail(`generated semantic CSS is stale: ${String(error.stderr).trim()}`);
}

// ---------------------------------------------------------------------------------------------------------------
// 5. Ordering
// ---------------------------------------------------------------------------------------------------------------

// Tailwind sorts utilities of one variant and property by candidate name, comparing digit runs numerically.
const naturalCompare = (a, b) => {
    const ca = a.match(/\d+|\D+/g);
    const cb = b.match(/\d+|\D+/g);
    for (let i = 0; i < Math.min(ca.length, cb.length); i++) {
        const na = /^\d/.test(ca[i]);
        const nb = /^\d/.test(cb[i]);
        if (na && nb && Number(ca[i]) !== Number(cb[i])) {
            return Number(ca[i]) - Number(cb[i]);
        }
        if (ca[i] !== cb[i]) {
            return ca[i] < cb[i] ? -1 : 1;
        }
    }
    return ca.length - cb.length;
};
const sign = (n) => Math.sign(n);
// The property slots a class writes, keyed by variant, with today's/new name and colour.
const slots = (entry) => {
    const old = splitClass(entry.old);
    let oldValue;
    try {
        oldValue = resolveOld(old.util) ?? { [`unmodelled:${old.util.replace(/-.*/, '')}`]: entry.old };
    } catch {
        return [];
    }
    const newClasses = entry.new == null ? [entry.old] : entry.new.split(' ');
    return Object.entries(oldValue)
        .filter(([p]) => p !== 'focus-ring')
        .map(([p, v]) => {
            const replacement = newClasses.find((c) => {
                const u = splitClass(c).util;
                if (entry.new == null) {
                    return true;
                }
                try {
                    return u !== 'focus-ring' && Object.hasOwn(resolveNew(u), p);
                } catch {
                    return false;
                }
            });
            // A replacement that does not write the property already failed the parity check; compare by its first class.
            const newName = splitClass(replacement ?? newClasses[0]).util;
            return { key: `${old.variant}${old.important}|${p}`, oldName: old.util, newName, value: v };
        });
};
const reviewed = new Set((map.orderingReviewed ?? []).map((r) => `${r.file}|${[r.a, r.b].sort().join('|')}`));
// Coexistence: for every class occurrence, the elements it can reach and the exclusive choices on its way there.
const coexistence = (file) => {
    const text = read(file);
    const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const lineStarts = sf.getLineStarts();
    const isClassNamesCall = (n) =>
        ts.isCallExpression(n) && ts.isIdentifier(n.expression) && /^class[nN]ames$/.test(n.expression.text);
    // Anchor of a node: the className attribute, `class:` property or const declaration that holds it, and the
    // exclusive choices (ternary branch, lookup-map key) taken on the way up.
    const anchorOf = (node) => {
        const choices = [];
        let n = node;
        while (n.parent != null) {
            const p = n.parent;
            if (ts.isConditionalExpression(p) && n !== p.condition) {
                choices.push(`cond@${p.pos}:${n === p.whenTrue ? 'T' : 'F'}`);
            }
            if (ts.isPropertyAssignment(p) && n === p.initializer && ts.isObjectLiteralExpression(p.parent)) {
                const obj = p.parent;
                const inClassNames = isClassNamesCall(obj.parent) || ts.isArrayLiteralExpression(obj.parent);
                if (!inClassNames && !(ts.isIdentifier(p.name) && p.name.text === 'class')) {
                    choices.push(`map@${obj.pos}:${p.name.getText(sf)}`);
                }
            }
            if (ts.isJsxAttribute(p) && /^(className|class)$/.test(p.name.getText(sf))) {
                return { anchor: `jsx@${p.pos}`, choices };
            }
            if (
                ts.isPropertyAssignment(p) &&
                ts.isIdentifier(p.name) &&
                /^(className|class|textColor)$/.test(p.name.text)
            ) {
                return { anchor: `prop@${p.pos}`, choices };
            }
            if (ts.isVariableDeclaration(p) && ts.isIdentifier(p.name)) {
                return { anchor: `var:${p.name.text}`, choices };
            }
            n = p;
        }
        return { anchor: `file@${node.pos}`, choices };
    };
    // Variables referenced by each anchor (identifiers whose name is a const declared in the file).
    const declared = new Set();
    const visitDecl = (n) => {
        if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name)) {
            declared.add(n.name.text);
        }
        ts.forEachChild(n, visitDecl);
    };
    visitDecl(sf);
    const refs = new Map(); // anchor -> Set(var anchors)
    const visitRefs = (n) => {
        if (
            ts.isIdentifier(n) &&
            declared.has(n.text) &&
            !(ts.isVariableDeclaration(n.parent) && n.parent.name === n)
        ) {
            const { anchor } = anchorOf(n);
            const target = `var:${n.text}`;
            if (anchor !== target) {
                refs.set(anchor, new Set([...(refs.get(anchor) ?? []), target]));
            }
        }
        ts.forEachChild(n, visitRefs);
    };
    visitRefs(sf);
    // Terminal anchors (not referenced by another anchor) collect the closure of what they reference.
    const referenced = new Set([...refs.values()].flatMap((x) => [...x]));
    const closure = (anchor, seen = new Set()) => {
        if (seen.has(anchor)) {
            return seen;
        }
        seen.add(anchor);
        for (const r of refs.get(anchor) ?? []) {
            closure(r, seen);
        }
        return seen;
    };
    const anchorsWithClasses = new Set();
    const findNode = (pos) => {
        let found = null;
        const visit = (n) => {
            if (pos >= n.getStart(sf) && pos < n.getEnd()) {
                found = n;
                ts.forEachChild(n, visit);
            }
        };
        visit(sf);
        return found;
    };
    return {
        locate: (line, old, nth) => {
            const lineText = text.slice(lineStarts[line - 1], lineStarts[line] ?? text.length);
            let index = -1;
            for (let k = 0; k <= nth; k++) {
                index = lineText.indexOf(old, index + 1);
            }
            const node = findNode(lineStarts[line - 1] + index);
            const result = anchorOf(node);
            anchorsWithClasses.add(result.anchor);
            return result;
        },
        // Element groups (terminal anchors) each occurrence anchor belongs to.
        groupsOf: (anchor) => {
            const groups = [];
            for (const a of new Set([...refs.keys(), ...anchorsWithClasses])) {
                if (!referenced.has(a) && closure(a).has(anchor)) {
                    groups.push(a);
                }
            }
            return groups.length > 0 ? groups : [anchor];
        },
    };
};
const compatible = (a, b) => {
    for (const ca of a) {
        const [point, branch] = ca.split(/:(?=[^:]*$)/);
        for (const cb of b) {
            const [pointB, branchB] = cb.split(/:(?=[^:]*$)/);
            if (point === pointB && branch !== branchB) {
                return false;
            }
        }
    }
    return true;
};
const hazards = [];
for (const [file, entries] of Object.entries(applied ? {} : mapFiles)) {
    if (!/\.tsx?$/.test(file)) {
        continue;
    }
    const co = coexistence(file);
    const seenOnLine = new Map();
    const located = entries.map((e) => {
        const key = `${e.line}|${e.old}`;
        const nth = seenOnLine.get(key) ?? 0;
        seenOnLine.set(key, nth + 1);
        const { anchor, choices } = co.locate(e.line, e.old, nth);
        return { e, anchor, choices };
    });
    const all = located.flatMap((l) =>
        slots(l.e).map((s) => ({ ...s, entry: l.e, groups: co.groupsOf(l.anchor), choices: l.choices })),
    );
    for (let i = 0; i < all.length; i++) {
        for (let j = i + 1; j < all.length; j++) {
            const a = all[i];
            const b = all[j];
            if (a.key !== b.key || a.oldName === b.oldName || a.value === b.value) {
                continue;
            }
            if (!a.groups.some((g) => b.groups.includes(g)) || !compatible(a.choices, b.choices)) {
                continue;
            }
            const before = sign(naturalCompare(a.oldName, b.oldName));
            const after = a.newName === b.newName ? 0 : sign(naturalCompare(a.newName, b.newName));
            if (before !== after) {
                const id = `${file}|${[a.entry.old, b.entry.old].sort().join('|')}`;
                if (!reviewed.has(id)) {
                    hazards.push(
                        `${file}: "${a.entry.old}" (line ${a.entry.line}) vs "${b.entry.old}" (line ${b.entry.line})`,
                    );
                }
            }
        }
    }
}
for (const h of hazards) {
    fail(`ordering may change (same variant and property, winner flips): ${h}; list it in orderingReviewed`);
}
const findEntry = ({ file, line, old }) => (mapFiles[file] ?? []).find((e) => e.line === line && e.old === old);
for (const o of map.crossComponentOverrides ?? []) {
    if (o.check === false) {
        continue;
    }
    const consumer = findEntry(o.consumer);
    const target = findEntry(o.target);
    if (consumer == null || target == null) {
        fail(
            `crossComponentOverrides: entry not found for ${JSON.stringify(o.consumer)} / ${JSON.stringify(o.target)}`,
        );
        continue;
    }
    const [c] = slots(consumer);
    const [t] = slots(target);
    if (c == null || t == null || c.key !== t.key) {
        fail(
            `crossComponentOverrides: ${o.consumer.old} and ${o.target.old} do not write the same variant and property`,
        );
        continue;
    }
    const winner = (x, y, name) => (naturalCompare(name(x), name(y)) >= 0 ? x : y);
    const beforeWinner = winner(c, t, (s) => s.oldName);
    const afterWinner = winner(c, t, (s) => s.newName);
    if (beforeWinner.value !== afterWinner.value) {
        fail(
            `crossComponentOverrides: ${o.consumer.file}:${o.consumer.line} ${o.consumer.old} over ${o.target.file}:${o.target.line} ${o.target.old}: the visible colour changes`,
        );
    }
}

// ---------------------------------------------------------------------------------------------------------------
// 6. Summary and batches
// ---------------------------------------------------------------------------------------------------------------

const entries = Object.values(mapFiles).flat();
const unconvertedByReason = {};
for (const e of entries.filter((x) => x.new == null)) {
    const code = e.reason.split(':')[0];
    unconvertedByReason[code] = (unconvertedByReason[code] ?? 0) + 1;
}
const computed = {
    files: Object.keys(mapFiles).length,
    occurrences: entries.length,
    converted: entries.filter((e) => e.new != null).length,
    unconverted: entries.filter((e) => e.new == null).length,
};
for (const [k, v] of Object.entries(computed)) {
    if (map.summary?.[k] !== v) {
        fail(`summary.${k} is ${map.summary?.[k]}, entries give ${v}`);
    }
}
if (JSON.stringify(map.summary?.unconvertedByReason) !== JSON.stringify(unconvertedByReason)) {
    fail(`summary.unconvertedByReason does not match the entries: ${JSON.stringify(unconvertedByReason)}`);
}
const expectedInSources = applied ? computed.unconverted : computed.occurrences;
if (expectedInSources !== occurrenceCount) {
    fail(`map expects ${expectedInSources} primitive classes in the sources, they have ${occurrenceCount}`);
}
const conflictCount = (map.conflicts ?? []).length;
if (conflictCount !== (unconvertedByReason.conflict ?? 0)) {
    fail(`conflicts lists ${conflictCount}, entries have ${unconvertedByReason.conflict ?? 0}`);
}
const batched = (map.batches ?? []).flatMap((b) => b.files);
if (batched.length !== new Set(batched).size) {
    fail('a file appears in two batches');
}
const mapped = Object.keys(mapFiles);
if (batched.slice().sort().join('|') !== mapped.slice().sort().join('|')) {
    fail('batches do not cover exactly the files of the map');
}
if ((map.batches ?? []).length < 4 || (map.batches ?? []).length > 6) {
    fail('expected 4 to 6 batches');
}

// ---------------------------------------------------------------------------------------------------------------

const rel = relative(process.cwd(), resolve(kitRoot, 'design-system/tokens/semantic-colors.component-map.json'));
if (errors.length > 0) {
    console.error(`validate-semantic-component-map: ${errors.length} problem(s) in ${rel}`);
    for (const e of errors) {
        console.error(`  - ${e}`);
    }
    process.exit(1);
}
console.log(
    `validate-semantic-component-map: ok (${applied ? `applied on ${map.applied.base}` : 'not applied yet'}) — ${computed.files} files, ${computed.occurrences} occurrences ` +
        `(${computed.converted} converted, ${computed.unconverted} unconverted: ${Object.entries(unconvertedByReason)
            .map(([k, v]) => `${k} ${v}`)
            .join(', ')}), ${tokensUsed.size} tokens, every converted value equal in the default theme, ` +
        `${(map.orderingReviewed ?? []).length} reviewed ordering pairs, ${(map.crossComponentOverrides ?? []).length} cross-component overrides, ` +
        `${(map.batches ?? []).length} batches`,
);
