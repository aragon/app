// Shared App source-of-truth for the .design-sync converter overrides
// (overrides/dts.mjs + overrides/emit.mjs). ONE ts-morph project over the
// app's design-sync tsconfig is the single place that knows which exports are
// App-owned, the App package identity, each name's source ref, and the
// source-derived child prop contracts of App compounds. Kit exports are never
// routed through this module.

import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(
    new URL('../../.ds-sync/package.json', import.meta.url),
);
const { Node, Project, SyntaxKind } = require('ts-morph');

import { propsBodyFor as basePropsBodyFor } from '../../.ds-sync/lib/dts.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DESIGN_SYNC = dirname(HERE);
const REPO_ROOT = dirname(DESIGN_SYNC);
export const APP_ROOT = join(REPO_ROOT, 'apps/app');
const APP_SRC = join(APP_ROOT, 'src');
const KIT_SRC = join(APP_SRC, 'shared/lib/@aragon/gov-ui-kit');
const TSCONFIG = join(APP_ROOT, 'tsconfig.json');
const APP_ENTRY = join(DESIGN_SYNC, 'app-entry.ts');
const APP_PKG = join(APP_ROOT, 'package.json');
const fwd = (p) => p.split('\\').join('/');
const APP_OWNERSHIP_ROOT = fwd(REPO_ROOT);
const APP_SRC_ROOT = fwd(APP_SRC);
const KIT_SRC_ROOT = fwd(KIT_SRC);
const TS_LIB = /\/typescript\/lib\//;

let cache;
const contractCache = new Map();
const dependencyCache = new Map();
const preludeCache = new Map();

function appProject() {
    // app-entry.ts lives outside apps/app, so normal upward node resolution
    // cannot see the app's React package. Keep the app's aliases and point the
    // two public type packages at the declarations shipped by apps/app.
    const configProject = new Project({
        tsConfigFilePath: TSCONFIG,
        skipAddingFilesFromTsConfig: true,
    });
    const compilerOptions = configProject.getCompilerOptions();
    const paths = { ...(compilerOptions.paths ?? {}) };
    paths.react = ['node_modules/@types/react/index.d.ts'];
    paths['react/*'] = ['node_modules/@types/react/*'];
    paths['react-hook-form'] = ['node_modules/react-hook-form'];
    paths['react-hook-form/*'] = ['node_modules/react-hook-form/*'];
    const reactDomTypes = join(
        APP_ROOT,
        'node_modules/@types/react-dom/index.d.ts',
    );
    if (existsSync(reactDomTypes)) {
        paths['react-dom'] = ['node_modules/@types/react-dom/index.d.ts'];
        paths['react-dom/*'] = ['node_modules/@types/react-dom/*'];
    }
    return new Project({
        tsConfigFilePath: TSCONFIG,
        skipAddingFilesFromTsConfig: false,
        compilerOptions: { ...compilerOptions, baseUrl: APP_ROOT, paths },
    });
}

// Build the project + owned surface once. Fail loud rather than silently
// degrading: a missing entry means the App layer cannot be described.
export function appOwnership() {
    if (cache) {
        return cache;
    }
    for (const [label, p] of [
        ['tsconfig', TSCONFIG],
        ['app-entry', APP_ENTRY],
        ['app package.json', APP_PKG],
    ]) {
        if (!existsSync(p)) {
            throw new Error(
                `[app-ownership] required ${label} missing at ${p}`,
            );
        }
    }
    const project = appProject();
    const entry =
        project.getSourceFile(APP_ENTRY) ??
        project.addSourceFileAtPath(APP_ENTRY);
    const owned = new Map();
    for (const [name, decls] of entry.getExportedDeclarations()) {
        if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) {
            continue;
        }
        owned.set(name, decls);
    }
    const pkg = JSON.parse(readFileSync(APP_PKG, 'utf8'));
    cache = {
        project,
        entry,
        owned,
        pkgDir: APP_OWNERSHIP_ROOT,
        appPkg: { name: pkg.name, version: pkg.version },
        // Packages a downstream consumer can actually resolve. Types from any
        // other (transitive) package must degrade to a local opaque alias.
        dependencies: new Set(
            Object.keys({
                ...pkg.dependencies,
                ...pkg.peerDependencies,
            }),
        ),
    };
    return cache;
}

