#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const REGISTRY_DIR = path.dirname(SCRIPT_PATH);
const WORKSPACE_ROOT = path.resolve(REGISTRY_DIR, '../..');
const SCHEMA_PATH = path.join(REGISTRY_DIR, 'schema.json');
const REGISTRY_PATH = path.join(REGISTRY_DIR, 'registry.json');
const PACKAGE_NAME = '@aragon/gov-ui-kit';
const UTILITY_NAMES = new Set([
    'addressUtils',
    'clipboardUtils',
    'ensUtils',
    'formatterUtils',
    'responsiveUtils',
    'ssrUtils',
    'urlUtils',
]);
const ORIGINAL_PACKAGE_NAME = '@aragon/gov-ui-kit-original';
const SOURCE_EXTENSIONS = new Set([
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.mjs',
    '.cjs',
]);
const RELATED_EXTENSIONS = new Set([
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.md',
    '.mdx',
]);
const SKIP_DIRS = new Set([
    '.git',
    'node_modules',
    'dist',
    'coverage',
    'storybook-static',
    '.next',
    '.turbo',
]);
const DEFAULT_SCHEMA_VERSION = '1.1.0';

function exists(filePath) {
    try {
        fs.accessSync(filePath);
        return true;
    } catch {
        return false;
    }
}

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
    fs.writeFileSync(filePath, `${JSON.stringify(value, null, 4)}\n`);
}

