#!/usr/bin/env node
// Proves that design-system/semantic-colors.app-map.json is safe to apply, without applying it. The app's counterpart
// of packages/gov-ui-kit/scripts/validate-semantic-component-map.mjs (same extraction and line editing, shared in
// packages/gov-ui-kit/scripts/lib/semantic-class-scan.mjs), with every value taken from a real Tailwind compile of the
// stylesheet entry that renders the file (apps/app: layoutRoot.css, also for packages/assistant-chat; apps/docs:
// globals.css) instead of from the token sources:
//
// 1. Coverage: every primitive colour class in the production sources of apps/app/src, packages/assistant-chat/src
//    and apps/docs/src (ts, tsx and CSS @apply; tests and stories excluded) appears exactly once, in source order, and
//    the map lists nothing else. Anything else that looks like a palette colour fails ("extend the extractor").
//    Tests and stories that name colour classes are listed completely in their own sections; colour literals (hex,
//    `var(--color-…)`, `var(--shadow-<palette>…)`) are listed completely in `nonClassReferences`.
// 2. Values: for every converted entry, the old class and its replacement compile to the same rules: the same
//    contexts (variant wrappers and selector, with the class replaced by `&`), the same properties, the same
//    !important and the same values once every var() is resolved through the default theme (`:root`). This covers
//    opacity modifiers (color-mix keeps its interpolation space), shadows, rings, gradients, carets and single sides.
//    One modelled equivalence: `focus-ring-<colour>` sets the ring colour only under :focus-visible, while
//    `focus-ring ring-<group>-focus` sets it on the element; the ring itself exists only under :focus-visible.
// 2b. An entry may add the important modifier (`protect: "important"`, P-38) where step 5 proves that keeps the winner.
// 3. Unconverted entries carry a known reason; a `conflict` names an existing token (in `token`) whose compiled
//    default value really differs from the class (otherwise it should have been converted).
// 4. Ordering, same file: Tailwind orders utilities by its own sort, so renaming can change which of two classes on
//    one element wins. For every converted entry, every other class token that can sit on the same element (classes
//    reach an element through className attributes and the const variables / lookup maps they reference; ternary
//    branches and lookup-map keys exclude each other) and writes the same property is compared: the winner (by
//    !important, specificity, then position in the compiled CSS) must keep its value. Listed exceptions:
//    `orderingReviewed`.
// 5. Ordering across components: every JSX attribute ending in `className` on a component declared in another file
//    (a kit component, resolved to its source in packages/gov-ui-kit/src, or an app component) passes classes that
//    meet the classes of that component's own file (and of the kit components it imports, two levels). For every
//    passed or own class the map converts, the winner of each same-property pair must keep its value.
// 6. Summary counts, tokens used, alias-token candidates and the leftover batches match the entries.
//
// Once apply-app-map.mjs has run, the map carries `applied` and its line numbers describe the sources of that commit
// (Biome then re-sorted and re-wrapped edited lines). Step 1 then checks per file that the primitive classes left are
// exactly the unconverted entries and every converted `new` class is present; steps 4 and 5 ran on the sources they
// were proven against and are skipped (the override audit and the screenshot comparison cover the applied state);
// steps 2, 3 and 6 only read the map and the compile and run unchanged.
//
// Usage: node scripts/semanticColors/validate-app-map.mjs [--map <path>]   (exit 1 on any failure)

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    anyClassRe,
    classRe,
    coexistence,
    compatible,
    countClass,
    looseRe,
    splitClass,
} from '../../../../packages/gov-ui-kit/scripts/lib/semantic-class-scan.mjs';
import { createCompiler } from './compileColours.mjs';

const repoRoot = resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../../../..',
);
const argMap = process.argv.indexOf('--map');
const mapPath = resolve(
    argMap > 0
        ? process.argv[argMap + 1]
        : resolve(
              repoRoot,
              'apps/app/design-system/semantic-colors.app-map.json',
          ),
);
const read = (p) => readFileSync(resolve(repoRoot, p), 'utf8');
const map = JSON.parse(readFileSync(mapPath, 'utf8'));
const ts = createRequire(resolve(repoRoot, 'apps/app/package.json'))(
    'typescript',
);

