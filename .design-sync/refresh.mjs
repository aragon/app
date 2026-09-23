import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
    cpSync,
    existsSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    rmSync,
    statSync,
    writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(import.meta.url);
const DESIGN_SYNC = dirname(SCRIPT);
const ROOT = resolve(DESIGN_SYNC, '..');
const OUT = join(ROOT, 'ds-bundle');
const REGISTRY_DIR = join(DESIGN_SYNC, 'component-registry');
const REGISTRY = join(REGISTRY_DIR, 'registry.json');
const GUIDE = join(REGISTRY_DIR, 'selection-guide.json');
const MANIFEST = join(OUT, '.payload-manifest.json');
const CACHE = join(DESIGN_SYNC, '.cache');
const PREVIOUS = join(CACHE, 'previous-ds-bundle');
const NODE_MODULES = join(ROOT, 'apps', 'app', 'node_modules');

const uploadRootFiles = new Set([
    'README.md',
    '_ds_bundle.js',
    '_ds_bundle.css',
    'styles.css',
    '_ds_needs_recompile',
    '_ds_sync.json',
]);
const uploadDirs = new Set([
    'components',
    'tokens',
    'fonts',
    '_vendor',
    '_preview',
    'guidelines',
]);

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const bytes = (file) => readFileSync(file);
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const fileSha256 = (file) => sha256(bytes(file));
const relOut = (file) => relative(OUT, file).split('\\').join('/');

function runNode(script, args) {
    const result = spawnSync(process.execPath, [script, ...args], {
        cwd: ROOT,
        env: process.env,
        stdio: 'inherit',
    });
    if (result.error) {
        throw result.error;
    }
    if (result.status !== 0) {
        throw new Error(`${script} exited with ${result.status ?? 1}`);
    }
}

export function checkFreshness() {
    runNode(join(REGISTRY_DIR, 'registry.mjs'), ['check']);
    runNode(join(REGISTRY_DIR, 'selection-guide.mjs'), ['check']);
}

function walkFiles(dir) {
    if (!existsSync(dir)) {
        return [];
    }
    const result = [];
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
        a.name.localeCompare(b.name),
    )) {
        const file = join(dir, entry.name);
        if (entry.isDirectory()) {
            result.push(...walkFiles(file));
        } else if (entry.isFile()) {
            result.push(file);
        }
    }
    return result.sort((a, b) => relOut(a).localeCompare(relOut(b)));
}

// Every path is classified explicitly. An unrecognised one is a converter
// output this wrapper has never seen, and silently defaulting it to local
// evidence is how a payload file goes missing from the upload list.
function classify(file) {
    const path = relOut(file);
    const [top] = path.split('/');
    if (top.startsWith('.') || top === '_screenshots') {
        return 'capture';
    }
    if (path.includes('/') ? uploadDirs.has(top) : uploadRootFiles.has(path)) {
        return 'upload';
    }
    throw new Error(`[refresh] unclassified bundle path: ${path}`);
}

function manifestFiles(kind) {
    return walkFiles(OUT)
        .filter(
            (file) =>
                classify(file) === kind &&
                relOut(file) !== '.payload-manifest.json',
        )
        .map((file) => ({
            path: relOut(file),
            bytes: statSync(file).size,
            sha256: fileSha256(file),
        }));
}

function identityHash(paths) {
    const hash = createHash('sha256');
    for (const file of paths.sort()) {
        hash.update(`${relative(ROOT, file).split('\\').join('/')}\0`);
        hash.update(bytes(file));
        hash.update('\0');
    }
    return hash.digest('hex');
}

function converterIdentity() {
    const converter = join(ROOT, '.ds-sync');
    const files = [
        SCRIPT,
        join(DESIGN_SYNC, 'config.json'),
        // .ds-sync/ is the vendored converter and is gitignored, so a fresh
        // clone has none until it is staged back in.
        ...(existsSync(converter)
            ? readdirSync(converter, { withFileTypes: true })
                  .filter((entry) => entry.isFile())
                  .map((entry) => join(converter, entry.name))
            : []),
        ...walkFiles(join(converter, 'lib')),
        ...walkFiles(join(converter, 'storybook')),
        ...walkFiles(join(DESIGN_SYNC, 'overrides')),
    ].filter((file) => existsSync(file));
    return {
        name: 'design-sync-converter',
        version: null,
        sourceSha256: identityHash(files),
        status: 'candidate',
    };
}

