import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const require = createRequire(
    new URL('../../.ds-sync/package.json', import.meta.url),
);
const { ts } = require('ts-morph');

import * as base from '../../.ds-sync/lib/emit.mjs';
import {
    APP_ROOT,
    appOwnership,
    childPropsBody,
    compoundMembers,
    compoundRootCallable,
    owns,
    srcRefFor,
} from './app-ownership.mjs';

// The official emitter owns every template and calls the component list once.
// This adapter then refines its output in three narrow ways: App-owned metadata
// and source-derived declarations, typed members for kit compounds (the base
// template hardcodes `React.ComponentType<any>` for every member), and
// qualifying React type names the base renderer leaves bare.
//
// Kit .d.ts files are therefore NO LONGER byte-for-byte base output - an
// earlier version of this header claimed they were, and that stopped being
// true when compound member typing landed. Kit .jsx, .prompt.md, previews and
// every runtime artifact are still untouched base output, and all hashes are
// still computed by the official package-build after this hook returns.
export * from '../../.ds-sync/lib/emit.mjs';

// A compound member whose kit contract is generic may reference a bare type
// parameter in the emitted body while losing its parameter list. Recover only
// names used exclusively in type-argument positions. `any` is the safe default:
// unlike `unknown`, it also satisfies constraints the flattened body no longer
// carries.
function bindInterfaceTypeParameters(body) {
    const names = [
        ...new Set(
            [...body.matchAll(/\b([A-Z][A-Za-z0-9_$]*)\b/g)].map((m) => m[1]),
        ),
    ];
    const params = names.filter((name) => {
        const positions = [...body.matchAll(new RegExp(`\\b${name}\\b`, 'g'))];
        if (!positions.length) {
            return false;
        }
        const allArgs = positions.every((m) => {
            const before = m.index > 0 ? body[m.index - 1] : ' ';
            const after =
                m.index + name.length < body.length
                    ? body[m.index + name.length]
                    : ' ';
            return (
                (before === '<' || before === ',') &&
                (after === '>' || after === ',')
            );
        });
        const noHolder = positions.every(
            (m) => body[m.index + name.length] !== '<',
        );
        return allArgs && noHolder;
    });
    if (!params.length) {
        return '';
    }
    return `<${params
        .map((name) =>
            new RegExp(`\\bRecord\\s*<\\s*${name}\\s*,`).test(body)
                ? `${name} extends PropertyKey = any`
                : `${name} = any`,
        )
        .join(', ')}>`;
}