const errors = [];
const fail = (message) => errors.push(message);
const applied = map.applied != null;
const REASONS = new Set([
    'conflict',
    'no-utility',
    'no-token',
    'no-css',
    'brand',
    'ordering',
]);

// ---------------------------------------------------------------------------------------------------------------
// 1. Scope and extraction
// ---------------------------------------------------------------------------------------------------------------

const SCOPES = [
    { root: 'apps/app/src', stylesheet: 'app' },
    { root: 'packages/assistant-chat/src', stylesheet: 'app' },
    { root: 'apps/docs/src', stylesheet: 'docs' },
];
const stylesheetOf = (file) =>
    SCOPES.find((s) => file.startsWith(`${s.root}/`)).stylesheet;
const walk = (dir) =>
    readdirSync(resolve(repoRoot, dir)).flatMap((name) => {
        const path = join(dir, name);
        if (name === 'node_modules') {
            return [];
        }
        return statSync(resolve(repoRoot, path)).isDirectory()
            ? walk(path)
            : [path];
    });
const sources = SCOPES.flatMap((s) => walk(s.root))
    .filter((f) => /\.(tsx?|css)$/.test(f) && !/\.d\.ts$/.test(f))
    .sort();
const isTest = (f) =>
    /\.(test|spec)\.tsx?$/.test(f) || /\/(__mocks__|testUtils)\//.test(f);
const isStory = (f) => /\.stories\.tsx?$/.test(f);
const inScope = sources.filter((f) => !isTest(f) && !isStory(f));

