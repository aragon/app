// Classes passed into another component through a JSX attribute ending in `className`, for the ordering check of
// validate-app-map.mjs (step 5). Generalises the override audit of the kit conversion (P-37): the tag is resolved by
// the TypeScript checker to its declaring file, `@aragon/gov-ui-kit` to the kit's source (not its bundle), and the
// component's own classes are those of the element that receives the prop (and, when that element is a component
// again, of its receiving element: two levels), so an app wrapper that forwards `className` to a kit component is
// covered too. Classes on other elements of the component (an icon inside a link) can never meet the passed class.

import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

// A class that can carry a colour (primitive or semantic); everything else is irrelevant to the ordering check.
export const COLOURISH =
    /^(?:[^\s:]*:)*!?-?(?:bg|text|border|shadow|ring|fill|stroke|from|via|to|outline|divide|decoration|caret|accent|placeholder|focus-ring|icon|gradient|prose)(?:-[a-z0-9[(]|$)/;

export const findUsages = (ts, repoRoot, scopes) => {
    const kitSrc = resolve(repoRoot, 'packages/gov-ui-kit/src');
    const kitIndex = resolve(kitSrc, 'index.ts');
    const appSrc = resolve(repoRoot, 'apps/app/src');
    const walk = (dir) =>
        readdirSync(dir).flatMap((name) => {
            const path = join(dir, name);
            if (name === 'node_modules') {
                return [];
            }
            return statSync(path).isDirectory() ? walk(path) : [path];
        });
    const files = scopes
        .flatMap((s) => walk(resolve(repoRoot, s.root)))
        .filter(
            (f) =>
                /\.tsx?$/.test(f) && !/\.(d|test|spec|stories)\.tsx?$/.test(f),
        );
    const tryFile = (base) => {
        for (const candidate of [
            base,
            `${base}.tsx`,
            `${base}.ts`,
            join(base, 'index.tsx'),
            join(base, 'index.ts'),
        ]) {
            if (existsSync(candidate) && statSync(candidate).isFile()) {
                return candidate;
            }
        }
        return null;
    };
    const options = {
        jsx: ts.JsxEmit.Preserve,
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        noEmit: true,
        skipLibCheck: true,
        types: [],
    };
    const host = ts.createCompilerHost(options, true);
    host.resolveModuleNameLiterals = (literals, containingFile) =>
        literals.map((literal) => {
            const name = literal.text;
            let target = null;
            if (name === '@aragon/gov-ui-kit') {
                target = kitIndex;
            } else if (name.startsWith('@/')) {
                target = tryFile(resolve(appSrc, name.slice(2)));
            } else if (name.startsWith('.')) {
                target = tryFile(resolve(containingFile, '..', name));
            }
            return target == null
                ? { resolvedModule: undefined }
                : {
                      resolvedModule: {
                          resolvedFileName: target,
                          extension: target.endsWith('.tsx') ? '.tsx' : '.ts',
                          isExternalLibraryImport: false,
                      },
                  };
        });
    const program = ts.createProgram(files, options, host);
    const checker = program.getTypeChecker();
    const inRepoSource = (file) =>
        file.startsWith(kitSrc) ||
        scopes.some((s) => file.startsWith(resolve(repoRoot, s.root)));

    const declarationFile = (tag) => {
        let sym = checker.getSymbolAtLocation(
            ts.isPropertyAccessExpression(tag) ? tag.name : tag,
        );
        for (let i = 0; i < 8 && sym != null; i++) {
            if (sym.flags & ts.SymbolFlags.Alias) {
                sym = checker.getAliasedSymbol(sym);
                continue;
            }
            const d = sym.valueDeclaration ?? sym.declarations?.[0];
            if (
                d &&
                ts.isPropertyAssignment(d) &&
                ts.isIdentifier(d.initializer)
            ) {
                sym = checker.getSymbolAtLocation(d.initializer);
                continue;
            }
            if (d && ts.isShorthandPropertyAssignment(d)) {
                sym = checker.getShorthandAssignmentValueSymbol(d);
                continue;
            }
            if (
                d &&
                ts.isVariableDeclaration(d) &&
                d.initializer &&
                ts.isIdentifier(d.initializer)
            ) {
                sym = checker.getSymbolAtLocation(d.initializer);
                continue;
            }
            break;
        }
        const d = sym?.valueDeclaration ?? sym?.declarations?.[0];
        const file = d?.getSourceFile().fileName;
        return file != null && inRepoSource(file) ? file : null;
    };

    // String literals reachable from an expression (following same-file consts and lookup maps).
    const literalsIn = (node) => {
        const out = [];
        let dynamic = false;
        const seen = new Set();
        const follow = (n) => {
            const s = checker.getSymbolAtLocation(n);
            const d = s?.valueDeclaration;
            if (
                d &&
                ts.isVariableDeclaration(d) &&
                d.initializer &&
                !seen.has(d)
            ) {
                seen.add(d);
                visit(d.initializer);
                return true;
            }
            return false;
        };
        const visit = (n) => {
            if (
                ts.isStringLiteral(n) ||
                ts.isNoSubstitutionTemplateLiteral(n)
            ) {
                out.push(n.text);
                return;
            }
            if (ts.isTemplateExpression(n)) {
                out.push(n.head.text);
                for (const span of n.templateSpans) {
                    visit(span.expression);
                    out.push(span.literal.text);
                }
                return;
            }
            if (ts.isIdentifier(n)) {
                if (!follow(n)) {
                    dynamic = true;
                }
                return;
            }
            if (
                ts.isPropertyAccessExpression(n) ||
                ts.isElementAccessExpression(n)
            ) {
                if (!follow(n.expression)) {
                    dynamic = true;
                }
                return;
            }
            if (ts.isPropertyAssignment(n)) {
                if (ts.isStringLiteral(n.name) || ts.isIdentifier(n.name)) {
                    out.push(n.name.text);
                }
                visit(n.initializer);
                return;
            }
            if (ts.isCallExpression(n)) {
                if (
                    !/^(classNames|classnames|clsx|cn|twMerge)$/.test(
                        n.expression.getText(),
                    )
                ) {
                    dynamic = true;
                }
                n.arguments.forEach(visit);
                return;
            }
            ts.forEachChild(n, visit);
        };
        visit(node);
        return { strings: out, dynamic };
    };
    const tokens = (strings) => [
        ...new Set(
            strings
                .flatMap((s) => s.split(/\s+/))
                .filter((t) => COLOURISH.test(t)),
        ),
    ];

    // Own classes of the element that receives a prop (`className`, `textClassName`, …) inside a component file: the
    // element whose class attribute reads the prop (or that spreads the props), the literals of that attribute, and
    // when that element is itself a component, what its own receiving element carries (two levels).
    const ownCache = new Map();
    const receivingClasses = (file, propName, depth = 2) => {
        const key = `${file}|${propName}|${depth}`;
        if (ownCache.has(key)) {
            return ownCache.get(key);
        }
        ownCache.set(key, []);
        const sf = program.getSourceFile(file);
        if (sf == null || depth < 0) {
            return [];
        }
        const acc = [];
        // Whether an expression reads the prop, directly or through same-file consts (`const classes = classNames(…,
        // className)`).
        const mentions = (node, name) => {
            let found = false;
            const seen = new Set();
            const visit = (n) => {
                if (found) {
                    return;
                }
                if (
                    (ts.isIdentifier(n) && n.text === name) ||
                    (ts.isPropertyAccessExpression(n) && n.name.text === name)
                ) {
                    found = true;
                    return;
                }
                if (ts.isIdentifier(n)) {
                    const d = checker.getSymbolAtLocation(n)?.valueDeclaration;
                    if (
                        d &&
                        ts.isVariableDeclaration(d) &&
                        d.initializer &&
                        d.getSourceFile() === sf &&
                        !seen.has(d)
                    ) {
                        seen.add(d);
                        visit(d.initializer);
                    }
                }
                ts.forEachChild(n, visit);
            };
            visit(node);
            return found;
        };
        const elements = [];
        const visit = (n) => {
            if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) {
                const props = n.attributes.properties;
                const byAttr = props.find(
                    (a) =>
                        ts.isJsxAttribute(a) &&
                        a.initializer != null &&
                        /className$/i.test(a.name.getText(sf)) &&
                        mentions(a.initializer, propName),
                );
                const bySpread =
                    propName === 'className' &&
                    props.some(
                        (a) =>
                            ts.isJsxSpreadAttribute(a) &&
                            /^(props|otherProps|rest|restProps)$/.test(
                                a.expression.getText(sf),
                            ),
                    );
                if (byAttr != null || bySpread) {
                    elements.push({ element: n, attr: byAttr });
                }
            }
            ts.forEachChild(n, visit);
        };
        visit(sf);
        for (const { element, attr } of elements) {
            const classAttr =
                attr ??
                element.attributes.properties.find(
                    (a) =>
                        ts.isJsxAttribute(a) &&
                        a.name.getText(sf) === 'className' &&
                        a.initializer != null,
                );
            if (classAttr != null) {
                const expr = ts.isJsxExpression(classAttr.initializer)
                    ? classAttr.initializer.expression
                    : classAttr.initializer;
                if (expr != null) {
                    for (const cls of tokens(literalsIn(expr).strings)) {
                        acc.push({ cls, file: relative(repoRoot, file) });
                    }
                }
            }
            if (/^[A-Z]/.test(element.tagName.getText(sf))) {
                const inner = declarationFile(element.tagName);
                if (inner != null && inner !== file) {
                    acc.push(
                        ...receivingClasses(
                            inner,
                            classAttr?.name.getText(sf) ?? 'className',
                            depth - 1,
                        ),
                    );
                }
            }
        }
        ownCache.set(key, acc);
        return acc;
    };

    const usages = [];
    const counts = { dynamicAttributes: 0 };
    for (const f of files) {
        const sf = program.getSourceFile(f);
        if (sf == null) {
            continue;
        }
        const visit = (n) => {
            if (
                (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) &&
                /^[A-Z]/.test(n.tagName.getText(sf))
            ) {
                const target = declarationFile(n.tagName);
                if (target != null && target !== f) {
                    for (const attr of n.attributes.properties) {
                        if (
                            !ts.isJsxAttribute(attr) ||
                            attr.initializer == null ||
                            !/className$/i.test(attr.name.getText(sf))
                        ) {
                            continue;
                        }
                        const expr = ts.isJsxExpression(attr.initializer)
                            ? attr.initializer.expression
                            : attr.initializer;
                        if (expr == null) {
                            continue;
                        }
                        const { strings, dynamic } = literalsIn(expr);
                        if (dynamic) {
                            counts.dynamicAttributes++;
                        }
                        const passed = tokens(strings);
                        if (passed.length === 0) {
                            continue;
                        }
                        usages.push({
                            file: relative(repoRoot, f),
                            line:
                                sf.getLineAndCharacterOfPosition(n.getStart(sf))
                                    .line + 1,
                            component: n.tagName.getText(sf),
                            componentFile: relative(repoRoot, target),
                            prop: attr.name.getText(sf),
                            passed,
                            own: receivingClasses(
                                target,
                                attr.name.getText(sf),
                            ),
                        });
                    }
                }
            }
            ts.forEachChild(n, visit);
        };
        visit(sf);
    }
    usages.dynamicAttributes = counts.dynamicAttributes;
    return usages;
};