export function owns(name) {
    return appOwnership().owned.has(name);
}

// Source ref for the App declaration header/importPaths: the file that
// actually declares the value, repo-relative. Falls back to app-entry for
// bundle-local composites (Page, FormWrapper).
export function srcRefFor(name) {
    const o = appOwnership();
    const decls = o.owned.get(name);
    if (!decls || !decls.length) {
        return null;
    }
    const d = decls.find((x) => !Node.isSourceFile(x)) ?? decls[0];
    const fp = fwd(d.getSourceFile().getFilePath());
    return relative(REPO_ROOT, fp).split('\\').join('/');
}

export function appCtx() {
    const o = appOwnership();
    return {
        project: o.project,
        entry: o.entry.getFilePath(),
        pkgDir: o.pkgDir,
    };
}

function valueDeclaration(name, sourceFile = appOwnership().entry) {
    const decls = sourceFile?.getExportedDeclarations?.().get(name) ?? [];
    return (
        decls.find(
            (d) =>
                Node.isVariableDeclaration(d) ||
                Node.isFunctionDeclaration(d) ||
                Node.isClassDeclaration(d),
        ) ?? decls[0]
    );
}

function propsDeclaration(type) {
    const symbols = [type?.getAliasSymbol?.(), type?.getSymbol?.()].filter(
        Boolean,
    );
    for (const symbol of symbols) {
        const target = symbol.getAliasedSymbol?.() ?? symbol;
        const decls = target.getDeclarations?.() ?? [];
        const decl = decls.find(
            (d) =>
                Node.isInterfaceDeclaration(d) ||
                Node.isTypeAliasDeclaration(d),
        );
        if (decl) {
            return decl;
        }
    }
    return null;
}

function scopedProject(project, sourceFile) {
    // base propsBodyFor intentionally searches project.getSourceFiles(). A
    // one-file facade preserves its checker/getSourceFile access while stopping
    // same-name Props declarations in unrelated app files from winning.
    return {
        getSourceFiles: () => (sourceFile ? [sourceFile] : []),
        getSourceFile: (filePath) => project.getSourceFile(filePath),
    };
}

function contractForValue(value, fallbackName) {
    if (!value) {
        return null;
    }
    if (contractCache.has(value)) {
        return contractCache.get(value);
    }
    const valueType = value.getType?.();
    let signature = valueType?.getCallSignatures?.()[0];
    let parameter = signature?.getParameters?.()[0];
    if (!signature) {
        // React-typed component wrappers reach here with no call signature:
        // `React.FC<IXProps>` (type node) and `forwardRef<El, IXProps>(...)`
        // (initializer call type args) both carry the props AS SYNTAX. Reading
        // it from the AST keeps the contract path independent of the checker
        // resolving React's named exports (react-hook-form@7.86's package
        // exports resist the ts-morph 5.9 checker, so the checker-typed path
        // degrades these to any).
        return contractForSyntax({ value, fallbackName, contractCache });
    }
    const propsType = parameter?.getTypeAtLocation?.(value);
    if (!propsType) {
        contractCache.set(value, null);
        return null;
    }
    const declaration = propsDeclaration(propsType);
    const sourceFile = declaration?.getSourceFile?.() ?? value.getSourceFile();
    const candidate =
        declaration?.getName?.()?.replace(/Props$/, '') || fallbackName;
    return contractForProps({
        value,
        candidate,
        sourceFile,
        propsType,
        decl: declaration,
        contractCache,
        signature,
        parameter,
        fallbackName,
    });
}

