#!/usr/bin/env node
// Read immutable app data; never execute application TypeScript or change its checkout.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const definitionPath = 'apps/app/src/shared/constants/networkDefinitions.ts';
const enumPath = 'apps/app/src/shared/api/daoService/domain/enum/network.ts';
const begin = '<!-- supported-chains:start -->';
const end = '<!-- supported-chains:end -->';

function requireThat(condition, message) {
    if (!condition) throw new Error(message);
}

export function lockedViem(lock, yaml) {
    const version = yaml.parse(lock)?.importers?.['apps/app']?.dependencies?.viem?.version;
    requireThat(typeof version === 'string', 'Missing apps/app viem lock entry.');
    const match = /^(\d+\.\d+\.\d+)(?:\(|$)/.exec(version);
    requireThat(match, `Unsupported viem lock version: ${version}`);
    return match[1];
}

export function extractRows(source, enumSource, chains, ts) {
    const bindings = new Map();
    const pending = new Map();
    const parsing = new Set();
    const parse = (text, name) => {
        const ast = ts.createSourceFile(name, text, ts.ScriptTarget.Latest, true);
        requireThat(ast.parseDiagnostics.length === 0, `Cannot parse ${name}.`);
        return ast;
    };
    const get = (name) => {
        if (bindings.has(name)) return bindings.get(name);
        requireThat(pending.has(name) && !parsing.has(name), `Unresolved or cyclic data: ${name}`);
        parsing.add(name);
        const value = evaluate(pending.get(name));
        parsing.delete(name);
        bindings.set(name, value);
        return value;
    };
    const propertyName = (node) => ts.isComputedPropertyName(node)
        ? evaluate(node.expression) : node.text;
    const evaluate = (node) => {
        requireThat(node, 'Missing data initializer.');
        if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
        if (ts.isNumericLiteral(node)) return Number(node.text.replaceAll('_', ''));
        if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
        if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
        if (ts.isIdentifier(node)) return get(node.text);
        if (ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isParenthesizedExpression(node)) {
            return evaluate(node.expression);
        }
        if (ts.isPropertyAccessExpression(node)) {
            const object = evaluate(node.expression);
            requireThat(Object.hasOwn(object, node.name.text), `Unknown property: ${node.getText()}`);
            return object[node.name.text];
        }
        if (ts.isObjectLiteralExpression(node)) {
            const result = Object.create(null);
            const assigned = new Set();
            for (const property of node.properties) {
                if (ts.isSpreadAssignment(property)) {
                    const spread = evaluate(property.expression);
                    requireThat(spread && typeof spread === 'object', 'Invalid object spread.');
                    Object.assign(result, spread);
                } else {
                    requireThat(ts.isPropertyAssignment(property), `Unsupported data property: ${property.getText()}`);
                    const name = propertyName(property.name);
                    requireThat(typeof name === 'string', 'Invalid property name.');
                    requireThat(!assigned.has(name), `Duplicate data property: ${name}`);
                    assigned.add(name);
                    result[name] = evaluate(property.initializer);
                }
            }
            return result;
        }
        throw new Error(`Unsupported data expression: ${node.getText().slice(0, 100)}`);
    };
    const registerEnum = (node) => {
        const values = Object.create(null);
        for (const member of node.members) values[propertyName(member.name)] = evaluate(member.initializer);
        bindings.set(node.name.text, values);
    };
    const networkEnum = parse(enumSource, enumPath).statements.find(
        (node) => ts.isEnumDeclaration(node) && node.name.text === 'Network',
    );
    requireThat(networkEnum, 'Network enum is missing.');
    registerEnum(networkEnum);
    const ast = parse(source, definitionPath);
    for (const node of ast.statements) {
        if (ts.isImportDeclaration(node)) {
            if (node.importClause?.isTypeOnly) continue;
            const module = node.moduleSpecifier.text;
            const names = node.importClause?.namedBindings;
            requireThat(names && ts.isNamedImports(names) && !node.importClause.name, `Unsupported import: ${module}`);
            for (const binding of names.elements) {
                if (binding.isTypeOnly) continue;
                const imported = binding.propertyName?.text ?? binding.name.text;
                if (module === 'viem/chains') {
                    requireThat(Object.hasOwn(chains, imported), `Missing locked viem chain: ${imported}`);
                    bindings.set(binding.name.text, chains[imported]);
                } else {
                    requireThat(module === '@/shared/api/daoService' && imported === 'Network', `Unreviewed import: ${module}/${imported}`);
                    bindings.set(binding.name.text, bindings.get('Network'));
                }
            }
        } else if (ts.isVariableStatement(node)) {
            for (const declaration of node.declarationList.declarations) {
                requireThat(ts.isIdentifier(declaration.name), 'Unsupported variable declaration.');
                pending.set(declaration.name.text, declaration.initializer);
            }
        } else if (ts.isEnumDeclaration(node)) registerEnum(node);
        else requireThat(ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node), 'Unreviewed statement in network definitions.');
    }
    const definitions = get('networkDefinitions');
    requireThat(definitions && Object.keys(definitions).length > 0, 'Empty network inventory.');
    const ids = new Set();
    return Object.entries(definitions).map(([network, chain]) => {
        requireThat(Object.values(bindings.get('Network')).includes(network), `Unknown network key: ${network}`);
        requireThat(Number.isSafeInteger(chain.id) && chain.id > 0 && !ids.has(chain.id), `Invalid/duplicate chain ID: ${chain.id}`);
        ids.add(chain.id);
        requireThat(typeof chain.name === 'string' && chain.name.trim(), `Missing name: ${network}`);
        for (const flag of ['testnet', 'disabled', 'beta']) {
            requireThat(chain[flag] === undefined || typeof chain[flag] === 'boolean', `Invalid ${flag}: ${network}`);
        }
        requireThat(typeof chain.tenderlySupport === 'boolean', `Missing simulation flag: ${network}`);
        const explorer = chain.blockExplorers?.default;
        if (explorer) {
            requireThat(typeof explorer.name === 'string' && /^https:\/\/[^\s<>]+$/.test(explorer.url), `Invalid explorer: ${network}`);
        }
        return {
            network, name: chain.name, id: chain.id, testnet: chain.testnet ?? false,
            disabled: chain.disabled ?? false, beta: chain.beta ?? false,
            simulation: chain.tenderlySupport,
            explorer: explorer ? { name: explorer.name, url: explorer.url } : null,
        };
    }).sort((a, b) => Number(a.testnet) - Number(b.testnet) || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0) || a.id - b.id);
}

