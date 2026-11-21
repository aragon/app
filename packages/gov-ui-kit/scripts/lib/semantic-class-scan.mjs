// Shared by the semantic colour map scripts of the kit (scripts/*-semantic-component-map.mjs) and of the app
// (apps/app/scripts/semanticColors/*): how a primitive colour class is recognised in source text, how a map entry is
// applied to its line, how Tailwind orders two same-property classes by name, and which classes of a file can sit on
// the same element. Plain Node; TypeScript is passed in by the caller (it resolves it from its own workspace).

// Palette names of the primitive colour ramps.
export const RAMP = 'primary|neutral|info|success|warning|critical';

// A variant segment: plain characters, or an arbitrary `[...]` that may hold one nested `[...]`
// (`has-[[data-app-sidebar]]:`).
const VARIANT = String.raw`(?:(?:[A-Za-z0-9_@*&>.%#=+/-]|\[(?:[^\][\s'"\`]|\[[^\]\s'"\`]*\])*\])+:)`;
// What may precede and follow a class: string and template delimiters, whitespace, braces, commas, and the `;` that
// ends a CSS `@apply`.
const BEFORE = String.raw`(?<=^|[\s'"\`{(,])`;
const AFTER = String.raw`(?=$|[\s'"\`},);])`;

// One primitive colour class: groups 1 variant prefix, 2 leading `!`, 3 utility, 4 trailing `!`.
export const classRe = () =>
    new RegExp(
        String.raw`${BEFORE}(${VARIANT}*)(!?)((?:bg|text|border(?:-[xytrblse])?|outline|ring|ring-offset|divide(?:-[xy])?|fill|stroke|from|via|to|placeholder|caret|accent|decoration|inset-shadow|drop-shadow|shadow)-(?:${RAMP})-\d+(?:\/\d+)?|shadow-(?:${RAMP})(?:-(?:sm|md|lg|xl|2xl))?|focus-ring-(?:${RAMP})|gradient-[a-z0-9-]*(?:${RAMP})[a-z0-9-]*|prose-(?:${RAMP}))(!?)${AFTER}`,
        'gm',
    );
// Anything that looks like a ramp colour, used to prove the strict pattern misses nothing.
export const looseRe = () =>
    new RegExp(
        String.raw`(?<![\w-])[\w:/\[\]=&*.@!-]*?(?:${RAMP})-\d+|(?:shadow|focus-ring|gradient|prose)-[a-z0-9-]*(?:${RAMP})`,
        'g',
    );
// Any class token with a variant prefix (used to find semantic classes in the applied state).
export const anyClassRe = () => new RegExp(String.raw`${BEFORE}${VARIANT}*!?([a-z0-9-]+(?:\/\d+)?)!?${AFTER}`, 'g');

export const escapeRe = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Start indices of the whole-class occurrences of `cls` in `text` (same boundaries as classRe).
export const occurrences = (text, cls) =>
    [...text.matchAll(new RegExp(`${BEFORE}${escapeRe(cls)}${AFTER}`, 'gm'))].map((m) => m.index);
export const countClass = (text, cls) => occurrences(text, cls).length;

// Splits a class into its variant prefix, important marker and utility.
export const splitClass = (cls) => {
    const m = cls.match(/^((?:(?:[^\s:[\]]|\[(?:[^[\]]|\[[^\]]*\])*\])+:)*)(!?)(.+?)(!?)$/);
    return { variant: m[1], important: m[2] + m[4], util: m[3] };
};

// Tailwind sorts utilities of one variant and property by candidate name, comparing digit runs numerically.
export const naturalCompare = (a, b) => {
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

// Applies map entries ({ line, old, new }) to a file's text. For every entry with a non-null `new`, the occurrence of
// `old` on `line` is replaced by `new`. When a line holds the same `old` several times, the entries are in column
// order (null entries included), so the n-th entry with that `old` on that line is the n-th occurrence in the line.
// The number of whole-class occurrences on the line must equal the number of entries for it.
// Returns { text, replaced, skipped, errors }.
export const applyEntries = (file, source, entries) => {
    const lines = source.split('\n');
    const errors = [];
    let replaced = 0;
    let skipped = 0;
    const byLine = new Map();
    for (const e of entries) {
        const perOld = byLine.get(e.line) ?? new Map();
        perOld.set(e.old, [...(perOld.get(e.old) ?? []), e]);
        byLine.set(e.line, perOld);
    }
    for (const [line, perOld] of byLine) {
        const text = lines[line - 1];
        if (text == null) {
            errors.push(`${file}:${line}: line does not exist`);
            continue;
        }
        const edits = [];
        for (const [old, list] of perOld) {
            const found = occurrences(text, old);
            if (found.length !== list.length) {
                errors.push(`${file}:${line}: expected ${list.length} × "${old}", found ${found.length}`);
                continue;
            }
            for (const [n, e] of list.entries()) {
                if (e.new == null) {
                    skipped++;
                } else {
                    edits.push({ index: found[n], old, new: e.new });
                }
            }
        }
        // Right to left, so earlier indices stay valid.
        let next = text;
        for (const edit of edits.sort((a, b) => b.index - a.index)) {
            next = next.slice(0, edit.index) + edit.new + next.slice(edit.index + edit.old.length);
            replaced++;
        }
        lines[line - 1] = next;
    }
    return { text: lines.join('\n'), replaced, skipped, errors };
};

// Coexistence: for every class occurrence of a TS/TSX file, the elements it can reach and the exclusive choices on its
// way there. Classes reach an element through className attributes and the const variables / lookup maps they
// reference; branches of a ternary and different keys of a lookup map exclude each other.
export const coexistence = (ts, file, text) => {
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
                return { anchor: `jsx@${p.pos}`, choices, attribute: p };
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
    // Every class-like token in a string literal, template chunk or string object key of the file, with its anchor and
    // choices, so callers can pair a class with everything else that can sit on its element.
    const classTokens = () => {
        const tokens = [];
        const push = (node, text, offset) => {
            const { anchor, choices } = anchorOf(node);
            anchorsWithClasses.add(anchor);
            for (const m of text.matchAll(/\S+/g)) {
                const pos = offset + m.index;
                const { line, character } = sf.getLineAndCharacterOfPosition(pos);
                tokens.push({ text: m[0], line: line + 1, column: character, anchor, choices });
            }
        };
        const visit = (n) => {
            if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) {
                push(n, n.text, n.getStart(sf) + 1);
            } else if (ts.isTemplateExpression(n)) {
                push(n, n.head.text, n.head.getStart(sf) + 1);
                for (const span of n.templateSpans) {
                    push(span.literal, span.literal.text, span.literal.getStart(sf) + 1);
                }
            }
            ts.forEachChild(n, visit);
        };
        visit(sf);
        return tokens;
    };
    return {
        sourceFile: sf,
        classTokens,
        locate: (line, old, nth) => {
            const lineText = text.slice(lineStarts[line - 1], lineStarts[line] ?? text.length);
            const found = occurrences(lineText, old);
            const index = found[nth] ?? lineText.indexOf(old);
            const node = findNode(lineStarts[line - 1] + index);
            const result = anchorOf(node);
            anchorsWithClasses.add(result.anchor);
            return { ...result, node };
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

// Two choice lists are compatible unless they take different branches of the same ternary or lookup map.
export const compatible = (a, b) => {
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