// `export const X: React.FC<IXProps>` / `forwardRef<El, IXProps>(...)` both
// carry the props contract as syntax. See contractForValue's doc for why the
// checker cannot be trusted on this path.
//
// A synthetic alias (`type DocumentParserProps = ComponentProps<typeof
// DocumentParser>`) has no own members: its contract is the WRAPPED
// component's own props. peelSyntheticProps follows alias -> ComponentProps
// -> typeof X -> the X import binding -> X's declaration, entirely in syntax.
function contractForSyntax({ value, fallbackName, contractCache }) {
    const fwdRef = value.getInitializer?.();
    const fwdArgs =
        fwdRef && Node.isCallExpression(fwdRef)
            ? fwdRef.getTypeArguments?.()
            : [];
    const explicitType = value.getTypeNode?.();
    const propsCandidate =
        (fwdArgs.length >= 2 ? fwdArgs[1] : null) ??
        explicitType?.getTypeArguments?.()?.[0];
    const propsType = propsCandidate?.getType?.();
    if (!(propsType && propsCandidate)) {
        contractCache.set(value, null);
        return null;
    }

    let declaration = propsDeclaration(propsType);
    let candidateSourceFile;
    if (!declaration) {
        // The props type is a name in the COMPONENT'S OWN FILE
        // (`export const X: React.FC<IXProps>` declares the interface
        // alongside, `type DocumentParserProps = ...` as a sibling alias).
        const componentFile = value.getSourceFile();
        const rawName = propsCandidate.getText();
        declaration =
            componentFile.getInterface?.(rawName) ??
            componentFile.getTypeAlias?.(rawName);
        candidateSourceFile = componentFile;
    }
    if (declaration) {
        const wrapped = peelSyntheticProps(declaration, contractCache);
        if (wrapped) {
            const [underlyingDecl, underlyingFile] = wrapped;
            declaration = underlyingDecl;
            candidateSourceFile = underlyingFile;
        }
    }
    const sourceFile =
        candidateSourceFile ??
        declaration?.getSourceFile?.() ??
        value.getSourceFile();
    const candidate =
        declaration?.getName?.()?.replace(/Props$/, '') ?? fallbackName;
    return contractForProps({
        value,
        candidate,
        sourceFile,
        propsType,
        decl: declaration,
        contractCache,
        signature: null,
        parameter: null,
        fallbackName,
    });
}

// `type XProps = ComponentProps<typeof Wrapped>` - the alias is a pure
// pass-through and the interface we need lives on the wrapped component.
function peelSyntheticProps(aliasDecl, contractCache) {
    if (!Node.isTypeAliasDeclaration(aliasDecl)) {
        return null;
    }
    const typeNode = aliasDecl.getTypeNode?.();
    const wrapped = typeNode?.getTypeArguments?.()?.[0];
    const typeQuery = wrapped && wrapped.getKindName() === 'TypeQuery'
        ? wrapped
        : null;
    if (!typeQuery) {
        return null;
    }
    const id = typeQuery.getChildren?.().find(
        (child) => child.getKindName() === 'Identifier',
    );
    if (!id) {
        return null;
    }
    // The identifier is a local binding: find its import and resolve the
    // imported name's declaration (the wrapped component) via its symbol.
    const sourceFile = aliasDecl.getSourceFile();
    const binding = findBinding(sourceFile, id.getText());
    if (!binding) {
        return null;
    }
    const decl = binding.getDeclarations?.()[0];
    if (!decl || !Node.isVariableDeclaration(decl)) {
        return null;
    }
    // The wrapped component's props contract, read from ITS FC/forwardRef
    // syntax.
    const wrappedContract = contractForSyntax({
        value: decl,
        fallbackName: decl.getName?.(),
        contractCache,
    });
    return wrappedContract
        ? [wrappedContract.declaration, wrappedContract.declaration?.getSourceFile?.()]
        : null;
}

function findBinding(sourceFile, name) {
    for (const imp of sourceFile.getImportDeclarations?.() ?? []) {
        const bound = imp
            .getNamedImports?.()
            .find?.((n) => n.getName?.() === name);
        if (bound) {
            return bound.getSymbol?.()?.getAliasedSymbol?.() ?? bound.getSymbol?.();
        }
        const std = imp.getDefaultImport?.();
        if (std?.getName?.() === name) {
            return std.getSymbol?.()?.getAliasedSymbol?.() ?? std.getSymbol?.();
        }
        if (imp.getModuleSpecifierValue?.() === name) {
            return null;
        }
    }
    return null;
}