function childDeclarations(name, members) {
    const interfaces = [];
    const properties = [];
    for (const child of members) {
        const props = childPropsBody(child);
        if (!props) {
            throw new Error(
                `[app-emit] no source props contract for ${name}.${child.member}`,
            );
        }
        const interfaceName = `${child.underlyingName}Props`;
        const body = String(props.body ?? '')
            .replace(/ \/\* @(?:fn|arr) \*\//g, '')
            .trimEnd();
        let generics = props.generics ?? '';
        for (const [, name] of body.matchAll(
            /\bRecord\s*<\s*([A-Z][\w$]*)\s*,/g,
        )) {
            generics = generics.replace(
                new RegExp(`\\b${name}\\s+extends\\s+unknown\\b`),
                `${name} extends PropertyKey`,
            );
        }
        // If the contract is generic but the emit lost the parameter list
        // (see bindInterfaceTypeParameters), bind what the body uses.
        const boundParams = generics ? '' : bindInterfaceTypeParameters(body);
        interfaces.push(
            `export interface ${interfaceName}${generics}${boundParams} {\n` +
                `${body ? `${body}\n` : ''}` +
                '}\n\n',
        );
        properties.push(
            `  ${child.member}: React.ComponentType<${interfaceName}>;`,
        );
    }
    return {
        interfaces: interfaces.join(''),
        properties: properties.join('\n'),
    };
}

function replaceVariableStatement(text, name, replacement) {
    const source = ts.createSourceFile(
        'generated.d.ts',
        text,
        ts.ScriptTarget.Latest,
        true,
    );
    const statement = source.statements.find(
        (node) =>
            ts.isVariableStatement(node) &&
            node.declarationList.declarations.some(
                (declaration) =>
                    ts.isIdentifier(declaration.name) &&
                    declaration.name.text === name,
            ),
    );
    if (!statement) {
        throw new Error(`[app-emit] no generated declaration for ${name}`);
    }
    return (
        text.slice(0, statement.getStart(source)) +
        replacement +
        text.slice(statement.end)
    );
}

function refineAppDts(file, name, pkg, version, source) {
    let text = readFileSync(file, 'utf8');
    const header = new RegExp(`^ \\* ${name} — from .*\\.$`, 'm');
    if (!header.test(text)) {
        throw new Error(`[app-emit] unexpected d.ts header for ${name}`);
    }
    text = text.replace(
        header,
        ` * ${name} — from ${pkg}@${version} (${source}).`,
    );

    const members = compoundMembers(name);
    const declaration = `export declare const ${name}: React.ComponentType<${name}Props>;`;
    if (!members.length) {
        if (!text.includes(declaration)) {
            throw new Error(
                `[app-emit] unexpected d.ts declaration for ${name}`,
            );
        }
        writeFileSync(file, text);
        return;
    }

    const { interfaces, properties } = childDeclarations(name, members);
    const root = compoundRootCallable(name)
        ? `export declare const ${name}: React.ComponentType<${name}Props> & {\n${properties}\n};`
        : `export declare const ${name}: {\n${properties}\n};`;
    text = replaceVariableStatement(text, name, `${interfaces}${root}`);
    if (text.includes('React.ComponentType<any>')) {
        throw new Error(
            `[app-emit] unresolved any compound contract for ${name}`,
        );
    }
    writeFileSync(file, text);
}

function refineAppFiles({ components, OUT, GLOBAL }) {
    const { appPkg } = appOwnership();
    for (const c of components) {
        if (!owns(c.name)) {
            continue;
        }
        const source = srcRefFor(c.name);
        if (!source) {
            throw new Error(
                `[app-emit] no source reference for App export ${c.name}`,
            );
        }
        const dir = join(OUT, 'components', c.group, c.name);
        const jsx = join(dir, `${c.name}.jsx`);
        const dts = join(dir, `${c.name}.d.ts`);
        const prompt = join(dir, `${c.name}.prompt.md`);
        for (const file of [jsx, dts, prompt]) {
            if (!existsSync(file)) {
                throw new Error(`[app-emit] missing generated ${file}`);
            }
        }

        let jsxText = readFileSync(jsx, 'utf8');
        const jsxLine = /^\/\/ Re-export of .*\n/;
        if (!jsxLine.test(jsxText)) {
            throw new Error(`[app-emit] unexpected JSX header for ${c.name}`);
        }
        jsxText = jsxText.replace(
            jsxLine,
            `// Re-export of ${appPkg.name}@${appPkg.version} ${c.name} (source: ${source}). Implementation is in the root _ds_bundle.js (window.${GLOBAL}.${c.name}).\n`,
        );
        writeFileSync(jsx, jsxText);

        refineAppDts(dts, c.name, appPkg.name, appPkg.version, source);

        let promptText = readFileSync(prompt, 'utf8');
        const promptLine = new RegExp(`^${c.name} from [^.]+\\.`);
        if (!promptLine.test(promptText)) {
            throw new Error(
                `[app-emit] unexpected prompt header for ${c.name}`,
            );
        }
        promptText = promptText.replace(
            promptLine,
            `${c.name} from ${appPkg.name}. Source: \`${source}\`.`,
        );
        writeFileSync(prompt, promptText);
    }
}

// The base template hardcodes `React.ComponentType<any>` for every compound
// member, so kit compounds ship propless children (Dialog.Header, Tabs.Trigger
// and 59 more). The member's own props ARE in the shipped types - the component
// was extracted and then grouped under its parent - so they are recovered here
// through the same bound extractor the base emitter uses. A member that cannot
// be resolved keeps `any` rather than getting an invented contract.
function refineKitCompounds({ components, OUT, compoundsFor, propsBodyFor }) {
    for (const c of components) {
        const members = compoundsFor?.(c.name) ?? [];
        if (owns(c.name) || !members.length) {
            continue;
        }
        const file = join(OUT, 'components', c.group, c.name, `${c.name}.d.ts`);
        if (!existsSync(file)) {
            throw new Error(`[kit-emit] missing generated ${file}`);
        }
        const interfaces = [];
        const properties = [];
        for (const member of members) {
            const candidates = [`${c.name}${member}`, member].filter(
                (candidate) => !owns(candidate),
            );
            let resolved = null;
            for (const candidate of candidates) {
                // Kit interfaces conventionally carry an I-prefix
                // (`IProposalActionsItemProps`) while exported values do not.
                // Prefer the declaration itself so generic constraints/defaults
                // survive; fall back to the exported component signature.
                const props =
                    propsBodyFor(`I${candidate}Props`) ??
                    propsBodyFor(`I${candidate}`) ??
                    propsBodyFor(candidate);
                if (props) {
                    resolved = { candidate, props };
                    break;
                }
            }
            if (!resolved) {
                properties.push(`  ${member}: React.ComponentType<any>;`);
                continue;
            }
            const interfaceName = `${resolved.candidate}Props`;
            const body = String(resolved.props.body ?? '')
                .replace(/ \/\* @(?:fn|arr) \*\//g, '')
                .trimEnd();
            const generics = `${resolved.props.generics ?? ''}${resolved.props.extendsClause ?? ''}`;
            const boundParams = generics
                ? ''
                : bindInterfaceTypeParameters(body);
            interfaces.push(
                `export interface ${interfaceName}${generics}${boundParams} {\n${body ? `${body}\n` : ''}}\n\n`,
            );
            properties.push(
                `  ${member}: React.ComponentType<${interfaceName}>;`,
            );
        }
        if (!interfaces.length) {
            continue;
        }
        const text = readFileSync(file, 'utf8');
        const callable = text.includes(
            `export declare const ${c.name}: React.ComponentType<${c.name}Props>`,
        );
        const declaration =
            `${interfaces.join('')}export declare const ${c.name}: ` +
            (callable ? `React.ComponentType<${c.name}Props> & ` : '') +
            `{\n${properties.join('\n')}\n};\n`;
        writeFileSync(
            file,
            replaceVariableStatement(text, c.name, declaration),
        );
    }
}

// The base renderer strips `import(...)` qualifiers, so React types land bare
// (`style?: CSSProperties`) in kit files that only ever import the React
// namespace. That predates the typed members below - `Button.d.ts` has no
// members and still carries it - and it makes those declarations unresolvable.
// Every emitted file imports `* as React`, so qualifying the React-owned names
// fixes them without inventing an import. Names a file imports explicitly are
// left alone, which is what keeps App files (they import from 'react') intact.
const REACT_TYPES = [
    'CSSProperties',
    'ReactNode',
    'ReactElement',
    'ComponentType',
    'FunctionComponent',
    'ComponentPropsWithRef',
    'ComponentPropsWithoutRef',
    'AnchorHTMLAttributes',
    'ButtonHTMLAttributes',
    'InputHTMLAttributes',
    'HTMLAttributes',
    'RefObject',
    'ComponentClass',
    'ComponentState',
    // Deliberately NOT the *Event names. MouseEvent/KeyboardEvent/ChangeEvent/
    // FormEvent are lib.dom globals that already resolve, and React's synthetic
    // equivalents are DIFFERENT types. Radix calls onEscapeKeyDown with a native
    // KeyboardEvent, so qualifying it would turn a correct contract into a wrong
    // one rather than fixing an unresolved name.
];

function qualifyReactTypes({ components, OUT }) {
    for (const c of components) {
        const file = join(OUT, 'components', c.group, c.name, `${c.name}.d.ts`);
        if (!existsSync(file)) {
            continue;
        }
        const text = readFileSync(file, 'utf8');
        const imported = new Set(
            [...text.matchAll(/^import type \{([^}]*)\} from 'react';$/gm)]
                .flatMap((match) => match[1].split(','))
                .map((name) => name.trim()),
        );
        let next = text;
        for (const name of REACT_TYPES) {
            if (imported.has(name)) {
                continue;
            }
            next = next.replace(
                new RegExp(`(^|[^\\w$.'"])${name}(?![\\w$])`, 'g'),
                `$1React.${name}`,
            );
        }
        if (next !== text) {
            writeFileSync(file, next);
        }
    }
}

// The base renderer emits some generic React types with their type argument
// dropped (`ref?: React.Ref;`), which does not compile - `Ref<T>` requires one.
// This is the BASE emitter's defect, not the compound-member typing: plain
// single-component kit files (RadioGroup, InputTime, StateSkeletonBar) carry it
// too. The argument is not recoverable from the emitted text, so it degrades to
// `unknown` rather than inventing an element type the source never stated.
const DROPPED_GENERICS = ['Ref'];

function qualifyDroppedGenerics({ components, OUT }) {
    for (const c of components) {
        const file = join(OUT, 'components', c.group, c.name, `${c.name}.d.ts`);
        if (!existsSync(file)) {
            continue;
        }
        const text = readFileSync(file, 'utf8');
        let next = text;
        for (const name of DROPPED_GENERICS) {
            next = next.replace(
                new RegExp(`React\\.${name}(?![\\w$<])`, 'g'),
                `React.${name}<unknown>`,
            );
        }
        if (next !== text) {
            writeFileSync(file, next);
        }
    }
}

// Kit-owned type closure (APP-1223).
//
// The base extractor resolves types into the Props body but always returns
// `prelude: ''`, so a kit-owned name the body reaches (`IInputContainerAlert`,
// `ITagProps`) is emitted with nothing to resolve it. The App half has a
// prelude; the kit half had none.
//
// Which names are unresolved, and which of those a consumer may import, are
// BOTH compiler answers here - never a grep, never a hand-kept list. Three
// identifier greps produced three wrong lists while this was being diagnosed
// (compound member keys, JSDoc prose, locally-declared enums, bound generics);
// driving off diagnostics makes those false positives structurally impossible.
//
// Pass 1 compiles the emitted files and reads the offending identifier from
// each unresolved-name diagnostic's own span. Pass 2 asks, in one probe, which
// of those names '@aragon/gov-ui-kit' actually exports. Exported names get an
// import; everything else degrades to `unknown` rather than being invented.
const CONSUMER_OPTIONS = {
    allowJs: false,
    esModuleInterop: true,
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    noEmit: true,
    strict: true,
    target: ts.ScriptTarget.ES2022,
};

function consumerHost(appRoot) {
    const host = ts.createCompilerHost(CONSUMER_OPTIONS, true);
    // Emitted files sit outside any node_modules tree, so package specifiers
    // are resolved the way the App resolves them.
    const appResolutionFile = join(appRoot, 'consumer.ts');
    host.resolveModuleNames = (names, containingFile) =>
        names.map((name) => {
            const resolved = ts.resolveModuleName(
                name,
                containingFile,
                CONSUMER_OPTIONS,
                ts.sys,
            ).resolvedModule;
            return (
                resolved ??
                ts.resolveModuleName(
                    name,
                    appResolutionFile,
                    CONSUMER_OPTIONS,
                    ts.sys,
                ).resolvedModule
            );
        });
    return host;
}

// TS2304/TS2552: unresolved names. TS2503: unresolved namespaces used as
// qualifiers (`TransactionStatus.PENDING`, `RadixDropdown.*`).
const UNRESOLVED_NAME_CODES = new Set([2304, 2503, 2552]);

// Global utility types that are NOT resolvable as kit imports and MUST never
// be degraded: the checker reports them as 2304 only when another dependency
// in the program is broken, and writing `unknown` over them mangles composite
// types (`Record<string, V>` -> the invalid `unknown<string, V>`).
const TS_BUILTINS = new Set([
    'Record',
    'Partial',
    'Required',
    'Pick',
    'Omit',
    'Exclude',
    'Extract',
    'Readonly',
    'ReturnType',
    'Parameters',
    'NonNullable',
    'InstanceType',
    'Promise',
    'Array',
    'ReadonlyArray',
    'Date',
    'Error',
    'map',
    'unknown',
    'any',
    'undefined',
    'null',
    'never',
]);

function diagnosticSpan(diagnostic) {
    // The diagnostic's own span is the identifier, verbatim: no message
    // parsing (messageText is often a chain object) and no regex over source.
    return diagnostic.file && diagnostic.start != null
        ? diagnostic.file.text.slice(
              diagnostic.start,
              diagnostic.start + (diagnostic.length ?? 0),
          )
        : '';
}

function unresolvedNamesByFile(files, appRoot, isContained = () => true) {
    // "Cannot find name" diagnostics fire on BOUND references too: a generic
    // parameter like `TAction` inside `interface I...Props<TAction = unknown>`,
    // or each of several uses of one name, each with its own span. An emitted
    // file that DECLARES the name (interface, type alias, type parameter,
    // const, compound member key) has already bound it - such a diagnostic is
    // the checker re-reporting a reference, not an unresolvable name. Only
    // names the file does NOT declare are ours to close.
    const program = ts.createProgram(
        files,
        CONSUMER_OPTIONS,
        consumerHost(appRoot),
    );
    const declaredCache = new Map();
    const declaredNames = (fileName) => {
        if (!declaredCache.has(fileName)) {
            declaredCache.set(fileName, declaredIdentifiers(fileName));
        }
        return declaredCache.get(fileName);
    };
    const byFile = new Map();
    for (const diagnostic of ts.getPreEmitDiagnostics(program)) {
        if (
            !UNRESOLVED_NAME_CODES.has(diagnostic.code) ||
            !diagnostic.file ||
            !isContained(diagnostic.file.fileName)
        ) {
            continue;
        }
        const name = diagnosticSpan(diagnostic);
        if (!name || TS_BUILTINS.has(name)) {
            continue;
        }
        if (declaredNames(diagnostic.file.fileName).has(name)) {
            continue; // bound locally: type parameter, interface, member
        }
        const names = byFile.get(diagnostic.file.fileName) ?? new Set();
        names.add(name);
        byFile.set(diagnostic.file.fileName, names);
    }
    return byFile;
}

// Every identifier the emitted file binds: interface/type/enum/const names,
// type-parameter names, compound member keys, and generic parameters.
function declaredIdentifiers(fileName) {
    const text = readFileSync(fileName, 'utf8');
    const names = new Set();
    const seen = new Set();
    const add = (name) => {
        if (name && !seen.has(name)) {
            seen.add(name);
            names.add(name);
        }
    };
    for (const match of text.matchAll(
        /^export (?:declare )?(?:interface|type|enum|const|function|class|abstract class) ([A-Za-z0-9_$]+)/gm,
    )) {
        add(match[1]);
    }
    // Inside member interfaces (`interface DataListRootProps { ... }`
    // in a compound file), the FIRST identifiers after `<` of each
    // `interface Name<T = unknown> {` line.
    for (const match of text.matchAll(
        /^export interface ([A-Za-z0-9_$]+)(?:<((?:[A-Z][A-Za-z0-9_$]*)[^>]*)>)?/gm,
    )) {
        if (match[1]) {
            add(match[1]);
        }
        if (match[2]) {
            for (const part of match[2].split(',')) {
                const name = part.trim().match(/^([A-Z][A-Za-z0-9_$]*)\b/);
                if (name) {
                    add(name[1]);
                }
            }
        }
    }
    // Compound member keys (`  Container: React.ComponentType<...>;`).
    for (const match of text.matchAll(
        /^\s{2}([A-Z][A-Za-z0-9_$]*): React\.ComponentType</gm,
    )) {
        add(match[1]);
    }
    return names;
}

function importableFromKit(names, appRoot, OUT) {
    if (!names.size) {
        return new Set();
    }
    const sorted = [...names].sort();
    // A name the kit does not export is reported as TS2305, or TS2724 when
    // TypeScript suggests a similarly named export.
    const probe = join(OUT, '.kit-import-probe.ts');
    writeFileSync(
        probe,
        `import type { ${sorted.join(', ')} } from '@aragon/gov-ui-kit';\n`,
    );
    try {
        const program = ts.createProgram(
            [probe],
            CONSUMER_OPTIONS,
            consumerHost(appRoot),
        );
        const rejected = new Set();
        for (const diagnostic of ts.getPreEmitDiagnostics(program)) {
            if (diagnostic.code !== 2305 && diagnostic.code !== 2724) {
                continue;
            }
            const name = diagnosticSpan(diagnostic);
            if (name) {
                rejected.add(name);
            }
        }
        return new Set(sorted.filter((name) => !rejected.has(name)));
    } finally {
        rmSync(probe, { force: true });
    }
}

function closeKitTypes({ components, OUT }) {
    const appRoot = APP_ROOT;
    const files = components
        .map((c) => join(OUT, 'components', c.group, c.name, `${c.name}.d.ts`))
        .filter((file) => existsSync(file));
    const ownedRoots = new Set(files);
    const contained = (file) => ownedRoots.has(file);
    // Diagnostics can trail into node_modules (react-hook-form's shipped
    // types when a bundle file imports them transitively). Only the emitted
    // surface is ours to patch: same rule as the consumer-test filter.
    const unresolved = unresolvedNamesByFile(files, appRoot, contained);
    if (!unresolved.size) {
        return;
    }
    const every = new Set();
    for (const names of unresolved.values()) {
        for (const name of names) {
            every.add(name);
        }
    }
    const importable = importableFromKit(every, appRoot, OUT);

    for (const [file, names] of unresolved) {
        const text = readFileSync(file, 'utf8');
        const imports = [...names].filter((name) => importable.has(name));
        const degraded = [...names].filter((name) => !importable.has(name));
        let next = text;
        for (const name of degraded) {
            next = next.replace(
                new RegExp(
                    `\\b${name}\\.[A-Za-z_$][\\w$]*(?:\\.[A-Za-z_$][\\w$]*)*`,
                    'g',
                ),
                'unknown',
            );
            // Type position wherever the name appears BARE - after `:`, inside
            // a union (`A | ITagProps`), or inside a generic argument
            // (`Foo<Config>`) - but never a property key, never after a dot,
            // never the tail of a longer identifier, and never an already
            // qualified React member. Same rule qualifyReactTypes uses.
            const pattern = new RegExp(`(^|[^\\w$.'"])${name}(?![\\w$])`, 'g');
            next = next.replace(pattern, '$1unknown');
        }
        // A degraded name that carried type arguments leaves the invalid
        // `unknown<T>` behind; the residual form is collapsed below with
        // every `unknown<...>`/`any<...>`, parse-safe to bare unknown.
        if (imports.length) {
            // Same slot the App prelude uses - after the Props interface (the
            // base emitter documents that as deliberate: the design agent's
            // parser takes the first interface, and TS hoists imports). The
            // first-interface marker is `}\n\n`: anchor there rather than on
            // any `}`, which in a compound file lands inside a member
            // interface and leaves the import in the middle of a body.
            const anchor = /^}\n\n/m;
            if (!anchor.test(next)) {
                throw new Error(
                    `[app-emit] no Props-interface close to anchor the kit prelude in ${file}`,
                );
            }
            next = next.replace(
                anchor,
                `}\n\nimport type { ${imports.sort().join(', ')} } from '@aragon/gov-ui-kit';\n\n`,
            );
        }
        if (next !== text) {
            writeFileSync(file, next);
        }
    }
}

