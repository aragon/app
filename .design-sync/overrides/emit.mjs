import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const require = createRequire(
    new URL('../../.ds-sync/package.json', import.meta.url),
);
const { ts } = require('ts-morph');

import * as base from '../../.ds-sync/lib/emit.mjs';
import {
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
        interfaces.push(
            `export interface ${interfaceName}${props.generics ?? ''} {\n` +
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
                const props = propsBodyFor(candidate);
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
            interfaces.push(
                `export interface ${interfaceName}${resolved.props.generics ?? ''}${resolved.props.extendsClause ?? ''} {\n${body ? `${body}\n` : ''}}\n\n`,
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

export function emitPerComponent(args) {
    base.emitPerComponent(args);
    refineAppFiles(args);
    refineKitCompounds(args);
    qualifyReactTypes(args);
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