function contractForProps({ value, candidate, sourceFile, propsType, decl, contractCache, signature = null, parameter = null, fallbackName = '' }) {
    const o = appOwnership();
    const ctx = {
        project: scopedProject(o.project, sourceFile),
        entry: value.getSourceFile().getFilePath(),
        pkgDir: o.pkgDir,
    };
    let props = basePropsBodyFor(candidate, ctx);
    if (!props && candidate !== fallbackName) {
        props = basePropsBodyFor(fallbackName, ctx);
    }
    let contract;
    if (props) {
        contract = restoreNamedTypes({
            value,
            signature,
            parameter,
            propsType,
            declaration: decl,
            props,
        });
    } else if (decl) {
        // A Props interface EXISTS but emits zero own properties
        // (`IContainerProps extends ComponentProps<'div'> {}`). emitBody
        // returns null for an empty body, which the fallback above would
        // otherwise misread as "no source contract". An empty contract is
        // still a contract - the component takes only inherited props.
        contract = {
            value,
            signature,
            parameter,
            propsType,
            declaration: decl,
            props: {
                body: '',
                generics: '',
                extendsClause: '',
                prelude: '',
            },
        };
    }
    contractCache.set(value, contract);
    return contract;
}

// The base renderer falls back to `unknown` for any type whose text exceeds its
// length cap, which silently erases wide enums: `icon?: IconType` (600+ members)
// becomes `icon?: unknown`. The alias symbol still knows the real name, so the
// name is restored here. The import is emitted by the existing prelude pass,
// which keys off the identifiers actually present in the body.
function restoreNamedTypes(contract) {
    const body = contract?.props?.body;
    if (!body?.includes(': unknown')) {
        return contract;
    }
    const at = contract.declaration ?? contract.value;
    const named = new Map();
    for (const property of contract.propsType
        ?.getApparentType?.()
        .getProperties?.() ?? []) {
        const type = property.getTypeAtLocation?.(at);
        // The whole type first: a wide enum IS a union, and only the union
        // itself carries the alias symbol its members lack.
        const candidates = [
            type,
            ...(type?.isUnion?.() ? type.getUnionTypes() : []),
        ];
        for (const candidate of candidates) {
            const alias =
                candidate?.getAliasSymbol?.() ?? candidate?.getSymbol?.();
            const name = alias?.getName?.();
            const declaration = symbolDeclarations(alias).types[0];
            if (!name || name === '__type' || !declaration) {
                continue;
            }
            // Only a name a consumer can actually resolve: a declared package
            // export, or an App type the prelude will emit alongside.
            const packageName = packageFor(declaration);
            if (
                packageName
                    ? appOwnership().dependencies.has(packageName)
                    : appDeclaration(declaration)
            ) {
                named.set(property.getName(), name);
                break;
            }
        }
    }
    // `unknown | X` already REDUCES to `unknown` in TypeScript, so listing the
    // surviving members only suggests a precision the contract does not have.
    // Say `unknown` once. Dropping the `unknown` member instead would be the
    // lie: it would claim X is the whole accepted type.
    const collapsed = body.replace(
        /^(\s*)("?[\w$]+"?)(\??): unknown \|.*;$/gm,
        '$1$2$3: unknown;',
    );
    if (!named.size) {
        contract.props =
            collapsed === body
                ? contract.props
                : { ...contract.props, body: collapsed };
        return contract;
    }
    contract.props = {
        ...contract.props,
        body: collapsed.replace(
            /^(\s*)("?[\w$]+"?)(\??): unknown;$/gm,
            (line, indent, key, optional) => {
                const name = named.get(key.replace(/"/g, ''));
                return name ? `${indent}${key}${optional}: ${name};` : line;
            },
        ),
    };
    return contract;
}

function childValueDeclaration(child) {
    const o = appOwnership();
    const source = child.file ? o.project.getSourceFile(child.file) : null;
    return valueDeclaration(child.underlyingName, source);
}

function contractForChild(child) {
    const value = childValueDeclaration(child);
    return contractForValue(value, child.underlyingName);
}

// PascalCase, callable members of a compound object export (WizardPage ->
// {Container, Step}; Page -> {Container, Header, ...}). Each member resolves
// to the underlying component declaration so its own props can be derived.
export function compoundMembers(name) {
    const o = appOwnership();
    const decls = o.owned.get(name);
    if (!decls) {
        return [];
    }
    const d = decls.find((x) => Node.isVariableDeclaration(x)) ?? decls[0];
    if (!d || Node.isSourceFile(d)) {
        return [];
    }
    const members = [];
    for (const p of d.getType().getProperties()) {
        const pn = p.getName();
        if (!/^[A-Z][a-zA-Z0-9]*$/.test(pn)) {
            continue;
        }
        const pt = p.getTypeAtLocation(d);
        const pd = p
            .getDeclarations()
            .find((x) => Node.isPropertyAssignment(x));
        const init = pd?.getInitializer?.();
        const symbol = init?.getSymbol?.();
        const target = symbol?.getAliasedSymbol?.() ?? symbol;
        const md = target?.getDeclarations?.()[0] ?? pd;
        const underlyingNameResolved = target?.getName?.();
        const fileResolved =
            md ? fwd(md.getSourceFile().getFilePath()) : null;
        // Resolve the member BEFORE the call-signature filter: a member whose
        // props contract exists is a real compound member even when ts-morph
        // reports no call signature on the aliased type (React.FC members).
        const signature =
            md?.getType?.().getCallSignatures?.()[0] ??
            pt.getCallSignatures()[0];
        if (!signature) {
            const child = {
                member: pn,
                underlyingName: underlyingNameResolved ?? pn,
                file: fileResolved,
            };
            if (!contractForChild(child)) {
                continue;
            }
        }
        const generics =
            signature
                ?.getTypeParameters?.()
                .map((parameter) => parameter.getText()) ?? [];
        let underlyingName = underlyingNameResolved ?? pn;
        let file = fileResolved;
        if (md) {
            file = fwd(md.getSourceFile().getFilePath());
            if (!/^[A-Z]/.test(underlyingName)) {
                underlyingName = pn;
            }
        }
        members.push({
            member: pn,
            underlyingName,
            file,
            generics: generics.length ? `<${generics.join(', ')}>` : '',
        });
    }
    return members;
}

export function compoundRootCallable(name) {
    const o = appOwnership();
    const decls = o.owned.get(name);
    const d = decls?.find((x) => Node.isVariableDeclaration(x)) ?? decls?.[0];
    return (
        !!d &&
        !Node.isSourceFile(d) &&
        d.getType().getCallSignatures().length > 0
    );
}

function declarationKey(declaration) {
    return `${fwd(declaration.getSourceFile().getFilePath())}:${declaration.getStart()}`;
}

function packageFor(declaration) {
    const file = fwd(declaration.getSourceFile().getFilePath());
    if (TS_LIB.test(file)) {
        return null;
    }
    // A declaration in a non-module file is a global (lib.dom re-declarations
    // such as HTMLAnchorElement live in @types/react/global.d.ts). Globals are
    // already in scope for the consumer and must never become imports.
    if (!declaration.getSourceFile().compilerNode.externalModuleIndicator) {
        return null;
    }
    if (file.startsWith(`${KIT_SRC_ROOT}/`)) {
        return '@aragon/gov-ui-kit';
    }
    const parts = file.split('/');
    let packageName = null;
    for (let i = 0; i < parts.length; i += 1) {
        if (parts[i] !== 'node_modules') {
            continue;
        }
        const next = parts[i + 1];
        if (!next || next === '.pnpm') {
            continue;
        }
        packageName = next.startsWith('@') ? `${next}/${parts[i + 2]}` : next;
    }
    if (!packageName) {
        return null;
    }
    if (packageName.startsWith('@types/')) {
        return packageName.slice('@types/'.length);
    }
    return packageName;
}

function appDeclaration(declaration) {
    const file = fwd(declaration.getSourceFile().getFilePath());
    return file === fwd(APP_ENTRY) || file.startsWith(`${APP_SRC_ROOT}/`);
}

function symbolDeclarations(symbol) {
    const target = symbol?.getAliasedSymbol?.() ?? symbol;
    const decls = target?.getDeclarations?.() ?? [];
    return {
        target,
        decls,
        types: decls.filter(
            (d) =>
                Node.isInterfaceDeclaration(d) ||
                Node.isTypeAliasDeclaration(d) ||
                Node.isEnumDeclaration(d),
        ),
    };
}

function typeKey(type, at) {
    try {
        return `${type.getFlags()}:${type.getText(at)}`;
    } catch {
        return String(type);
    }
}

function emptyDependencies() {
    return { app: new Map(), external: new Map() };
}

function rememberSymbolObject(symbol, state, seenDeclarations, depth) {
    const { target, decls, types } = symbolDeclarations(symbol);
    const declaration = types[0] ?? decls[0];
    if (!declaration || Node.isTypeParameterDeclaration(declaration)) {
        return;
    }
    const packageName = packageFor(declaration);
    const name = target?.getName?.() ?? symbol.getName?.();
    if (packageName) {
        if (name) {
            state.external.set(name, packageName);
        }
        return;
    }
    if (!appDeclaration(declaration)) {
        return;
    }
    for (const typeDeclaration of types) {
        const key = declarationKey(typeDeclaration);
        if (state.app.has(key)) {
            continue;
        }
        state.app.set(key, typeDeclaration);
        walkDeclaration(typeDeclaration, state, seenDeclarations, depth + 1);
    }
}

function rememberSymbol(type, state, seenDeclarations, depth) {
    for (const symbol of [type?.getAliasSymbol?.(), type?.getSymbol?.()].filter(
        Boolean,
    )) {
        rememberSymbolObject(symbol, state, seenDeclarations, depth);
    }
}

function walkTypeNode(node, at, state, seenDeclarations, depth = 0) {
    if (!node || depth > 40) {
        return;
    }
    const references = [];
    if (node.getKind?.() === SyntaxKind.TypeReference) {
        references.push(node);
    }
    references.push(
        ...(node.getDescendantsOfKind?.(SyntaxKind.TypeReference) ?? []),
    );
    for (const reference of references) {
        const name = reference.getTypeName?.();
        rememberSymbolObject(
            name?.getSymbol?.() ?? name?.getAliasSymbol?.(),
            state,
            seenDeclarations,
            depth,
        );
    }
    const imports = [];
    if (node.getKind?.() === SyntaxKind.ImportType) {
        imports.push(node);
    }
    imports.push(...(node.getDescendantsOfKind?.(SyntaxKind.ImportType) ?? []));
    for (const importType of imports) {
        const qualifier = importType.getQualifier?.();
        rememberSymbolObject(
            qualifier?.getSymbol?.() ?? qualifier?.getAliasSymbol?.(),
            state,
            seenDeclarations,
            depth,
        );
    }
    const type = node.getType?.();
    if (type) {
        walkType(type, at, state, seenDeclarations, depth);
    }
}

function walkDeclaration(declaration, state, seenDeclarations, depth) {
    if (!declaration || depth > 40) {
        return;
    }
    const key = declarationKey(declaration);
    if (seenDeclarations.has(key)) {
        return;
    }
    seenDeclarations.add(key);
    for (const parameter of declaration.getTypeParameters?.() ?? []) {
        const constraintNode = parameter.getConstraintNode?.();
        const defaultNode = parameter.getDefaultNode?.();
        walkTypeNode(
            constraintNode,
            parameter,
            state,
            seenDeclarations,
            depth + 1,
        );
        walkTypeNode(
            defaultNode,
            parameter,
            state,
            seenDeclarations,
            depth + 1,
        );
    }
    if (Node.isInterfaceDeclaration(declaration)) {
        for (const base of declaration.getExtends?.() ?? []) {
            walkTypeNode(base, declaration, state, seenDeclarations, depth + 1);
        }
    }
    if (Node.isTypeAliasDeclaration(declaration)) {
        walkTypeNode(
            declaration.getTypeNode?.(),
            declaration,
            state,
            seenDeclarations,
            depth + 1,
        );
    }
    for (const property of declaration.getProperties?.() ?? []) {
        walkTypeNode(
            property.getTypeNode?.(),
            property,
            state,
            seenDeclarations,
            depth + 1,
        );
    }
    for (const method of declaration.getMethods?.() ?? []) {
        for (const parameter of method.getParameters?.() ?? []) {
            walkTypeNode(
                parameter.getTypeNode?.(),
                parameter,
                state,
                seenDeclarations,
                depth + 1,
            );
        }
        walkTypeNode(
            method.getReturnTypeNode?.(),
            method,
            state,
            seenDeclarations,
            depth + 1,
        );
    }
    for (const signature of declaration.getCallSignatures?.() ?? []) {
        for (const parameter of signature.getParameters?.() ?? []) {
            walkTypeNode(
                parameter.getTypeNode?.(),
                declaration,
                state,
                seenDeclarations,
                depth + 1,
            );
        }
        walkType(
            signature.getReturnType?.(),
            declaration,
            state,
            seenDeclarations,
            depth + 1,
        );
    }
}

function walkType(
    type,
    at,
    state,
    seenDeclarations,
    depth = 0,
    seenTypes = new Set(),
) {
    if (!type || depth > 40) {
        return;
    }
    const key = typeKey(type, at);
    if (seenTypes.has(key)) {
        return;
    }
    seenTypes.add(key);
    rememberSymbol(type, state, seenDeclarations, depth);
    for (const argument of type.getTypeArguments?.() ?? []) {
        walkType(argument, at, state, seenDeclarations, depth + 1, seenTypes);
    }
    if (type.isArray?.()) {
        walkType(
            type.getArrayElementType?.(),
            at,
            state,
            seenDeclarations,
            depth + 1,
            seenTypes,
        );
    }
    const members = type.isUnion?.()
        ? type.getUnionTypes?.()
        : type.isIntersection?.()
          ? type.getIntersectionTypes?.()
          : [];
    for (const member of members ?? []) {
        walkType(member, at, state, seenDeclarations, depth + 1, seenTypes);
    }
    for (const signature of [
        ...(type.getCallSignatures?.() ?? []),
        ...(type.getConstructSignatures?.() ?? []),
    ]) {
        for (const parameter of signature.getParameters?.() ?? []) {
            walkType(
                parameter.getTypeAtLocation?.(at),
                at,
                state,
                seenDeclarations,
                depth + 1,
                seenTypes,
            );
        }
        walkType(
            signature.getReturnType?.(),
            at,
            state,
            seenDeclarations,
            depth + 1,
            seenTypes,
        );
    }
    const symbol = type.getSymbol?.();
    const symbolName = symbol?.getName?.();
    if (!symbolName || symbolName === '__type') {
        for (const property of type.getProperties?.() ?? []) {
            walkType(
                property.getTypeAtLocation?.(at),
                at,
                state,
                seenDeclarations,
                depth + 1,
                seenTypes,
            );
        }
    }
}
function bodyPropertyNames(body) {
    const names = new Set();
    for (const match of String(body ?? '').matchAll(
        /^\s*(?:"([^"]+)"|([A-Za-z_$][\w$]*))\??\s*:/gm,
    )) {
        names.add(match[1] ?? match[2]);
    }
    return names;
}

function dependenciesFor(contract) {
    if (dependencyCache.has(contract)) {
        return dependencyCache.get(contract);
    }
    const state = emptyDependencies();
    const declaration = contract.declaration;
    const at = declaration ?? contract.value;
    // Generic parameters carry real API names (`<T extends FieldValues>`).
    // Declaration nodes expose constraint/default nodes; a signature exposes
    // them only as types, so both shapes are walked.
    for (const parameter of declaration?.getTypeParameters?.() ?? []) {
        const seen = new Set();
        walkTypeNode(
            parameter.getConstraintNode?.(),
            parameter,
            state,
            seen,
            0,
        );
        walkTypeNode(parameter.getDefaultNode?.(), parameter, state, seen, 0);
    }
    for (const parameter of contract.signature?.getTypeParameters?.() ?? []) {
        const seen = new Set();
        walkType(parameter.getConstraint?.(), at, state, seen, 0);
        walkType(parameter.getDefault?.(), at, state, seen, 0);
    }
    const names = bodyPropertyNames(contract.props?.body);
    for (const property of contract.propsType
        ?.getApparentType?.()
        .getProperties?.() ?? []) {
        if (!names.has(property.getName())) {
            continue;
        }
        const seen = new Set();
        for (const propertyDeclaration of property.getDeclarations?.() ?? []) {
            walkTypeNode(
                propertyDeclaration.getTypeNode?.(),
                propertyDeclaration,
                state,
                seen,
                0,
            );
        }
        walkType(property.getTypeAtLocation?.(at), at, state, seen, 0);
    }
    dependencyCache.set(contract, state);
    return state;
}

function mergeDependencies(contracts) {
    const merged = emptyDependencies();
    for (const contract of contracts.filter(Boolean)) {
        const state = dependenciesFor(contract);
        for (const [key, declaration] of state.app) {
            if (!merged.app.has(key)) {
                merged.app.set(key, declaration);
            }
        }
        for (const [name, packageName] of state.external) {
            if (!merged.external.has(name)) {
                merged.external.set(name, packageName);
            }
        }
    }
    return merged;
}

function identifierUsed(text, name) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|[^\\w$.])${escaped}(?![\\w$])`).test(text);
}

const REACT_NAMESPACE_TYPES = new Set([
    // These resolve as BARE imported types in the prelude ('react' import
    // emitted below), not as React.namespace members: the emitted body should
    // keep them bare. The qualify pass then only needs to skip names that
    // 'react' already contributes via this import.
    'ReactNode',
    'ReactElement',
    'Key',
    'Ref',
    'RefObject',
    'ComponentType',
    'FunctionComponent',
    'FC',
    'Element',
]);

// Doc comments repeat type names in prose ("Translations for the selected
// language"), so reachability is decided on code only.
function code(text) {
    return String(text ?? '')
        .replace(/\/\*[\s\S]*?\*\//g, ' ')
        .replace(/\/\/.*$/gm, ' ');
}

function formatPrelude(contracts) {
    const key = contracts
        .filter(Boolean)
        .map((contract) => declarationKey(contract.value))
        .join('|');
    if (preludeCache.has(key)) {
        return preludeCache.get(key);
    }
    const state = mergeDependencies(contracts);
    // Only what the emitted contract actually reaches: the renderer degrades
    // some property types to `unknown`, and their source declarations must not
    // ride along (a dropped `typeof` value reference would not even compile).
    const byName = new Map();
    for (const declaration of state.app.values()) {
        const name = declaration.getName?.();
        if (name) {
            byName.set(name, declaration);
        }
    }
    const kept = new Map();
    let text = code(
        contracts
            .filter(Boolean)
            .map(
                (contract) =>
                    `${contract.props?.body ?? ''}\n${contract.props?.generics ?? ''}\n${contract.props?.extendsClause ?? ''}`,
            )
            .join('\n'),
    );
    for (let grew = true; grew; ) {
        grew = false;
        for (const [name, declaration] of byName) {
            if (kept.has(name) || !identifierUsed(text, name)) {
                continue;
            }
            kept.set(name, declaration);
            text += `\n${code(declaration.getText())}`;
            grew = true;
        }
    }
    const { dependencies } = appOwnership();
    const imports = new Map();
    const aliases = [];
    for (const [name, packageName] of state.external) {
        if (!identifierUsed(text, name)) {
            continue;
        }
        if (packageName === 'react' && REACT_NAMESPACE_TYPES.has(name)) {
            continue;
        }
        // A transitive install is not resolvable for the bundle consumer, so
        // the type stays opaque instead of emitting an unresolvable import.
        if (!dependencies.has(packageName)) {
            aliases.push(
                `/** Opaque external type from ${packageName}. */\nexport type ${name} = unknown;`,
            );
            continue;
        }
        const names = imports.get(packageName) ?? new Set();
        names.add(name);
        imports.set(packageName, names);
    }
    const importText = [...imports.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(
            ([packageName, names]) =>
                `import type { ${[...names].sort().join(', ')} } from '${packageName}';`,
        )
        .join('\n');
    const declarationText = [...aliases, ...kept.values()]
        .map((declaration) =>
            typeof declaration === 'string'
                ? declaration
                : declaration.getText().trim(),
        )
        .join('\n\n');
    const prelude = [importText, declarationText].filter(Boolean).join('\n\n');
    const result = prelude ? `${prelude}\n\n` : '';
    preludeCache.set(key, result);
    return result;
}

// Source-derived prop body for one compound child. The child contract's
// prelude is merged into the parent root by appPropsBody before base emission.
export function childPropsBody(child) {
    const contract = contractForChild(child);
    if (!contract) {
        return null;
    }
    return {
        body: contract.props.body,
        generics: contract.props.generics ?? '',
        prelude: formatPrelude([contract]),
    };
}

// Resolve one App component's props body through its actual exported value:
// first call-signature parameter -> real Props declaration/source file. This
// is deliberately not a global I<Name>Props lookup.
export function appPropsBody(name) {
    const o = appOwnership();
    const value = valueDeclaration(name, o.entry);
    const root = contractForValue(value, name);
    const members = compoundMembers(name);
    if (!root) {
        if (members.length) {
            const children = members.map(contractForChild);
            return {
                body: '',
                generics: '',
                extendsClause: '',
                prelude: formatPrelude(children),
            };
        }
        return null;
    }
    const children = members.map(contractForChild);
    return {
        body: root.props.body,
        generics: root.props.generics ?? '',
        extendsClause: root.props.extendsClause ?? '',
        prelude: formatPrelude([root, ...children]),
    };
}