// The base renderer can emit `unknown<...>`/`any<...>` (a degraded root name
// with its type arguments intact, e.g. `React.FC<{}>` rendered as
// `unknown<{}>`) even in files this pass has no unresolved names for. That is
// invalid TypeScript, so collapse it everywhere as a final safety net.
const UNKNOWN_GENERIC = /\b(?:unknown|any)\s*<([^<>]|<[^<>]*>)*>/g;

function sanitizeUnknownGenerics({ components, OUT }) {
    for (const c of components) {
        const file = join(OUT, 'components', c.group, c.name, `${c.name}.d.ts`);
        if (!existsSync(file)) {
            continue;
        }
        const text = readFileSync(file, 'utf8');
        const next = text.replace(UNKNOWN_GENERIC, 'unknown');
        if (next !== text) {
            writeFileSync(file, next);
        }
    }
}
function constrainRecordKeys({ components, OUT }) {
    for (const c of components) {
        const file = join(OUT, 'components', c.group, c.name, `${c.name}.d.ts`);
        if (!existsSync(file)) {
            continue;
        }
        const text = readFileSync(file, 'utf8');
        let next = text;
        for (const [, name] of text.matchAll(
            /\bRecord\s*<\s*([A-Z][\w$]*)\s*,/g,
        )) {
            next = next.replace(
                new RegExp(`\\b${name}\\s+extends\\s+unknown\\b`, 'g'),
                `${name} extends PropertyKey`,
            );
        }
        if (next !== text) {
            writeFileSync(file, next);
        }
    }
}

