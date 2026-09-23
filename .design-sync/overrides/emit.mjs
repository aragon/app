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

// The official emitter owns every template and calls the component list once;
// this adapter changes only App-owned metadata and source-derived declarations.
// Kit files therefore remain byte-for-byte base output, while hashes are still
// computed by the official package-build after this hook returns.
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

export function emitPerComponent(args) {
    base.emitPerComponent(args);
    refineAppFiles(args);
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