export function table(rows) {
    const escape = (value) => value.replaceAll('&', '&amp;').replaceAll('|', '&#124;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('[', '&#91;').replaceAll(']', '&#93;').replace(/[\r\n]+/g, ' ');
    return [
        '| Chain | Chain ID | Network type | Account creation | Action simulation | Explorer |',
        '| --- | --- | --- | --- | --- | --- |',
        ...rows.map((row) => `| ${escape(row.name)} | ${row.id} | ${row.testnet ? 'Testnet' : 'Mainnet'} | ${row.disabled ? 'Unavailable' : row.beta ? 'Available (beta)' : 'Available'} | ${row.simulation ? 'Available' : 'Unavailable'} | ${row.explorer ? `[${escape(row.explorer.name)}](<${row.explorer.url}>)` : '—'} |`),
    ].join('\n');
}

export function renderPage(original, snapshot) {
    const newline = original.includes('\r\n') ? '\r\n' : '\n';
    let document = original.replaceAll('\r\n', '\n');
    requireThat(document.startsWith('---\n'), 'Reference frontmatter is missing.');
    const boundary = document.indexOf('\n---\n', 4);
    requireThat(boundary > 0, 'Reference frontmatter is incomplete.');
    let frontmatter = document.slice(0, boundary);
    for (const [key, value] of Object.entries({
        chain_source: `https://github.com/aragon/app/blob/${snapshot.commit}/${definitionPath}`,
        chain_release: snapshot.release,
        chain_viem: snapshot.viem,
    })) {
        const pattern = new RegExp(`^${key}:.*$`, 'gm');
        requireThat([...frontmatter.matchAll(pattern)].length === 1, `Expected one ${key} field.`);
        frontmatter = frontmatter.replace(pattern, () => `${key}: ${JSON.stringify(value)}`);
    }
    document = frontmatter + document.slice(boundary);
    requireThat(document.split(begin).length === 2 && document.split(end).length === 2, 'Expected one generated table block.');
    const start = document.indexOf(begin) + begin.length;
    const finish = document.indexOf(end);
    requireThat(start < finish, 'Invalid table marker order.');
    return (document.slice(0, start) + '\n' + table(snapshot.rows) + '\n' + document.slice(finish)).replaceAll('\n', newline);
}

export function differences(previous, current) {
    const before = new Map(previous.map((row) => [row.network, row]));
    const after = new Map(current.map((row) => [row.network, row]));
    return {
        added: current.filter((row) => !before.has(row.network)),
        removed: previous.filter((row) => !after.has(row.network)),
        changed: current.filter((row) => before.has(row.network) && JSON.stringify(before.get(row.network)) !== JSON.stringify(row))
            .map((row) => ({ before: before.get(row.network), after: row })),
    };
}

export function snapshot(app, release, dependencies, viemDirectory) {
    requireThat(/^@aragon\/app@\d+\.\d+\.\d+$/.test(release), 'Use an official stable @aragon/app@<semver> tag.');
    const git = (...args) => execFileSync('git', ['-c', `safe.directory=${app.replaceAll('\\', '/')}`, '-C', app, ...args], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
    const commit = git('rev-parse', '--verify', `refs/tags/${release}^{commit}`).trim();
    requireThat(/^[a-f0-9]{40}$/.test(commit), 'Cannot resolve exact release commit.');
    const read = (path) => git('show', `${commit}:${path}`);
    const manifest = JSON.parse(read('apps/app/package.json'));
    requireThat(`${manifest.name}@${manifest.version}` === release, 'Release tag and package version disagree.');
    const viem = lockedViem(read('pnpm-lock.yaml'), dependencies.yaml);
    const store = join(app, 'node_modules/.pnpm');
    const candidates = [
        ...(viemDirectory ? [resolve(viemDirectory)] : []),
        join(app, 'apps/app/node_modules/viem'), join(app, 'node_modules/viem'),
        ...(existsSync(store) ? readdirSync(store).filter((name) => name === `viem@${viem}` || name.startsWith(`viem@${viem}_`)).sort().map((name) => join(store, name, 'node_modules/viem')) : []),
    ];
    const directory = candidates.find((path) => existsSync(join(path, 'package.json')) && JSON.parse(readFileSync(join(path, 'package.json'), 'utf8')).version === viem);
    requireThat(directory, `Install locked viem@${viem} in an isolated directory, then pass --viem-dir <directory>/node_modules/viem. Current checkout versions are not substituted.`);
    const chains = createRequire(join(directory, 'package.json'))('viem/chains');
    return { release, commit, viem, rows: extractRows(read(definitionPath), read(enumPath), chains, dependencies.ts) };
}

export function main(args) {
    const { values } = parseArgs({ args, options: {
        app: { type: 'string', default: resolve(root, '../app') },
        release: { type: 'string' }, previous: { type: 'string' },
        'viem-dir': { type: 'string' },
        write: { type: 'boolean' }, check: { type: 'boolean' }, help: { type: 'boolean' },
    } });
    if (values.help) {
        console.log('node supported-chains.mjs --app <checkout> --release @aragon/app@<version> [--previous <tag>] [--viem-dir <package>] [--write | --check]\nDefault: preview JSON. --write updates only reference metadata/table; --check exits 1 on drift. Source/schema errors exit 2 without writing. Requires typescript and yaml resolvable from the app checkout.');
        return 0;
    }
    requireThat(values.release && !(values.write && values.check), 'Specify --release and at most one of --write or --check.');
    const app = resolve(values.app);
    const require = createRequire(join(app, 'apps/app/package.json'));
    const dependencies = { ts: require('typescript'), yaml: require('yaml') };
    const current = snapshot(app, values.release, dependencies, values['viem-dir']);
    const previous = values.previous ? snapshot(app, values.previous, dependencies, values['viem-dir']) : null;
    const path = join(root, 'application', 'supported-chains.md');
    const original = readFileSync(path, 'utf8');
    const rendered = renderPage(original, current);
    const changed = original !== rendered;
    const delta = previous ? differences(previous.rows, current.rows) : null;
    if (values.write && changed) {
        const temporary = `${path}.${process.pid}.tmp`;
        writeFileSync(temporary, rendered, 'utf8');
        renameSync(temporary, path);
    }
    console.log(JSON.stringify({ ...current, previous: previous?.release ?? null, delta, pageChanged: changed, written: Boolean(values.write && changed) }, null, 2));
    return values.check && changed ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try { process.exitCode = main(process.argv.slice(2)); }
    catch (error) { console.error(`Supported-chain extraction failed: ${error.message}`); process.exitCode = 2; }
}