export function emitPerComponent(args) {
    base.emitPerComponent(args);
    refineAppFiles(args);
    refineKitCompounds(args);
    qualifyReactTypes(args);
    qualifyDroppedGenerics(args);
    closeKitTypes(args);
    sanitizeUnknownGenerics(args);
    constrainRecordKeys(args);
}

export function emitReadme(args) {
    base.emitReadme(args);
    const file = join(args.OUT, 'README.md');
    let text = readFileSync(file, 'utf8');
    text = text
        .replaceAll(
            '.design-sync/component-registry/registry.json',
            'guidelines/context/index.md',
        )
        .replaceAll(
            '.design-sync/component-registry/selection-guide.json',
            'guidelines/context/selection-guide.json',
        )
        .replace(
            /\]\(\.\.\/apps\/app\/[^)]+\)/g,
            '](guidelines/context/source-index.md#configured-component-sources)',
        );
    if (!text.includes('guidelines/context/index.md')) {
        const anchor = 'For a specific component,';
        if (!text.includes(anchor)) {
            throw new Error(
                '[app-emit] README anchor for the delivered context pointer is missing',
            );
        }
        text = text.replace(
            anchor,
            `- \`guidelines/context/index.md\` — authoritative registry, selection guide and recorded source references.\n\n${anchor}`,
        );
    }
    writeFileSync(file, text);
}