function sha256(filePath) {
    return createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function posixPath(filePath) {
    return filePath.split(path.sep).join('/');
}

function relativePath(root, filePath) {
    return posixPath(path.relative(root, filePath));
}

function repositoryRef(repository, root, filePath, line = 1) {
    if (!filePath || !exists(filePath)) {
        return null;
    }
    const relative = relativePath(root, filePath);
    if (relative.startsWith('../') || path.isAbsolute(relative)) {
        return null;
    }
    return {
        repository,
        path: relative,
        line: Math.max(1, line),
        sha256: sha256(filePath),
    };
}

function clone(value) {
    return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function walkFiles(root) {
    const files = [];
    if (!exists(root)) {
        return files;
    }
    const visit = (directory) => {
        for (const entry of fs.readdirSync(directory, {
            withFileTypes: true,
        })) {
            if (entry.isDirectory()) {
                if (!SKIP_DIRS.has(entry.name)) {
                    visit(path.join(directory, entry.name));
                }
                continue;
            }
            if (entry.isFile()) {
                files.push(path.join(directory, entry.name));
            }
        }
    };
    visit(root);
    return files.sort((a, b) => a.localeCompare(b));
}

function runGit(root, args) {
    try {
        return execFileSync('git', ['-C', root, ...args], {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
        }).replace(/\s+$/u, '');
    } catch {
        return '';
    }
}

function gitCommit(root) {
    const commit = runGit(root, ['rev-parse', 'HEAD']).trim();
    return /^[a-f0-9]{40}$/u.test(commit) ? commit : null;
}

function gitDirty(root, paths) {
    const output = runGit(root, [
        'status',
        '--porcelain',
        '--untracked-files=all',
        '--',
        ...paths,
    ]);
    return output
        ? output
              .split('\n')
              .map((line) => line.slice(3).trim())
              .filter(Boolean)
              .sort()
        : [];
}
function gitRootFor(root) {
    const value = runGit(root, ['rev-parse', '--show-toplevel']);
    return value ? path.resolve(value) : null;
}

function resolveRoots(options = {}) {
    const appRoot = path.resolve(
        options.appRoot ||
            process.env.GOVKIT_APP_ROOT ||
            path.join(WORKSPACE_ROOT, 'apps/app'),
    );
    const kitRoot = path.resolve(
        options.kitRoot ||
            process.env.GOVKIT_KIT_ROOT ||
            path.resolve(WORKSPACE_ROOT, '../gov-ui-kit'),
    );
    if (!exists(path.join(kitRoot, 'package.json'))) {
        throw new Error(
            `GovKit source root not found: ${kitRoot}; set GOVKIT_KIT_ROOT`,
        );
    }
    const consumedRoot = path.resolve(
        options.consumedRoot ||
            process.env.GOVKIT_CONSUMED_ROOT ||
            path.join(appRoot, 'node_modules', PACKAGE_NAME),
    );
    return { appRoot, kitRoot, consumedRoot };
}

function resolvePackageRequire(packageName, roots) {
    for (const root of roots) {
        if (!root) {
            continue;
        }
        try {
            const packageJson = path.join(root, 'package.json');
            const requireFromRoot = createRequire(packageJson);
            const resolved = requireFromRoot.resolve(packageName);
            return { require: requireFromRoot, resolved };
        } catch {
            // Continue to the pnpm virtual store below.
        }
        const pnpmRoot = path.join(root, 'node_modules', '.pnpm');
        if (!exists(pnpmRoot)) {
            continue;
        }
        for (const folder of fs.readdirSync(pnpmRoot)) {
            if (!folder.startsWith(`${packageName}@`)) {
                continue;
            }
            const packageRoot = path.join(
                pnpmRoot,
                folder,
                'node_modules',
                packageName,
            );
            const packageJson = path.join(packageRoot, 'package.json');
            if (!exists(packageJson)) {
                continue;
            }
            try {
                const requireFromPackage = createRequire(packageJson);
                return {
                    require: requireFromPackage,
                    resolved: requireFromPackage.resolve(packageName),
                };
            } catch {
                // Keep looking for another compatible virtual-store entry.
            }
        }
    }
    return null;
}

function loadTypeScript(kitRoot) {
    const resolved = resolvePackageRequire('typescript', [
        kitRoot,
        WORKSPACE_ROOT,
    ]);
    if (!resolved) {
        throw new Error(
            'TypeScript is required from the GovKit or workspace node_modules',
        );
    }
    return resolved.require('typescript');
}

function loadAjv(kitRoot) {
    const resolved = resolvePackageRequire('ajv', [WORKSPACE_ROOT, kitRoot]);
    if (!resolved) {
        throw new Error(
            'Ajv is required from the workspace node_modules (pnpm install)',
        );
    }
    const loaded = resolved.require('ajv');
    return loaded.default || loaded;
}

function parseKitProgram(ts, kitRoot) {
    const configPath = path.join(kitRoot, 'tsconfig.json');
    const config = ts.readConfigFile(configPath, ts.sys.readFile);
    const parsed = config.error
        ? { options: {}, fileNames: [] }
        : ts.parseJsonConfigFileContent(config.config, ts.sys, kitRoot);
    const indexPath = path.join(kitRoot, 'src/index.ts');
    const options = {
        ...parsed.options,
        allowJs: true,
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        skipLibCheck: true,
    };
    const program = ts.createProgram([indexPath], options);
    const sourceFile = program.getSourceFile(indexPath);
    if (!sourceFile) {
        throw new Error(`Could not parse GovKit entry source: ${indexPath}`);
    }
    return { program, sourceFile };
}

function resolveSymbol(ts, checker, symbol) {
    let current = symbol;
    const seen = new Set();
    while (
        current &&
        current.flags & ts.SymbolFlags.Alias &&
        !seen.has(current)
    ) {
        seen.add(current);
        const next = checker.getAliasedSymbol(current);
        if (!next || next === current) {
            break;
        }
        current = next;
    }
    return current || symbol;
}

function firstDeclaration(symbol) {
    return symbol?.getDeclarations?.()?.[0] || null;
}

function declarationSource(declaration, kitRoot) {
    const fileName = declaration?.getSourceFile?.()?.fileName;
    return fileName &&
        path.resolve(fileName).startsWith(`${path.resolve(kitRoot)}${path.sep}`)
        ? fileName
        : null;
}

function declarationKey(symbol, kitRoot) {
    const declaration = firstDeclaration(symbol);
    const source = declarationSource(declaration, kitRoot);
    if (source && declaration) {
        return `${relativePath(kitRoot, source)}:${declaration.getStart()}`;
    }
    return `unresolved:${symbol?.name || ''}`;
}

function declarationLine(declaration) {
    if (!declaration) {
        return 1;
    }
    return (
        declaration
            .getSourceFile()
            .getLineAndCharacterOfPosition(declaration.getStart()).line + 1
    );
}

function likelyComponent(ts, checker, symbol, declaration, source) {
    if (
        !symbol ||
        !(symbol.flags & ts.SymbolFlags.Value) ||
        !source ||
        !/\.tsx$/u.test(source)
    ) {
        return false;
    }
    if (!/^[A-Z]/u.test(symbol.name || '')) {
        return false;
    }
    const initializer =
        declaration &&
        ts.isVariableDeclaration(declaration) &&
        declaration.initializer &&
        declaration.initializer;
    if (
        initializer &&
        ts.isCallExpression(initializer) &&
        (initializer.expression.getText() === 'createContext' ||
            initializer.expression.getText().endsWith('.createContext'))
    ) {
        return false;
    }
    try {
        const type = checker.getTypeOfSymbolAtLocation(
            symbol,
            declaration || symbol.valueDeclaration,
        );
        return (
            type.getCallSignatures().length > 0 ||
            type
                .getProperties()
                .some((property) => property.name === 'displayName')
        );
    } catch {
        return false;
    }
}

function collectMembers(ts, checker, symbol, declaration, kitRoot, allFiles) {
    if (!symbol || !declaration) {
        return [];
    }
    let type;
    try {
        type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
    } catch {
        return [];
    }
    const members = [];
    for (const property of type
        .getProperties()
        .sort((a, b) => a.name.localeCompare(b.name))) {
        if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/u.test(property.name)) {
            continue;
        }
        const propertySymbol = resolveSymbol(ts, checker, property);
        const propertyDeclaration = firstDeclaration(propertySymbol);
        let implementationSymbol = propertySymbol;
        if (
            propertyDeclaration &&
            ts.isPropertyAssignment(propertyDeclaration)
        ) {
            const initializerSymbol = checker.getSymbolAtLocation(
                propertyDeclaration.initializer,
            );
            if (initializerSymbol) {
                implementationSymbol = resolveSymbol(
                    ts,
                    checker,
                    initializerSymbol,
                );
            }
        } else if (
            propertyDeclaration &&
            ts.isShorthandPropertyAssignment(propertyDeclaration)
        ) {
            const initializerSymbol =
                checker.getShorthandAssignmentValueSymbol(propertyDeclaration);
            if (initializerSymbol) {
                implementationSymbol = resolveSymbol(
                    ts,
                    checker,
                    initializerSymbol,
                );
            }
        }
        const implementationDeclaration =
            firstDeclaration(implementationSymbol);
        const propertySource = declarationSource(
            implementationDeclaration,
            kitRoot,
        );
        let propertyType;
        try {
            propertyType = checker.getTypeOfSymbolAtLocation(
                implementationSymbol,
                implementationDeclaration,
            );
        } catch {
            continue;
        }
        const renderable =
            propertyType.getCallSignatures().length > 0 ||
            propertyType
                .getProperties()
                .some((item) => item.name === 'displayName');
        const nestedCompound = propertyType
            .getProperties()
            .some((nestedProperty) => {
                let nestedSymbol = resolveSymbol(ts, checker, nestedProperty);
                const nestedPropertyDeclaration =
                    firstDeclaration(nestedSymbol);
                if (
                    nestedPropertyDeclaration &&
                    ts.isPropertyAssignment(nestedPropertyDeclaration)
                ) {
                    const nestedInitializerSymbol = checker.getSymbolAtLocation(
                        nestedPropertyDeclaration.initializer,
                    );
                    if (nestedInitializerSymbol) {
                        nestedSymbol = resolveSymbol(
                            ts,
                            checker,
                            nestedInitializerSymbol,
                        );
                    }
                } else if (
                    nestedPropertyDeclaration &&
                    ts.isShorthandPropertyAssignment(nestedPropertyDeclaration)
                ) {
                    const nestedInitializerSymbol =
                        checker.getShorthandAssignmentValueSymbol(
                            nestedPropertyDeclaration,
                        );
                    if (nestedInitializerSymbol) {
                        nestedSymbol = resolveSymbol(
                            ts,
                            checker,
                            nestedInitializerSymbol,
                        );
                    }
                }
                const nestedDeclaration = firstDeclaration(nestedSymbol);
                const nestedSource = declarationSource(
                    nestedDeclaration,
                    kitRoot,
                );
                if (!nestedSource || !/\.tsx$/u.test(nestedSource)) {
                    return false;
                }
                try {
                    const nestedType = checker.getTypeOfSymbolAtLocation(
                        nestedSymbol,
                        nestedDeclaration,
                    );
                    return (
                        nestedType.getCallSignatures().length > 0 ||
                        nestedType
                            .getProperties()
                            .some((item) => item.name === 'displayName')
                    );
                } catch {
                    return false;
                }
            });
        if (
            !propertySource ||
            (!/\.tsx$/u.test(propertySource) && !nestedCompound) ||
            (!renderable && !nestedCompound)
        ) {
            continue;
        }
        const related = findRelatedRefs(kitRoot, propertySource, allFiles);
        const propertyRef = repositoryRef(
            'kit',
            kitRoot,
            propertySource,
            declarationLine(implementationDeclaration),
        );
        if (!propertyRef) {
            continue;
        }
        const memberName = `${symbol.name}.${property.name}`;
        const memberId = `govkit:${symbol.name}${property.name.charAt(0).toUpperCase()}${property.name.slice(1)}`;
        members.push({
            id: memberId,
            name: memberName,
            exportNames: [memberName],
            source: propertyRef,
            props: related.props,
            stories: related.stories,
            tests: related.tests,
            docs: related.docs,
        });
    }
    return members;
}

function findRelatedRefs(kitRoot, sourceFile, allFiles) {
    const sourceDirectory = path.dirname(sourceFile);
    const sourceBase = path
        .basename(sourceFile)
        .replace(/\.(?:tsx?|jsx?)$/u, '')
        .toLowerCase();
    const parentBase = path.basename(sourceDirectory).toLowerCase();
    const related = { props: [], stories: [], tests: [], docs: [] };
    for (const candidate of allFiles) {
        const extension = path.extname(candidate).toLowerCase();
        if (!RELATED_EXTENSIONS.has(extension)) {
            continue;
        }
        const candidateDirectory = path.dirname(candidate);
        const candidateBase = path.basename(candidate).toLowerCase();
        const sameDirectory = candidateDirectory === sourceDirectory;
        const matchesStem =
            candidateBase.includes(sourceBase) ||
            (sourceBase === 'index' && candidateBase.includes(parentBase));
        if (!sameDirectory || !matchesStem) {
            continue;
        }
        const ref = repositoryRef('kit', kitRoot, candidate, 1);
        if (!ref || candidate === sourceFile) {
            continue;
        }
        if (/\.(?:api|props|types)\.(?:tsx?|jsx?)$/u.test(candidateBase)) {
            related.props.push(ref);
        } else if (/\.stories?\.(?:tsx?|jsx?)$/u.test(candidateBase)) {
            related.stories.push(ref);
        } else if (/\.(?:test|spec)\.(?:tsx?|jsx?)$/u.test(candidateBase)) {
            related.tests.push(ref);
        } else if (/\.(?:md|mdx)$/u.test(candidateBase)) {
            related.docs.push(ref);
        }
    }
    for (const refs of Object.values(related)) {
        refs.sort((a, b) => a.path.localeCompare(b.path));
    }
    return related;
}

function packageExports(kitRoot) {
    const packageJson = readJson(path.join(kitRoot, 'package.json'));
    const exportsMap = packageJson.exports || {};
    const js = [];
    const css = [];
    for (const [subpath] of Object.entries(exportsMap)) {
        if (subpath === '.') {
            js.push(subpath);
        } else if (/\.css$/u.test(subpath)) {
            css.push(subpath);
        } else {
            throw new Error(
                `Unsupported GovKit package export ${subpath}; add explicit extraction support`,
            );
        }
    }
    return { packageJson, js: js.sort(), css: css.sort() };
}

function extractExports(kitRoot) {
    const ts = loadTypeScript(kitRoot);
    const { program, sourceFile } = parseKitProgram(ts, kitRoot);
    const checker = program.getTypeChecker();
    const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
    if (!moduleSymbol) {
        throw new Error('TypeScript did not produce a symbol for src/index.ts');
    }
    const exports = checker.getExportsOfModule(moduleSymbol);
    const allFiles = walkFiles(path.join(kitRoot, 'src'));
    const groups = new Map();
    for (const exported of exports) {
        const resolved = resolveSymbol(ts, checker, exported);
        const key = declarationKey(resolved, kitRoot);
        const existing = groups.get(key) || {
            resolved,
            names: [],
            exported: [],
        };
        existing.names.push(exported.name);
        existing.exported.push(exported);
        groups.set(key, existing);
    }
    const records = [];
    const namesByKey = new Map();
    for (const group of groups.values()) {
        const names = [...new Set(group.names)].sort((a, b) =>
            a.localeCompare(b),
        );
        const declaration = firstDeclaration(group.resolved);
        const sourceFileName = declarationSource(declaration, kitRoot);
        const source = repositoryRef(
            'kit',
            kitRoot,
            sourceFileName,
            declarationLine(declaration),
        );
        const canonical = names.includes(group.resolved.name)
            ? group.resolved.name
            : names[0];
        const runtime =
            group.exported.some((entry) =>
                Boolean(entry.flags & ts.SymbolFlags.Value),
            ) || Boolean(group.resolved.flags & ts.SymbolFlags.Value);
        const members = collectMembers(
            ts,
            checker,
            group.resolved,
            declaration,
            kitRoot,
            allFiles,
        );
        const kind = UTILITY_NAMES.has(canonical)
            ? 'utility'
            : members.length > 0
              ? 'compound'
              : likelyComponent(
                      ts,
                      checker,
                      group.resolved,
                      declaration,
                      sourceFileName,
                  )
                ? 'component'
                : 'non-component';
        const related = sourceFileName
            ? findRelatedRefs(kitRoot, sourceFileName, allFiles)
            : { props: [], stories: [], tests: [], docs: [] };
        const propsType = declaration?.type?.typeArguments?.[0];
        const propsSymbol =
            propsType &&
            checker.getSymbolAtLocation(propsType.typeName || propsType);
        const propsDeclaration =
            propsSymbol &&
            firstDeclaration(resolveSymbol(ts, checker, propsSymbol));
        if (kind === 'component' && propsDeclaration) {
            const propsRef = repositoryRef(
                'kit',
                kitRoot,
                declarationSource(propsDeclaration, kitRoot),
                declarationLine(propsDeclaration),
            );
            if (propsRef) {
                related.props = dedupeRefs([...related.props, propsRef]);
            }
        }
        const record = {
            id: `govkit:${canonical}`,
            name: canonical,
            kind,
            runtime,
            exportNames: names,
            exports: names.map((name) => ({
                entrypoint: '.',
                name,
                isAlias: name !== canonical,
            })),
            members,
            source,
            props: related.props,
            stories: related.stories,
            tests: related.tests,
            docs: related.docs,
        };
        records.push(record);
        for (const name of names) {
            namesByKey.set(name, record);
        }
    }
    for (const record of records) {
        const propsSource = namesByKey.get(`I${record.name}Props`)?.source;
        if (record.kind === 'component' && propsSource) {
            record.props = dedupeRefs([...record.props, propsSource]);
        }
    }
    const recordsBySource = new Map(
        records
            .filter((record) => record.source)
            .map((record) => [
                `${record.source.repository}:${record.source.path}:${record.source.line}`,
                record,
            ]),
    );
    for (const record of records) {
        for (const member of record.members) {
            const direct = recordsBySource.get(
                `${member.source.repository}:${member.source.path}:${member.source.line}`,
            );
            if (direct) {
                member.id = direct.id;
                member.props = direct.props;
                member.exportNames = [
                    ...new Set([...member.exportNames, ...direct.exportNames]),
                ].sort((a, b) => a.localeCompare(b));
            }
        }
    }
    return {
        records,
        namesByKey,
        exportNames: exports
            .map((entry) => entry.name)
            .sort((a, b) => a.localeCompare(b)),
    };
}

function classifyUsageType(appRoot, filePath) {
    const relative = relativePath(appRoot, filePath);
    if (/\.(?:stories?|story)\.[^.]+$/iu.test(relative)) {
        return 'story';
    }
    if (
        /(?:^|[/\\])__tests__(?:[/\\])|\.(?:test|spec)\.[^.]+$/iu.test(relative)
    ) {
        return 'test';
    }
    if (/\.mdx?$/iu.test(relative)) {
        return 'docs';
    }
    return 'production';
}

function usageRef(
    appRoot,
    filePath,
    line,
    kind,
    usageType,
    localName,
    module,
    wrapperRef,
) {
    const ref = repositoryRef('app', appRoot, filePath, line);
    if (!ref) {
        return null;
    }
    return {
        ...ref,
        kind,
        usageType,
        localName,
        module,
        via: module === PACKAGE_NAME ? wrapperRef : null,
    };
}
function recordUsage(map, exportName, ref) {
    if (!ref) {
        return;
    }
    const refs = map.get(exportName) || [];
    refs.push(ref);
    map.set(exportName, refs);
}

function dedupeRefs(refs) {
    const seen = new Set();
    return refs
        .filter((ref) => {
            const key = `${ref.repository}:${ref.path}:${ref.line}:${ref.kind}:${ref.localName}:${ref.module}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        })
        .sort((a, b) =>
            `${a.path}:${a.line}:${a.kind}:${a.localName}`.localeCompare(
                `${b.path}:${b.line}:${b.kind}:${b.localName}`,
            ),
        );
}

function isImportBindingName(ts, id) {
    const parent = id.parent;
    if (!parent) {
        return false;
    }
    return (
        (ts.isImportSpecifier(parent) &&
            (parent.name === id || parent.propertyName === id)) ||
        (ts.isImportClause(parent) && parent.name === id) ||
        (ts.isNamespaceImport(parent) && parent.name === id)
    );
}

function isJsxTagReference(ts, id) {
    let current = id;
    while (
        current.parent &&
        ts.isPropertyAccessExpression(current.parent) &&
        current.parent.name === current
    ) {
        current = current.parent;
    }
    const parent = current.parent;
    return Boolean(
        parent &&
            (parent.kind === ts.SyntaxKind.JsxOpeningElement ||
                parent.kind === ts.SyntaxKind.JsxClosingElement ||
                parent.kind === ts.SyntaxKind.JsxSelfClosingElement) &&
            parent.tagName === current,
    );
}

function isReexportReference(ts, id) {
    let current = id.parent;
    while (current) {
        if (
            current.kind === ts.SyntaxKind.ExportSpecifier ||
            current.kind === ts.SyntaxKind.ExportDeclaration
        ) {
            return true;
        }
        if (
            current.kind === ts.SyntaxKind.SourceFile ||
            ts.isStatement(current)
        ) {
            return false;
        }
        current = current.parent;
    }
    return false;
}

function isTypeReference(ts, id) {
    let current = id.parent;
    while (current) {
        if (ts.isTypeNode(current)) {
            return true;
        }
        if (ts.isExpression(current) || ts.isStatement(current)) {
            return false;
        }
        current = current.parent;
    }
    return false;
}

function classifyRefKind(ts, id) {
    if (isJsxTagReference(ts, id)) {
        return 'jsx';
    }
    if (isReexportReference(ts, id)) {
        return 'reexport';
    }
    if (isTypeReference(ts, id)) {
        return 'type';
    }
    return 'value';
}

function leftmostIdentifier(ts, node) {
    let expression = node;
    while (ts.isPropertyAccessExpression(expression)) {
        expression = expression.expression;
    }
    return ts.isIdentifier(expression) ? expression : null;
}

function moduleForLocalSymbol(ts, symbol) {
    const declaration = symbol?.getDeclarations?.()?.[0];
    if (!declaration) {
        return '';
    }
    if (ts.isImportSpecifier(declaration)) {
        return declaration.parent.parent.parent.moduleSpecifier?.text || '';
    }
    if (ts.isImportClause(declaration)) {
        return declaration.parent.moduleSpecifier?.text || '';
    }
    if (ts.isNamespaceImport(declaration)) {
        return declaration.parent.parent.moduleSpecifier?.text || '';
    }
    if (ts.isExportSpecifier(declaration)) {
        return declaration.parent.parent.moduleSpecifier?.text || '';
    }
    return '';
}

function buildAppProgram(ts, appRoot, kitRoot) {
    const sourceRoot = path.join(appRoot, 'src');
    const kitIndexPath = path.join(kitRoot, 'src/index.ts');
    const wrapperPath = path.join(
        sourceRoot,
        'shared/lib/@aragon/gov-ui-kit.ts',
    );
    const tsconfigPath = path.join(appRoot, 'tsconfig.json');
    const configRead = exists(tsconfigPath)
        ? ts.readConfigFile(tsconfigPath, ts.sys.readFile)
        : { config: {} };
    if (configRead.error) {
        throw new Error(
            ts.flattenDiagnosticMessageText(configRead.error.messageText, '\n'),
        );
    }
    const parsed = ts.parseJsonConfigFileContent(
        configRead.config,
        ts.sys,
        appRoot,
        {},
        tsconfigPath,
    );
    const options = {
        ...parsed.options,
        allowJs: true,
        noEmit: true,
        skipLibCheck: true,
        jsx: parsed.options.jsx ?? ts.JsxEmit.ReactJSX,
        module: parsed.options.module ?? ts.ModuleKind.ESNext,
        moduleResolution:
            parsed.options.moduleResolution ?? ts.ModuleResolutionKind.Bundler,
        target: parsed.options.target ?? ts.ScriptTarget.ES2017,
        baseUrl: parsed.options.baseUrl || appRoot,
        paths: {
            ...parsed.options.paths,
            [PACKAGE_NAME]: parsed.options.paths?.[PACKAGE_NAME] || [
                exists(wrapperPath) ? wrapperPath : kitIndexPath,
            ],
            [ORIGINAL_PACKAGE_NAME]: [kitIndexPath],
        },
    };
    const rootFiles = walkFiles(sourceRoot).filter((file) =>
        SOURCE_EXTENSIONS.has(path.extname(file).toLowerCase()),
    );
    rootFiles.push(kitIndexPath);
    const program = ts.createProgram(rootFiles, options);
    return { program, kitIndexPath, wrapperPath, sourceRoot };
}

function buildKitSymbolIndex(ts, program, kitIndexPath, namesByKey) {
    const checker = program.getTypeChecker();
    const kitSource = program.getSourceFile(kitIndexPath);
    if (!kitSource) {
        throw new Error(
            `Combined program is missing kit entry: ${kitIndexPath}`,
        );
    }
    const moduleSymbol = checker.getSymbolAtLocation(kitSource);
    if (!moduleSymbol) {
        throw new Error(
            'TypeScript did not produce a module symbol for the kit entry',
        );
    }
    const exportedByName = new Map(
        checker
            .getExportsOfModule(moduleSymbol)
            .map((symbol) => [symbol.name, symbol]),
    );
    const symbolToNames = new Map();
    const addNames = (symbol, names) => {
        const resolved = resolveSymbol(ts, checker, symbol);
        const existing = symbolToNames.get(resolved) || new Set();
        for (const name of names) {
            existing.add(name);
        }
        symbolToNames.set(resolved, existing);
        return resolved;
    };
    const resolveProperty = (symbol, name) => {
        const declaration = firstDeclaration(symbol);
        let type;
        try {
            type = checker.getTypeOfSymbolAtLocation(
                symbol,
                declaration || kitSource,
            );
        } catch {
            return null;
        }
        const property = type.getProperty(name);
        if (!property) {
            return null;
        }
        let resolved = resolveSymbol(ts, checker, property);
        const propertyDeclaration = firstDeclaration(resolved);
        if (
            propertyDeclaration &&
            ts.isPropertyAssignment(propertyDeclaration)
        ) {
            const initializerSymbol = checker.getSymbolAtLocation(
                propertyDeclaration.initializer,
            );
            if (initializerSymbol) {
                resolved = resolveSymbol(ts, checker, initializerSymbol);
            }
        } else if (
            propertyDeclaration &&
            ts.isShorthandPropertyAssignment(propertyDeclaration)
        ) {
            const initializerSymbol =
                checker.getShorthandAssignmentValueSymbol(propertyDeclaration);
            if (initializerSymbol) {
                resolved = resolveSymbol(ts, checker, initializerSymbol);
            }
        }
        return resolved;
    };
    const records = new Set([...namesByKey.values()].filter(Boolean));
    const recordsById = new Map(
        [...records].map((record) => [record.id, record]),
    );
    const memberNamesByPath = new Map();
    const addMemberPaths = (prefix, member, seen = new Set()) => {
        memberNamesByPath.set(prefix, new Set(member.exportNames));
        const direct = recordsById.get(member.id);
        const marker = `${prefix}:${direct?.id || ''}`;
        if (!direct || seen.has(marker)) {
            return;
        }
        const nextSeen = new Set(seen).add(marker);
        for (const child of direct.members) {
            const suffix = child.name.startsWith(`${direct.name}.`)
                ? child.name.slice(direct.name.length)
                : `.${child.name}`;
            addMemberPaths(`${prefix}${suffix}`, child, nextSeen);
        }
    };
    for (const record of records) {
        for (const member of record.members) {
            addMemberPaths(member.name, member);
        }
    }
    for (const record of records) {
        const rootExport =
            exportedByName.get(record.name) ||
            exportedByName.get(record.exportNames[0]);
        if (!rootExport) {
            continue;
        }
        let current = addNames(rootExport, record.exportNames);
        for (const member of record.members) {
            current = addNames(rootExport, record.exportNames);
            for (const segment of member.name.split('.').slice(1)) {
                current = resolveProperty(current, segment);
                if (!current) {
                    break;
                }
            }
            if (current) {
                addNames(current, member.exportNames);
            }
        }
    }
    return { checker, symbolToNames, memberNamesByPath };
}

function resolveReferenceTarget(ts, checker, id) {
    let symbol = checker.getSymbolAtLocation(id);
    if (!symbol) {
        return null;
    }
    const declaration =
        symbol.valueDeclaration || symbol.getDeclarations?.()?.[0];
    if (declaration) {
        if (
            ts.isPropertyAssignment(declaration) &&
            ts.isIdentifier(declaration.initializer)
        ) {
            const target = checker.getSymbolAtLocation(declaration.initializer);
            if (target) {
                symbol = target;
            }
        } else if (ts.isShorthandPropertyAssignment(declaration)) {
            const target =
                checker.getShorthandAssignmentValueSymbol(declaration);
            if (target) {
                symbol = target;
            }
        }
    }
    return resolveSymbol(ts, checker, symbol);
}

function extractUsage(ts, appRoot, namesByKey, kitRoot) {
    const usage = new Map();
    const { program, kitIndexPath, wrapperPath, sourceRoot } = buildAppProgram(
        ts,
        appRoot,
        kitRoot,
    );
    const { checker, symbolToNames, memberNamesByPath } = buildKitSymbolIndex(
        ts,
        program,
        kitIndexPath,
        namesByKey,
    );
    const wrapperText = exists(wrapperPath)
        ? fs.readFileSync(wrapperPath, 'utf8')
        : '';
    const wrapperExportOffset = wrapperText.search(/\bexport\b/u);
    const wrapperLine =
        wrapperExportOffset < 0
            ? 1
            : wrapperText.slice(0, wrapperExportOffset).split('\n').length;
    const wrapperRef = repositoryRef('app', appRoot, wrapperPath, wrapperLine);
    const kitPrefix = `${path.resolve(kitRoot)}${path.sep}`;
    const appSrcPrefix = `${path.resolve(sourceRoot)}${path.sep}`;
    const recordStylesheet = (specifier, file, line) => {
        const name = specifier.match(
            /(?:^|\/node_modules\/)@aragon\/gov-ui-kit(?:-original)?\/(.+\.css)$/u,
        )?.[1];
        if (name && namesByKey.has(name)) {
            recordUsage(
                usage,
                name,
                usageRef(
                    appRoot,
                    file,
                    line,
                    'value',
                    classifyUsageType(appRoot, file),
                    name,
                    specifier,
                    null,
                ),
            );
        }
    };
    for (const sourceFile of program.getSourceFiles()) {
        const fileName = path.resolve(sourceFile.fileName);
        if (
            !fileName.startsWith(appSrcPrefix) ||
            fileName.startsWith(kitPrefix)
        ) {
            continue;
        }
        if (
            !SOURCE_EXTENSIONS.has(path.extname(fileName).toLowerCase()) ||
            fileName.endsWith('.d.ts')
        ) {
            continue;
        }
        const usageType = classifyUsageType(appRoot, fileName);
        const visit = (node) => {
            if (
                ts.isImportDeclaration(node) &&
                ts.isStringLiteral(node.moduleSpecifier)
            ) {
                recordStylesheet(
                    node.moduleSpecifier.text,
                    fileName,
                    sourceFile.getLineAndCharacterOfPosition(
                        node.getStart(sourceFile),
                    ).line + 1,
                );
            }
            if (ts.isIdentifier(node) && !isImportBindingName(ts, node)) {
                const isMember =
                    node.parent &&
                    ts.isPropertyAccessExpression(node.parent) &&
                    node.parent.name === node;
                const target = resolveReferenceTarget(ts, checker, node);
                let names = target && symbolToNames.get(target);
                if (!names && isMember) {
                    const memberText = node.parent.getText(sourceFile);
                    const baseId = leftmostIdentifier(ts, node.parent);
                    const baseTarget =
                        baseId && resolveReferenceTarget(ts, checker, baseId);
                    const baseNames =
                        baseTarget && symbolToNames.get(baseTarget);
                    if (baseNames && baseId) {
                        const suffix = memberText.slice(baseId.text.length);
                        for (const baseName of baseNames) {
                            names = memberNamesByPath.get(
                                `${baseName}${suffix}`,
                            );
                            if (names) {
                                break;
                            }
                        }
                    }
                }
                if (names) {
                    const line =
                        sourceFile.getLineAndCharacterOfPosition(
                            node.getStart(sourceFile),
                        ).line + 1;
                    const kind = classifyRefKind(ts, node);
                    const baseId = isMember
                        ? leftmostIdentifier(ts, node.parent)
                        : node;
                    const baseSymbol = baseId
                        ? checker.getSymbolAtLocation(baseId)
                        : null;
                    const module = moduleForLocalSymbol(ts, baseSymbol);
                    const localName = isMember
                        ? node.parent.getText(sourceFile)
                        : node.text;
                    for (const name of names) {
                        recordUsage(
                            usage,
                            name,
                            usageRef(
                                appRoot,
                                fileName,
                                line,
                                kind,
                                usageType,
                                localName,
                                module,
                                wrapperRef,
                            ),
                        );
                    }
                }
            }
            ts.forEachChild(node, visit);
        };
        visit(sourceFile);
    }
    const cssImport = /^\s*@import\s+(?:url\(\s*)?(['"])([^'"\r\n]+)\1/gmu;
    for (const file of walkFiles(sourceRoot).filter((candidate) =>
        candidate.endsWith('.css'),
    )) {
        const text = fs
            .readFileSync(file, 'utf8')
            .replace(/\/\*[\s\S]*?\*\//gu, (comment) =>
                comment.replace(/[^\n]/gu, ' '),
            );
        for (const match of text.matchAll(cssImport)) {
            const offset = match.index + match[0].indexOf('@import');
            recordStylesheet(
                match[2],
                file,
                text.slice(0, offset).split('\n').length,
            );
        }
    }
    for (const [name, refs] of usage) {
        usage.set(name, dedupeRefs(refs));
    }
    return usage;
}

function defaultIntent() {
    return {
        description: null,
        useWhen: [],
        constraints: [],
        related: [],
        ownership: { package: PACKAGE_NAME, domain: null, maintainer: null },
        evidence: [],
        evidenceStatus: [],
        review: { state: 'unreviewed', by: null, at: null },
        stale: false,
    };
}

function statusForEvidence(evidence, roots) {
    const root = evidence.repository === 'app' ? roots.appRoot : roots.kitRoot;
    const absolute = path.join(root, evidence.path);
    if (!exists(absolute)) {
        return {
            repository: evidence.repository,
            path: evidence.path,
            status: 'missing',
            expectedSha256: evidence.sha256,
            actualSha256: null,
        };
    }
    const actualSha256 = sha256(absolute);
    return {
        repository: evidence.repository,
        path: evidence.path,
        status: actualSha256 === evidence.sha256 ? 'current' : 'changed',
        expectedSha256: evidence.sha256,
        actualSha256,
    };
}

function mergeIntent(previous, component, roots) {
    const old =
        previous instanceof Map
            ? previous.get(component.id) ||
              previous.get(`govkit:${component.name}`)
            : previous?.[component.id] ||
              previous?.[`govkit:${component.name}`];
    const intent = { ...defaultIntent(), ...clone(old || {}) };
    intent.ownership = {
        ...defaultIntent().ownership,
        ...(old?.ownership || {}),
    };
    intent.review = { ...defaultIntent().review, ...(old?.review || {}) };
    intent.evidence = Array.isArray(old?.evidence) ? clone(old.evidence) : [];
    intent.evidenceStatus = intent.evidence.map((evidence) =>
        statusForEvidence(evidence, roots),
    );
    intent.stale =
        Boolean(old?.stale) ||
        intent.evidenceStatus.some((entry) => entry.status !== 'current');
    return intent;
}

function loadPreviousIntents(registryPath = REGISTRY_PATH) {
    if (!exists(registryPath)) {
        return { intents: new Map(), ids: new Set(), provenance: null };
    }
    const previous = readJson(registryPath);
    const intents = new Map();
    for (const component of previous.components || []) {
        if (component.intent) {
            intents.set(component.id, component.intent);
        }
    }
    return {
        intents,
        ids: new Set(
            (previous.components || []).map((component) => component.id),
        ),
        provenance: previous.provenance || null,
    };
}

function consumedDependency(appRoot) {
    const appPackagePath = path.join(appRoot, 'package.json');
    const appPackage = exists(appPackagePath) ? readJson(appPackagePath) : {};
    const declaredSpecifier =
        appPackage.dependencies?.[PACKAGE_NAME] ||
        appPackage.devDependencies?.[PACKAGE_NAME] ||
        appPackage.peerDependencies?.[PACKAGE_NAME] ||
        'unknown';
    const lockRoot = gitRootFor(appRoot);
    const lockPath = path.join(lockRoot || appRoot, 'pnpm-lock.yaml');
    if (!exists(lockPath)) {
        return {
            declaredSpecifier,
            lock: { specifier: 'unknown', version: null },
        };
    }
    const lockText = fs.readFileSync(lockPath, 'utf8');
    const importerStart = lockText.indexOf('\n  apps/app:\n');
    if (importerStart < 0) {
        return {
            declaredSpecifier,
            lock: { specifier: 'unknown', version: null },
        };
    }
    const nextImporter = lockText
        .slice(importerStart + 1)
        .search(/\n {2}[^\s].*:\n/u);
    const importer = lockText.slice(
        importerStart,
        nextImporter < 0 ? undefined : importerStart + 1 + nextImporter,
    );
    const match = importer.match(
        /\n\s+['"]?@aragon\/gov-ui-kit['"]?:\s*\n\s+specifier:\s*['"]?([^'"\n]+)['"]?\s*\n\s+version:\s*([^\s(]+)/u,
    );
    return {
        declaredSpecifier,
        lock: {
            specifier: match?.[1] || 'unknown',
            version: match?.[2] || null,
        },
    };
}

function artifactFiles(root, relativeRoot, predicate = () => true) {
    const absoluteRoot = path.join(root, relativeRoot);
    if (!exists(absoluteRoot)) {
        return null;
    }
    return walkFiles(absoluteRoot)
        .map((filePath) => relativePath(absoluteRoot, filePath))
        .filter(predicate)
        .sort();
}

function artifactTreesMatch(kitRoot, consumedRoot) {
    const compareTree = (relativeRoot, predicate) => {
        const kitFiles = artifactFiles(kitRoot, relativeRoot, predicate);
        const consumedFiles = artifactFiles(
            consumedRoot,
            relativeRoot,
            predicate,
        );
        if (
            !kitFiles ||
            !consumedFiles ||
            !isDeepStrictEqual(kitFiles, consumedFiles)
        ) {
            return false;
        }
        return kitFiles.every((relative) => {
            const kitPath = path.join(kitRoot, relativeRoot, relative);
            const consumedPath = path.join(
                consumedRoot,
                relativeRoot,
                relative,
            );
            return sha256(kitPath) === sha256(consumedPath);
        });
    };
    const fixedFilesMatch = ['index.css', 'build.css'].every((relative) => {
        const kitPath = path.join(kitRoot, relative);
        const consumedPath = path.join(consumedRoot, relative);
        return (
            exists(kitPath) &&
            exists(consumedPath) &&
            sha256(kitPath) === sha256(consumedPath)
        );
    });
    const sourceAssetMatch = compareTree(
        'src',
        (relative) =>
            relative.endsWith('.css') || relative.startsWith('theme/fonts/'),
    );
    return fixedFilesMatch && compareTree('dist') && sourceAssetMatch;
}

function makeProvenance(
    roots,
    exportsInfo,
    packageInfo,
    previousProvenance = null,
) {
    const installedRoot = roots.consumedRoot;
    const installedPackageJsonPath = path.join(installedRoot, 'package.json');
    const installedPackageJson = exists(installedPackageJsonPath)
        ? readJson(installedPackageJsonPath)
        : null;
    const dist = {};
    const addDistTarget = (target) => {
        if (
            !installedRoot ||
            typeof target !== 'string' ||
            !target.startsWith('.')
        ) {
            return;
        }
        const absolute = path.resolve(installedRoot, target);
        const root = path.resolve(installedRoot);
        if (absolute !== root && !absolute.startsWith(`${root}${path.sep}`)) {
            return;
        }
        if (exists(absolute)) {
            dist[relativePath(installedRoot, absolute)] = sha256(absolute);
        }
    };
    const exportTargets = (value) => {
        if (typeof value === 'string') {
            return [value];
        }
        if (Array.isArray(value)) {
            return value.flatMap(exportTargets);
        }
        if (value && typeof value === 'object') {
            return Object.values(value).flatMap(exportTargets);
        }
        return [];
    };
    if (installedRoot && installedPackageJson) {
        for (const key of ['main', 'types']) {
            addDistTarget(installedPackageJson[key]);
        }
        for (const [subpath, target] of Object.entries(
            installedPackageJson.exports || {},
        )) {
            if (subpath === '.' || /\.css$/u.test(subpath)) {
                for (const publishedTarget of exportTargets(target)) {
                    addDistTarget(publishedTarget);
                }
            }
        }
    }
    const dependency = consumedDependency(roots.appRoot);
    const appGitRoot = gitRootFor(roots.appRoot);
    const appGitPaths = appGitRoot
        ? [
              path.join(path.relative(appGitRoot, roots.appRoot), 'src'),
              path.join(
                  path.relative(appGitRoot, roots.appRoot),
                  'package.json',
              ),
              path.join(
                  path.relative(appGitRoot, roots.appRoot),
                  'tsconfig.json',
              ),
              'pnpm-workspace.yaml',
              'pnpm-lock.yaml',
              '.design-sync/config.json',
              '.design-sync/app-entry.ts',
          ]
        : ['src', 'package.json', 'tsconfig.json'];
    const kit = {
        root: 'kit',
        commit: gitCommit(roots.kitRoot),
        dirty: gitDirty(roots.kitRoot, ['.']),
        sourceVersion: packageInfo.version || 'unknown',
        entrypoints: { js: exportsInfo.js, css: exportsInfo.css },
    };
    const consumed = {
        specifier: PACKAGE_NAME,
        declaredSpecifier: dependency.declaredSpecifier,
        lock: dependency.lock,
        version: installedPackageJson?.version || 'unknown',
        root: 'consumed',
        dist,
        sourceEquivalence: 'unknown',
    };
    if (
        installedPackageJson?.version &&
        packageInfo.version &&
        installedPackageJson.version !== packageInfo.version
    ) {
        consumed.sourceEquivalence = 'diverged';
    } else if (
        kit.commit &&
        kit.dirty.length === 0 &&
        previousProvenance?.consumed?.sourceEquivalence === 'verified' &&
        previousProvenance.kit?.commit === kit.commit &&
        previousProvenance.kit?.dirty?.length === 0 &&
        previousProvenance.kit?.sourceVersion === kit.sourceVersion &&
        isDeepStrictEqual(
            previousProvenance.kit?.entrypoints,
            kit.entrypoints,
        ) &&
        previousProvenance.consumed?.version === consumed.version &&
        isDeepStrictEqual(previousProvenance.consumed?.dist, consumed.dist) &&
        artifactTreesMatch(roots.kitRoot, roots.consumedRoot)
    ) {
        consumed.sourceEquivalence = 'verified';
    }
    return {
        sourceRoots: {
            app: 'GOVKIT_APP_ROOT',
            kit: 'GOVKIT_KIT_ROOT',
            consumed: 'GOVKIT_CONSUMED_ROOT',
        },
        app: {
            root: 'app',
            commit: appGitRoot ? gitCommit(appGitRoot) : null,
            dirty: gitDirty(appGitRoot || roots.appRoot, appGitPaths),
            kitReexportBoundary: repositoryRef(
                'app',
                roots.appRoot,
                path.join(
                    roots.appRoot,
                    'src/shared/lib/@aragon/gov-ui-kit.ts',
                ),
                3,
            )
                ? {
                      path: relativePath(
                          roots.appRoot,
                          path.join(
                              roots.appRoot,
                              'src/shared/lib/@aragon/gov-ui-kit.ts',
                          ),
                      ),
                      sha256: sha256(
                          path.join(
                              roots.appRoot,
                              'src/shared/lib/@aragon/gov-ui-kit.ts',
                          ),
                      ),
                      note: 'The public app alias re-exports the original package; export-star is not counted as direct component usage.',
                  }
                : null,
        },
        kit,
        consumed,
    };
}

function buildRegistry(options = {}) {
    const roots = resolveRoots(options);
    const registryPath = options.registryPath || REGISTRY_PATH;
    const exportsInfo = extractExports(roots.kitRoot);
    const packageInfo = packageExports(roots.kitRoot);
    const usageNames = new Map(exportsInfo.namesByKey);
    for (const entrypoint of packageInfo.css) {
        usageNames.set(entrypoint.replace(/^\.\//u, ''), null);
    }
    const ts = loadTypeScript(roots.kitRoot);
    const usage = extractUsage(ts, roots.appRoot, usageNames, roots.kitRoot);
    const previous =
        options.preserveCurated === false
            ? { intents: new Map(), ids: new Set() }
            : loadPreviousIntents(registryPath);
    const records = exportsInfo.records.map((record) => {
        const usageNamesForRecord = [
            ...record.exportNames,
            ...record.members.flatMap((member) => member.exportNames),
        ];
        const refs = dedupeRefs(
            usageNamesForRecord.flatMap((name) => usage.get(name) || []),
        );
        return {
            ...record,
            usage: {
                found: refs.length > 0,
                reachableViaReexport: exists(
                    path.join(
                        roots.appRoot,
                        'src/shared/lib/@aragon/gov-ui-kit.ts',
                    ),
                ),
                scope: 'Static references in <app>/src TS/JS files, including import aliases, transparent re-exports and compound members. Bare unused imports, Markdown/MDX prose, kit-internal usage and runtime reachability are excluded.',
                refs,
            },
            intent: mergeIntent(previous.intents, record, roots),
        };
    });
    const cssRecords = packageInfo.css.map((entrypoint) => {
        const exportName = entrypoint.replace(/^\.\//u, '');
        const sourceFile = path.join(roots.kitRoot, exportName);
        const baseRecord = {
            id: `govkit:${exportName}`,
            name: exportName,
            kind: 'css',
            runtime: false,
            exportNames: [exportName],
            exports: [{ entrypoint, name: exportName, isAlias: false }],
            members: [],
            source: repositoryRef('kit', roots.kitRoot, sourceFile, 1),
            props: [],
            stories: [],
            tests: [],
            docs: [],
            usage: {
                found: (usage.get(exportName) || []).length > 0,
                reachableViaReexport: false,
                scope: 'Static JS/TS stylesheet imports and quoted CSS @import statements within <app>/src.',
                refs: dedupeRefs(usage.get(exportName) || []),
            },
        };
        return {
            ...baseRecord,
            intent: mergeIntent(previous.intents, baseRecord, roots),
        };
    });
    const components = [...records, ...cssRecords].sort((a, b) =>
        a.id.localeCompare(b.id),
    );
    const currentIds = new Set(components.map((component) => component.id));
    const orphaned = [...previous.ids].filter((id) => !currentIds.has(id));
    if (orphaned.length > 0 && options.failOnOrphan !== false) {
        throw new Error(
            `Curated intent references missing exports: ${orphaned.sort().join(', ')}`,
        );
    }
    return {
        schemaVersion: DEFAULT_SCHEMA_VERSION,
        provenance: makeProvenance(
            roots,
            packageInfo,
            packageInfo.packageJson,
            previous.provenance,
        ),
        components,
    };
}

function collectReferences(value, references = []) {
    if (!value || typeof value !== 'object') {
        return references;
    }
    if (
        value.repository &&
        value.path &&
        Number.isInteger(value.line) &&
        value.sha256
    ) {
        references.push(value);
        if (value.via && typeof value.via === 'object') {
            collectReferences(value.via, references);
        }
        return references;
    }
    for (const child of Object.values(value)) {
        collectReferences(child, references);
    }
    return references;
}

function validateReference(reference, roots, allowStale) {
    const root = path.resolve(
        reference.repository === 'app' ? roots.appRoot : roots.kitRoot,
    );
    const absolute = path.resolve(root, reference.path);
    if (absolute !== root && !absolute.startsWith(`${root}${path.sep}`)) {
        throw new Error(
            `Reference escapes ${reference.repository} root: ${reference.path}`,
        );
    }
    if (!exists(absolute)) {
        if (allowStale) {
            return;
        }
        throw new Error(
            `Missing ${reference.repository} reference: ${reference.path}`,
        );
    }
    const actual = sha256(absolute);
    if (actual !== reference.sha256 && !allowStale) {
        throw new Error(
            `Hash mismatch for ${reference.repository}:${reference.path} (expected ${reference.sha256}, got ${actual})`,
        );
    }
    const lineCount = fs.readFileSync(absolute, 'utf8').split('\n').length;
    if (reference.line > lineCount && !allowStale) {
        throw new Error(
            `Line ${reference.line} is outside ${reference.repository}:${reference.path}`,
        );
    }
}

function semanticValidate(registry, roots) {
    const ids = new Set();
    const names = new Set();
    const exportNames = new Set();
    const componentsByName = new Map();
    for (const component of registry.components) {
        if (ids.has(component.id)) {
            throw new Error(`Duplicate component id: ${component.id}`);
        }
        ids.add(component.id);
        if (names.has(component.name)) {
            throw new Error(`Duplicate component name: ${component.name}`);
        }
        names.add(component.name);
        componentsByName.set(component.name, component);
        for (const exportName of component.exportNames) {
            if (exportNames.has(exportName)) {
                throw new Error(`Duplicate public export name: ${exportName}`);
            }
            exportNames.add(exportName);
        }
        for (const reference of collectReferences(component)) {
            const isIntentEvidence =
                component.intent?.evidence?.includes(reference);
            const status = component.intent?.evidenceStatus?.find(
                (entry) =>
                    entry.repository === reference.repository &&
                    entry.path === reference.path,
            );
            validateReference(
                reference,
                roots,
                Boolean(
                    isIntentEvidence && status && status.status !== 'current',
                ),
            );
        }
        for (const related of component.intent.related) {
            if (
                !componentsByName.has(related.name) &&
                !registry.components.some((candidate) =>
                    candidate.exportNames.includes(related.name),
                )
            ) {
                throw new Error(
                    `${component.id} intent.related references unknown component: ${related.name}`,
                );
            }
        }
        const expectedStale = component.intent.evidenceStatus.some(
            (entry) => entry.status !== 'current',
        );
        if (
            expectedStale !== component.intent.stale &&
            !component.intent.stale
        ) {
            throw new Error(
                `${component.id} intent stale flag does not match evidenceStatus`,
            );
        }
        if (
            component.intent.review.state === 'human-reviewed' &&
            (!component.intent.review.by ||
                !component.intent.review.at ||
                component.intent.evidence.length === 0)
        ) {
            throw new Error(
                `${component.id} human-reviewed intent requires reviewer, date and evidence`,
            );
        }
    }
    return { ids, names, exportNames };
}

function validateRegistry(registry, options = {}) {
    const roots = resolveRoots(options);
    const Ajv = loadAjv(roots.kitRoot);
    const ajv = new Ajv({ allErrors: true, strict: false });
    const schema = readJson(SCHEMA_PATH);
    const validate = ajv.compile(schema);
    if (!validate(registry)) {
        const details = (validate.errors || [])
            .map((error) => `${error.instancePath || '/'} ${error.message}`)
            .join('; ');
        throw new Error(`Schema validation failed: ${details}`);
    }
    semanticValidate(registry, roots);
    return true;
}

function main(argv = process.argv.slice(2)) {
    const command = argv[0] || 'validate';
    if (command === 'extract') {
        const registry = buildRegistry({ preserveCurated: true });
        validateRegistry(registry);
        writeJson(REGISTRY_PATH, registry);
        process.stdout.write(
            `Extracted ${registry.components.length} registry records to ${relativePath(WORKSPACE_ROOT, REGISTRY_PATH)}\n`,
        );
        return;
    }
    if (command === 'validate') {
        const filePath = argv[1] ? path.resolve(argv[1]) : REGISTRY_PATH;
        const registry = readJson(filePath);
        validateRegistry(registry);
        process.stdout.write(
            `Validated ${registry.components.length} registry records\n`,
        );
        return;
    }
    if (command === 'check') {
        if (!exists(REGISTRY_PATH)) {
            throw new Error(`Registry does not exist: ${REGISTRY_PATH}`);
        }
        const current = readJson(REGISTRY_PATH);
        validateRegistry(current);
        const regenerated = buildRegistry({ preserveCurated: true });
        if (!isDeepStrictEqual(current, regenerated)) {
            throw new Error(
                `Registry is stale; run node ${relativePath(process.cwd(), SCRIPT_PATH)} extract`,
            );
        }
        process.stdout.write(
            `Registry is current (${current.components.length} records)\n`,
        );
        return;
    }
    throw new Error(
        `Unknown command ${command}; expected extract, validate or check`,
    );
}

export {
    buildRegistry,
    extractExports,
    extractUsage,
    main,
    semanticValidate,
    validateRegistry,
};

if (path.resolve(process.argv[1] || '') === path.resolve(SCRIPT_PATH)) {
    try {
        main();
    } catch (error) {
        process.stderr.write(
            `${error instanceof Error ? error.message : String(error)}\n`,
        );
        process.exitCode = 1;
    }
}