function copyIdentity(registry) {
    const provenance = registry.provenance ?? {};
    const app = provenance.app ?? {};
    const kit = provenance.kit ?? {};
    return {
        source: {
            repository: 'https://github.com/aragon/app',
            commit: app.commit ?? null,
            dirty: app.dirty ?? null,
            status: 'candidate',
        },
        kit: {
            repository: 'https://github.com/aragon/gov-ui-kit',
            commit: kit.commit ?? null,
            version: kit.sourceVersion ?? null,
            dirty: kit.dirty ?? null,
            consumed: provenance.consumed ?? null,
            status: 'candidate',
        },
    };
}

function buildManifest() {
    if (!existsSync(REGISTRY) || !existsSync(GUIDE)) {
        throw new Error('[refresh] registry or selection guide is missing');
    }
    const registry = readJson(REGISTRY);
    const context = join(OUT, 'guidelines', 'context');
    for (const file of [
        join(context, 'selection-guide.json'),
        join(context, 'index.md'),
        join(context, 'source-index.md'),
    ]) {
        if (!existsSync(file)) {
            throw new Error(
                `[refresh] delivered context is missing: ${relOut(file)}`,
            );
        }
    }
    const identities = copyIdentity(registry);
    const guidanceFiles = [
        join(context, 'selection-guide.json'),
        join(context, 'index.md'),
        join(context, 'source-index.md'),
        join(DESIGN_SYNC, 'conventions.md'),
    ].filter((file) => existsSync(file));
    const guidance = {
        registrySha256: fileSha256(REGISTRY),
        selectionGuideSha256: fileSha256(join(context, 'selection-guide.json')),
        contextSha256: identityHash(guidanceFiles),
        status: 'candidate',
    };
    const manifest = {
        schema: 1,
        status: {
            upload: 'candidate',
            accepted: 'unknown',
            deployed: 'unknown',
        },
        source: identities.source,
        kit: identities.kit,
        converter: converterIdentity(),
        guidance,
        payload: {
            upload: {
                status: 'candidate',
                finalizeWith: '_ds_sync.json',
                files: manifestFiles('upload'),
            },
            'capture/local': {
                status: 'candidate',
                files: manifestFiles('capture'),
            },
        },
    };
    return manifest;
}

function validateFileList(files, out, seen) {
    if (!Array.isArray(files)) {
        throw new Error('[manifest] file list is missing');
    }
    for (const entry of files) {
        if (
            !entry ||
            typeof entry.path !== 'string' ||
            entry.path.startsWith('/') ||
            entry.path.includes('\\') ||
            entry.path.split('/').includes('..')
        ) {
            throw new Error(
                `[manifest] unsafe path: ${entry?.path ?? '<missing>'}`,
            );
        }
        if (seen.has(entry.path)) {
            throw new Error(`[manifest] duplicate path: ${entry.path}`);
        }
        seen.add(entry.path);
        const file = join(out, entry.path);
        if (!existsSync(file) || !statSync(file).isFile()) {
            throw new Error(`[manifest] missing or stale file: ${entry.path}`);
        }
        const actualBytes = statSync(file).size;
        const actualSha = fileSha256(file);
        if (actualBytes !== entry.bytes || actualSha !== entry.sha256) {
            throw new Error(`[manifest] missing or stale file: ${entry.path}`);
        }
    }
}