const kitCss = readFileSync(
    resolve(
        repoRoot,
        'packages/gov-ui-kit/src/theme/tokens/semantic/colors.css',
    ),
    'utf8',
);
const semanticNames = new Set(
    [...kitCss.matchAll(/@utility ([a-z0-9-]+(?:\\\/\d+)?) \{/g)].map((m) =>
        m[1].replace('\\/', '/'),
    ),
);
const CLASS_RE = classRe();
const LOOSE_RE = looseRe();
const SEMANTIC_RE = anyClassRe();
// Lines (1-based) of a CSS file that sit inside a /* comment */.
const cssCommentLines = (text) => {
    const lines = new Set();
    for (const m of text.matchAll(/\/\*[\s\S]*?\*\//g)) {
        const first = text.slice(0, m.index).split('\n').length;
        const last = first + m[0].split('\n').length - 1;
        for (let l = first; l <= last; l++) {
            lines.add(l);
        }
    }
    return lines;
};
// Colour literals: hex in ts/tsx strings and classes (comments excluded), CSS colour variables in any file.
const HEX_RE =
    /(?<![\w&#-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g;
const VAR_RE =
    /var\(--(?:color|shadow)-[a-z0-9-]+\)|--color-[a-z]+-\d+(?=\s*[:;)])/g;
const isCommentLine = (t) => /^\s*(\*|\/\/|\/\*)/.test(t);
const scan = (file, { loose = true, skipSemantic = true } = {}) => {
    const found = [];
    const literals = [];
    const text = read(file);
    const comments = file.endsWith('.css') ? cssCommentLines(text) : new Set();
    text.split('\n').forEach((line, index) => {
        const n = index + 1;
        if (comments.has(n)) {
            return;
        }
        const strict = [...line.matchAll(CLASS_RE)].filter(
            (m) => !(skipSemantic && semanticNames.has(m[3])),
        );
        const semantic = [...line.matchAll(SEMANTIC_RE)].filter((m) =>
            semanticNames.has(m[1]),
        );
        for (const m of strict) {
            found.push({ line: n, old: m[0] });
        }
        const vars = [...line.matchAll(VAR_RE)];
        for (const m of vars) {
            literals.push({ line: n, value: m[0] });
        }
        if (!file.endsWith('.css') && !isCommentLine(line)) {
            for (const m of line.matchAll(HEX_RE)) {
                literals.push({ line: n, value: m[0] });
            }
        }
        for (const m of loose ? line.matchAll(LOOSE_RE) : []) {
            const inside = [...strict, ...semantic, ...vars].some(
                (s) => m.index >= s.index && m.index < s.index + s[0].length,
            );
            if (!inside && !/\.\.?\//.test(m[0]) && !isCommentLine(line)) {
                fail(
                    `${file}:${n}: unrecognised colour-like text "${m[0]}" (extend the extractor)`,
                );
            }
        }
    });
    return { found, literals };
};
const sameMultiset = (a, b) =>
    a.slice().sort().join('|') === b.slice().sort().join('|');

const mapFiles = map.files ?? {};
let occurrenceCount = 0;
const literalsByFile = new Map();
for (const file of inScope) {
    const { found, literals } = scan(file);
    if (literals.length > 0) {
        literalsByFile.set(file, literals);
    }
    occurrenceCount += found.length;
    const all = mapFiles[file] ?? [];
    if (applied) {
        if (mapFiles[file] == null) {
            if (found.length > 0) {
                fail(
                    `${file}: ${found.length} primitive colour classes but no map entries`,
                );
            }
            continue;
        }
        const text = read(file);
        const expected = new Map();
        for (const e of all.filter((x) => x.new != null)) {
            for (const cls of e.new.split(' ')) {
                expected.set(cls, (expected.get(cls) ?? 0) + 1);
            }
        }
        for (const [cls, count] of expected) {
            const have = countClass(text, cls);
            if (have < count) {
                fail(
                    `${file}: applied map expects ${count} × "${cls}", found ${have}`,
                );
            }
        }
        const left = all.filter((e) => e.new == null).map((e) => e.old);
        if (
            !sameMultiset(
                found.map((o) => o.old),
                left,
            )
        ) {
            fail(
                `${file}: applied map leaves [${left.join(', ')}], source has [${found.map((o) => o.old).join(', ')}]`,
            );
        }
        continue;
    }
    if (found.length === 0 && all.length > 0) {
        fail(`${file}: has map entries but no primitive colour classes`);
    }
    if (found.length > 0 && mapFiles[file] == null) {
        fail(
            `${file}: ${found.length} primitive colour classes but no map entries`,
        );
        continue;
    }
    for (let i = 0; i < Math.max(found.length, all.length); i++) {
        const o = found[i];
        const e = all[i];
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
        fail(
            `${file}: in the map but out of scope (test, story, or not a production source)`,
        );
    }
}
// Tests and stories: listed completely (line and class), so nothing that asserts a colour class is missed.
for (const [section, pick] of [
    ['testsAssertingColourClasses', isTest],
    ['storiesToUpdate', isStory],
]) {
    const listed = map[section] ?? {};
    for (const file of sources.filter(pick)) {
        const found = scan(file, { loose: false, skipSemantic: false }).found;
        const have = listed[file] ?? [];
        if (applied && section === 'testsAssertingColourClasses') {
            const left = have.filter((e) => e.new == null).map((e) => e.old);
            if (
                !sameMultiset(
                    found
                        .map((o) => o.old)
                        .filter((c) => !semanticNames.has(c)),
                    left,
                )
            ) {
                fail(
                    `${section}: ${file} still asserts a converted primitive class, or an unlisted one`,
                );
            }
            continue;
        }
        if (
            found.map((o) => `${o.line} ${o.old}`).join('|') !==
            have.map((o) => `${o.line} ${o.old}`).join('|')
        ) {
            fail(
                `${section}: ${file} lists ${have.length} classes, source has ${found.length}`,
            );
        }
    }
    for (const file of Object.keys(listed)) {
        if (!sources.filter(pick).includes(file)) {
            fail(`${section}: ${file} is not a ${section} source`);
        }
    }
}
// Colour literals: every one listed once with what it colours and what happened to it (`new`: the semantic variable it
// was replaced by, checked in step 2; null: kept, `outcome` says why and what it would need).
{
    const listed = new Map();
    for (const r of map.nonClassReferences ?? []) {
        if (
            typeof r.colours !== 'string' ||
            r.colours === '' ||
            typeof r.outcome !== 'string' ||
            r.outcome === ''
        ) {
            fail(
                `nonClassReferences: ${r.file}:${r.line} needs "colours" and "outcome"`,
            );
        }
        if (r.new != null && !/^var\(--guk-[a-z0-9-]+\)$/.test(r.new)) {
            fail(
                `nonClassReferences: ${r.file}:${r.line} converts to "${r.new}", not a semantic variable`,
            );
        }
        const key = `${r.file}:${r.line}`;
        listed.set(key, [...(listed.get(key) ?? []), r]);
    }
    const seen = new Set();
    for (const [file, literals] of literalsByFile) {
        const byLine = new Map();
        for (const l of literals) {
            byLine.set(l.line, [...(byLine.get(l.line) ?? []), l.value]);
        }
        if (applied) {
            // Lines may have moved: compare the file's multiset of kept literals and the converted ones present.
            const rows = (map.nonClassReferences ?? []).filter(
                (r) => r.file === file,
            );
            const kept = rows.filter((r) => r.new == null).map((r) => r.value);
            if (
                !sameMultiset(
                    literals.map((l) => l.value),
                    kept,
                )
            ) {
                fail(
                    `nonClassReferences: ${file} holds [${literals.map((l) => l.value).join(', ')}], map keeps [${kept.join(', ')}]`,
                );
            }
            seen.add(file);
            continue;
        }
        for (const [line, values] of byLine) {
            const key = `${file}:${line}`;
            seen.add(key);
            if (
                !sameMultiset(
                    values,
                    (listed.get(key) ?? []).map((r) => r.value),
                )
            ) {
                fail(
                    `nonClassReferences: ${key} has [${values.join(', ')}], map lists [${(listed.get(key) ?? []).map((r) => r.value).join(', ')}]`,
                );
            }
        }
    }
    for (const r of map.nonClassReferences ?? []) {
        if (applied) {
            if (r.new != null && countClass(read(r.file), r.new) < 1) {
                fail(`nonClassReferences: ${r.file} should hold ${r.new}`);
            }
            if (r.new == null && !seen.has(r.file)) {
                fail(
                    `nonClassReferences: ${r.file} should still hold ${r.value}`,
                );
            }
        } else if (!seen.has(`${r.file}:${r.line}`)) {
            fail(
                `nonClassReferences: ${r.file}:${r.line} is listed but holds no colour literal`,
            );
        }
    }
}

// ---------------------------------------------------------------------------------------------------------------
// 2-3. Values through a real compile
// ---------------------------------------------------------------------------------------------------------------

const entries = Object.entries(mapFiles).flatMap(([file, list]) =>
    list.map((e) => ({ ...e, file })),
);
const tokenClass = (token) => token.replaceAll('/', '-');
// Kit component classes are added to the compile in step 5; collect every class each stylesheet must emit.
const wanted = { app: new Set(), docs: new Set() };
const want = (file, classes) => {
    for (const c of classes) {
        wanted[stylesheetOf(file)].add(c);
    }
};
for (const e of entries) {
    want(e.file, [
        e.old,
        ...(e.new?.split(' ') ?? []),
        ...(e.token ? [tokenClass(e.token)] : []),
    ]);
}

// Tokens of every class literal of a file (for step 4), and the cross-component usages (step 5), before compiling.
const tsEntriesByFile = Object.entries(applied ? {} : mapFiles).filter(([f]) =>
    /\.tsx?$/.test(f),
);
const fileTokens = new Map();
for (const [file] of tsEntriesByFile) {
    const co = coexistence(ts, file, read(file));
    const tokens = co
        .classTokens()
        .filter((t) => /^[!\w[&*@-][^\s]*$/.test(t.text));
    for (const t of tokens) {
        t.groups = co.groupsOf(t.anchor);
    }
    fileTokens.set(file, tokens);
    want(
        file,
        tokens.map((t) => t.text),
    );
}
const crossUsages = applied
    ? []
    : (await import('./crossComponentUsages.mjs')).findUsages(
          ts,
          repoRoot,
          SCOPES,
      );
for (const u of crossUsages) {
    want(u.file, [...u.passed, ...u.own.map((o) => o.cls)]);
}

const compiler = createCompiler(repoRoot);
const compiled = {
    app: await compiler.compile(
        'app',
        [...wanted.app].filter((c) => !/["{}]/.test(c)),
    ),
    docs: await compiler.compile(
        'docs',
        [...wanted.docs].filter((c) => !/["{}]/.test(c)),
    ),
};
const cssOf = (file) => compiled[stylesheetOf(file)];
const declKey = (r, d) =>
    `${r.context} | ${d.prop}${d.important ? ' !important' : ''}: ${d.value}`;
const declsOf = (css, classes) =>
    classes.flatMap((c) =>
        css
            .rulesOf(c)
            .flatMap((r) => r.decls.map((d) => ({ key: declKey(r, d), r, d }))),
    );
// focus-ring-<colour> → focus-ring ring-<group>-focus: the ring colour moves from the :focus-visible rule to the
// element. Equal when the value is the same and the replacement includes focus-ring (the only consumer of the colour).
const liftRingColour = (oldDecls, newDecls, newClasses) => {
    if (!newClasses.some((c) => splitClass(c).util === 'focus-ring')) {
        return;
    }
    const oldRing = oldDecls.filter(
        (x) =>
            x.d.prop === '--tw-ring-color' &&
            /:focus-visible/.test(x.r.context),
    );
    const newRing = newDecls.filter(
        (x) => x.d.prop === '--tw-ring-color' && !/:focus/.test(x.r.context),
    );
    if (
        oldRing.length === 1 &&
        newRing.length === 1 &&
        oldRing[0].d.value === newRing[0].d.value
    ) {
        oldDecls.splice(oldDecls.indexOf(oldRing[0]), 1);
        newDecls.splice(newDecls.indexOf(newRing[0]), 1);
    }
};
const COLOUR_PROPS =
    /^(color|background-color|background-image|border(-(top|right|bottom|left|inline|block|x|y))?-color|outline-color|box-shadow|fill|stroke|caret-color|accent-color|text-decoration-color|--tw-(shadow|shadow-color|inset-shadow|ring-color|ring-shadow|ring-offset-color|gradient-(from|via|to|stops|via-stops)|divide-color))$/;

const tokensUsed = new Map();
const valueOfToken = (file, token) => {
    const decls = declsOf(cssOf(file), [tokenClass(token)]);
    return decls.find((x) => COLOUR_PROPS.test(x.d.prop))?.d.value ?? null;
};
for (const e of entries) {
    const where = `${e.file}:${e.line} ${e.old}`;
    const css = cssOf(e.file);
    if (
        typeof e.part !== 'string' ||
        e.part === '' ||
        typeof e.reason !== 'string' ||
        e.reason === ''
    ) {
        fail(`${where}: part and reason are required`);
    }
    const oldDecls = declsOf(css, [e.old]);
    if (e.new == null) {
        const code = e.reason.split(':')[0];
        if (!REASONS.has(code)) {
            fail(
                `${where}: unconverted entry needs a reason starting with one of ${[...REASONS].join(', ')}`,
            );
        }
        if (code === 'no-css' && oldDecls.length > 0) {
            fail(`${where}: listed as generating no CSS, but it does`);
        }
        if (code !== 'no-css' && oldDecls.length === 0) {
            fail(
                `${where}: the class generates no CSS (reason should be no-css)`,
            );
        }
        if (code === 'conflict') {
            if (
                e.token == null ||
                css.rulesOf(tokenClass(e.token)).length === 0
            ) {
                fail(
                    `${where}: conflict must name an existing token in "token"`,
                );
                continue;
            }
            const tokenValue = valueOfToken(e.file, e.token);
            const oldValue = oldDecls.find((x) => COLOUR_PROPS.test(x.d.prop))
                ?.d.value;
            if (tokenValue === oldValue) {
                fail(
                    `${where}: listed as a conflict on ${e.token}, but the token compiles to the same value`,
                );
            }
            if (!/default value `[^`]+`/.test(e.reason)) {
                fail(
                    `${where}: conflict reason must state the token's default value`,
                );
            }
        }
        continue;
    }
    const newClasses = e.new.split(' ');
    const old = splitClass(e.old);
    for (const cls of newClasses) {
        const parts = splitClass(cls);
        // `protect: "important"` (P-38): the replacement adds the important modifier so that it keeps beating a
        // class it beat today only by name order; step 5 proves the winner is unchanged in every state.
        const protect =
            e.protect === 'important' &&
            old.important === '' &&
            parts.important === '!';
        if (e.protect != null && e.protect !== 'important') {
            fail(`${where}: unknown protect "${e.protect}"`);
        }
        if (
            parts.variant !== old.variant ||
            (parts.important !== old.important && !protect)
        ) {
            fail(
                `${where}: "${cls}" does not keep the variant prefix "${old.variant}${old.important}"`,
            );
        }
        if (parts.util !== 'focus-ring' && !semanticNames.has(parts.util)) {
            fail(`${where}: "${cls}" is not a semantic token class`);
        }
        for (const m of (kitCss.match(
            new RegExp(
                String.raw`@utility ${parts.util.replace('/', '\\\\/')} \{([^}]*)\}`,
            ),
        ) ?? [])[1]?.matchAll(/--guk-([a-z0-9-]+)/g) ?? []) {
            tokensUsed.set(m[1], (tokensUsed.get(m[1]) ?? 0) + 1);
        }
    }
    if (oldDecls.length === 0) {
        fail(`${where}: the old class generates no CSS`);
        continue;
    }
    const newDecls = declsOf(css, newClasses).map((x) =>
        e.protect === 'important'
            ? { ...x, key: x.key.replace(' !important:', ':') }
            : x,
    );
    liftRingColour(oldDecls, newDecls, newClasses);
    const a = oldDecls.map((x) => x.key).sort();
    const b = newDecls.map((x) => x.key).sort();
    if (a.join('\n') !== b.join('\n')) {
        const onlyOld = a.filter((k) => !b.includes(k));
        const onlyNew = b.filter((k) => !a.includes(k));
        fail(
            `${where} → "${e.new}": compiled rules differ\n      today: ${onlyOld.join('\n             ')}\n      after: ${onlyNew.join('\n             ')}`,
        );
    }
}

// Converted colour literals: the semantic variable resolves to the same default-theme value as the literal.
for (const r of (map.nonClassReferences ?? []).filter((x) => x.new != null)) {
    const css = cssOf(r.file);
    const before = css.resolve(r.value);
    const after = css.resolve(r.new);
    if (/var\(/.test(before) || /var\(/.test(after) || before !== after) {
        fail(
            `nonClassReferences: ${r.file}:${r.line} ${r.value} (${before}) → ${r.new} (${after}): not the same default value`,
        );
    }
    const token = r.new.match(/--guk-([a-z0-9-]+)/)[1];
    tokensUsed.set(token, (tokensUsed.get(token) ?? 0) + 1);
}

// ---------------------------------------------------------------------------------------------------------------
// 4-5. Ordering
// ---------------------------------------------------------------------------------------------------------------

// The value that wins for each (context, property) when two classes sit on one element, by !important, specificity,
// then position in the compiled CSS. Only colour properties are compared.
const winners = (css, a, b) => {
    const result = new Map();
    const ra = css.rulesOf(a);
    const rb = css.rulesOf(b);
    for (const x of ra) {
        for (const y of rb) {
            for (const dx of x.decls.filter((d) => COLOUR_PROPS.test(d.prop))) {
                for (const dy of y.decls.filter((d) => d.prop === dx.prop)) {
                    if (dx.value === dy.value) {
                        continue;
                    }
                    const rank = (r, d) => [
                        d.important ? 1 : 0,
                        ...r.spec,
                        r.index,
                    ];
                    const ka = rank(x, dx);
                    const kb = rank(y, dy);
                    let aWins = false;
                    for (let i = 0; i < ka.length; i++) {
                        if (ka[i] !== kb[i]) {
                            aWins = ka[i] > kb[i];
                            break;
                        }
                    }
                    result.set(
                        `${x.context} ~ ${y.context} | ${dx.prop}`,
                        aWins ? dx.value : dy.value,
                    );
                }
            }
        }
    }
    return result;
};
// Today's pair (a, b) vs the pair after the map (a2, b2): every pair-wise winner keeps its value.
const sameWinner = (css, a, b, a2, b2) => {
    const before = winners(css, a, b);
    const after = winners(css, a2, b2);
    const changed = [];
    for (const [k, v] of before) {
        const [ctxA, rest] = k.split(' ~ ');
        // Contexts are written with `&` for the class, so they stay comparable after renaming.
        const k2 = [...after.keys()].find((x) => x === `${ctxA} ~ ${rest}`);
        if (k2 != null && after.get(k2) !== v) {
            changed.push(`${k}: ${v} → ${after.get(k2)}`);
        }
    }
    for (const [k, v] of after) {
        if (!before.has(k)) {
            changed.push(`${k}: (no conflict) → ${v}`);
        }
    }
    return changed;
};
const reviewed = new Set(
    (map.orderingReviewed ?? []).map(
        (r) => `${r.file}|${[r.a, r.b].sort().join('|')}`,
    ),
);
const newOf = (file, cls, line) => {
    const list = (mapFiles[file] ?? []).filter((e) => e.old === cls);
    if (list.length === 0) {
        return cls;
    }
    const near =
        line == null
            ? list[0]
            : list
                  .slice()
                  .sort(
                      (x, y) =>
                          Math.abs(x.line - line) - Math.abs(y.line - line),
                  )[0];
    return near.new ?? cls;
};
const hazards = [];
for (const [file, list] of tsEntriesByFile) {
    const tokens = fileTokens.get(file);
    const css = cssOf(file);
    const used = new Map();
    for (const e of list.filter((x) => x.new != null)) {
        const key = `${e.line}|${e.old}`;
        const nth = used.get(key) ?? 0;
        used.set(key, nth + 1);
        const self = tokens.filter(
            (t) => t.line === e.line && t.text === e.old,
        )[nth];
        if (self == null) {
            fail(
                `${file}:${e.line} ${e.old}: not found among the file's class literals`,
            );
            continue;
        }
        for (const t of tokens) {
            if (
                t === self ||
                !t.groups.some((g) => self.groups.includes(g)) ||
                !compatible(t.choices, self.choices)
            ) {
                continue;
            }
            const other = t.text;
            const otherNew = newOf(file, other, t.line);
            for (const a of e.new.split(' ')) {
                const changed = sameWinner(css, e.old, other, a, otherNew);
                if (
                    changed.length > 0 &&
                    !reviewed.has(`${file}|${[e.old, other].sort().join('|')}`)
                ) {
                    hazards.push(
                        `${file}: "${e.old}" (line ${e.line}) → "${a}" vs "${other}" (line ${t.line}): ${changed.join('; ')}`,
                    );
                }
            }
        }
    }
}
for (const h of [...new Set(hazards)]) {
    fail(
        `ordering may change on one element: ${h}; list it in orderingReviewed or keep the class`,
    );
}
const crossChecked = new Set();
for (const u of crossUsages) {
    const css = cssOf(u.file);
    for (const p of u.passed) {
        const p2 = newOf(u.file, p, u.line);
        for (const { cls: k, file: kFile } of u.own) {
            const k2 = newOf(kFile, k);
            if ((p2 === p && k2 === k) || p === k) {
                continue;
            }
            crossChecked.add(`${u.file}:${u.line}`);
            for (const a of p2.split(' ')) {
                for (const b of k2.split(' ')) {
                    const changed = sameWinner(css, p, k, a, b);
                    if (
                        changed.length > 0 &&
                        !reviewed.has(`${u.file}|${[p, k].sort().join('|')}`)
                    ) {
                        fail(
                            `ordering across components: ${u.file}:${u.line} <${u.component} ${u.prop}> passes "${p}"→"${a}", meets "${k}"→"${b}" of ${kFile}: ${changed.join('; ')}`,
                        );
                    }
                }
            }
        }
    }
}

// ---------------------------------------------------------------------------------------------------------------
// 6. Summary
// ---------------------------------------------------------------------------------------------------------------

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
if (
    JSON.stringify(map.summary?.unconvertedByReason) !==
    JSON.stringify(unconvertedByReason)
) {
    fail(
        `summary.unconvertedByReason does not match the entries: ${JSON.stringify(unconvertedByReason)}`,
    );
}
const expectedInSources = applied ? computed.unconverted : computed.occurrences;
if (expectedInSources !== occurrenceCount) {
    fail(
        `map expects ${expectedInSources} primitive classes in the sources, they have ${occurrenceCount}`,
    );
}
const tokensListed = map.tokensUsed ?? {};
const tokensComputed = Object.fromEntries(
    [...tokensUsed.entries()].sort(([a], [b]) => a.localeCompare(b)),
);
if (JSON.stringify(tokensListed) !== JSON.stringify(tokensComputed)) {
    fail(
        `tokensUsed does not match the entries: ${JSON.stringify(tokensComputed)}`,
    );
}
// Alias-token candidates (P-51 pattern): every conflict, grouped by the token it would alias.
const aliasComputed = {};
for (const e of entries.filter((x) => x.reason.startsWith('conflict'))) {
    const today = e.reason.match(/today `([^`]+)`/)?.[1] ?? '?';
    const row = aliasComputed[e.token] ?? { classes: 0, todayValues: {} };
    row.classes++;
    row.todayValues[today] = (row.todayValues[today] ?? 0) + 1;
    aliasComputed[e.token] = row;
}
const sortedAlias = Object.fromEntries(
    Object.entries(aliasComputed).sort(([a], [b]) => a.localeCompare(b)),
);
if (
    JSON.stringify(map.aliasCandidates?.byToken) !== JSON.stringify(sortedAlias)
) {
    fail(
        `aliasCandidates.byToken does not match the conflicts: ${JSON.stringify(sortedAlias)}`,
    );
}
const batched = (map.leftovers?.batches ?? []).flatMap((b) => b.files);
if (batched.length !== new Set(batched).size) {
    fail('leftovers: a file appears in two batches');
}

// ---------------------------------------------------------------------------------------------------------------

const rel = relative(process.cwd(), mapPath);
if (errors.length > 0) {
    console.error(`validate-app-map: ${errors.length} problem(s) in ${rel}`);
    for (const e of errors) {
        console.error(`  - ${e}`);
    }
    process.exit(1);
}
console.log(
    `validate-app-map: ok (${applied ? `applied on ${map.applied.base}` : 'not applied yet'}) — ${computed.files} files, ${computed.occurrences} occurrences ` +
        `(${computed.converted} converted, ${computed.unconverted} unconverted: ${Object.entries(
            unconvertedByReason,
        )
            .map(([k, v]) => `${k} ${v}`)
            .join(
                ', ',
            )}), ${tokensUsed.size} tokens; every converted class compiles to the same rules in the default theme` +
        (applied
            ? ''
            : `; ordering: ${tsEntriesByFile.length} files pairwise, ${crossUsages.length} cross-component className usages (${crossChecked.size} with a converted class, ${crossUsages.dynamicAttributes ?? 0} attributes with a dynamic part not followed), ${(map.orderingReviewed ?? []).length} reviewed pairs`),
);