export function validateManifest(manifest, out = OUT) {
    if (!manifest || manifest.schema !== 1) {
        throw new Error('[manifest] unsupported manifest schema');
    }
    if (
        manifest.status?.accepted !== 'unknown' ||
        manifest.status?.deployed !== 'unknown'
    ) {
        throw new Error(
            '[manifest] accepted/deployed status must remain unknown',
        );
    }
    const seen = new Set();
    validateFileList(manifest.payload?.upload?.files, out, seen);
    validateFileList(manifest.payload?.['capture/local']?.files, out, seen);
    for (const file of walkFiles(out)) {
        const path = relative(out, file).split('\\').join('/');
        if (path !== '.payload-manifest.json' && !seen.has(path)) {
            throw new Error(`[manifest] unlisted or stale file: ${path}`);
        }
    }
    return true;
}

// The registry is referenced by SHA-256 from the delivered index rather than
// copied (6 MB). The projection is byte-checked; the reference is hash-checked.
function verifyDeliveredContext() {
    const context = join(OUT, 'guidelines', 'context');
    const delivered = join(context, 'selection-guide.json');
    if (
        !existsSync(GUIDE) ||
        !existsSync(delivered) ||
        fileSha256(GUIDE) !== fileSha256(delivered)
    ) {
        throw new Error(
            `[refresh] delivered context is missing or stale: ${relOut(delivered)}`,
        );
    }
    const index = join(context, 'index.md');
    if (!readFileSync(index, 'utf8').includes(fileSha256(REGISTRY))) {
        throw new Error(
            '[refresh] delivered context does not reference the current registry hash',
        );
    }
}

function preservePreviousBundle() {
    if (!existsSync(OUT)) {
        return false;
    }
    mkdirSync(CACHE, { recursive: true });
    rmSync(PREVIOUS, { recursive: true, force: true });
    cpSync(OUT, PREVIOUS, { recursive: true });
    return true;
}

function restorePreviousBundle() {
    if (!existsSync(PREVIOUS)) {
        return;
    }
    rmSync(OUT, { recursive: true, force: true });
    cpSync(PREVIOUS, OUT, { recursive: true });
}

function runConverter() {
    if (!existsSync(NODE_MODULES)) {
        throw new Error(
            `[refresh] node modules directory is missing: ${NODE_MODULES}`,
        );
    }
    const args = [
        '--config',
        join(DESIGN_SYNC, 'config.json'),
        '--node-modules',
        NODE_MODULES,
        '--out',
        OUT,
    ];
    args.push(
        '--entry',
        join(NODE_MODULES, '@aragon', 'gov-ui-kit', 'dist', 'index.es.js'),
    );
    runNode(join(ROOT, '.ds-sync', 'resync.mjs'), args);
}

export function refresh({ checkOnly = false } = {}) {
    checkFreshness();
    if (checkOnly) {
        if (!existsSync(MANIFEST)) {
            throw new Error('[refresh] payload manifest is missing');
        }
        verifyDeliveredContext();
        const manifest = readJson(MANIFEST);
        validateManifest(manifest);
        const current = buildManifest();
        for (const key of ['source', 'kit', 'converter', 'guidance']) {
            if (
                JSON.stringify(manifest[key]) !== JSON.stringify(current[key])
            ) {
                throw new Error(
                    `[refresh] stale ${key} identity; rebuild the candidate`,
                );
            }
        }
        return manifest;
    }

    const hadPrevious = preservePreviousBundle();
    try {
        runConverter();
        verifyDeliveredContext();
        const manifest = buildManifest();
        validateManifest(manifest);
        writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
        return manifest;
    } catch (error) {
        if (hadPrevious) {
            restorePreviousBundle();
        }
        throw error;
    }
}

function main(argv = process.argv.slice(2)) {
    const checkOnly = argv.includes('--check');
    const manifest = refresh({ checkOnly });
    process.stdout.write(
        `${checkOnly ? 'Refresh check passed' : 'Refresh candidate built'}: ${manifest.payload.upload.files.length} upload files, ${manifest.payload['capture/local'].files.length} capture/local files\n`,
    );
}

if (resolve(process.argv[1] ?? '') === resolve(SCRIPT)) {
    try {
        main();
    } catch (error) {
        process.stderr.write(`[refresh] ${error.message ?? error}\n`);
        process.exitCode = 1;
    }
}
