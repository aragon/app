import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
    cpSync,
    existsSync,
    mkdirSync,
    readFileSync,
    writeFileSync,
} from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as base from '../../.ds-sync/lib/docs.mjs';

export * from '../../.ds-sync/lib/docs.mjs';

const HERE = new URL('.', import.meta.url);
const DESIGN_SYNC = resolve(fileURLToPath(new URL('..', HERE)));
const REPO_ROOT = resolve(DESIGN_SYNC, '..');
const REGISTRY_DIR = join(DESIGN_SYNC, 'component-registry');
const REGISTRY = join(REGISTRY_DIR, 'registry.json');
const GUIDE = join(REGISTRY_DIR, 'selection-guide.json');
const REPORT = join(REGISTRY_DIR, 'REPORT.md');
const CONFIG = join(DESIGN_SYNC, 'config.json');
const APP_ROOT = join(REPO_ROOT, 'apps', 'app');
const REPOSITORIES = {
    app: 'https://github.com/aragon/app',
    kit: 'https://github.com/aragon/gov-ui-kit',
};

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const fileSha256 = (file) =>
    createHash('sha256').update(readFileSync(file)).digest('hex');
const registryRecordCount = (registry) =>
    Array.isArray(registry.components) ? registry.components.length : 'unknown';
const posix = (value) => value.split('\\').join('/');

function immutableUrl(repository, path, line, commits, tracked) {
    const baseUrl = REPOSITORIES[repository];
    const commit = commits[repository];
    if (!baseUrl || !commit || !tracked[repository]?.has(path)) {
        return null;
    }
    return `${baseUrl}/blob/${commit}/${path}${line ? `#L${line}` : ''}`;
}

function trackedPaths(commits) {
    const roots = { app: REPO_ROOT, kit: process.env.GOVKIT_KIT_ROOT };
    return Object.fromEntries(
        Object.entries(commits).map(([repository, commit]) => {
            const root = roots[repository];
            if (!commit || !root) {
                return [repository, new Set()];
            }
            // A missing checkout, a shallow clone or an unfetched commit must
            // degrade to plain-path rows, never abort the build.
            let paths;
            try {
                paths = execFileSync(
                    'git',
                    ['ls-tree', '-rz', '--name-only', commit],
                    {
                        cwd: root,
                        encoding: 'utf8',
                        maxBuffer: 8 * 1024 * 1024,
                        stdio: ['ignore', 'pipe', 'ignore'],
                    },
                );
            } catch {
                return [repository, new Set()];
            }
            return [repository, new Set(paths.split('\0'))];
        }),
    );
}

function collectRefs(value, refs = new Map()) {
    if (!value || typeof value !== 'object') {
        return refs;
    }
    if (
        typeof value.repository === 'string' &&
        typeof value.path === 'string'
    ) {
        const key = `${value.repository}:${value.path}:${value.line ?? 1}`;
        refs.set(key, {
            repository: value.repository,
            path: value.path,
            line: Number.isInteger(value.line) ? value.line : 1,
        });
    }
    for (const child of Object.values(value)) {
        collectRefs(child, refs);
    }
    return refs;
}

function configSourceMap(registry, tracked) {
    const cfg = readJson(CONFIG);
    const commits = {
        app: registry.provenance?.app?.commit ?? null,
        kit: registry.provenance?.kit?.commit ?? null,
    };
    const packageRoot = join(
        REPO_ROOT,
        'apps',
        'app',
        'node_modules',
        '@aragon',
        'gov-ui-kit',
    );
    const rows = [];
    for (const [name, configured] of Object.entries(
        cfg.componentSrcMap ?? {},
    )) {
        if (typeof configured !== 'string') {
            continue;
        }
        const candidates = [
            resolve(packageRoot, configured),
            resolve(APP_ROOT, configured),
        ];
        const source = candidates.find((candidate) => existsSync(candidate));
        const appPath = source && posix(relative(REPO_ROOT, source));
        const url =
            appPath && !appPath.startsWith('../')
                ? immutableUrl('app', appPath, 1, commits, tracked)
                : null;
        rows.push({ name, path: appPath ?? configured, url });
    }
    return rows.sort((a, b) => a.name.localeCompare(b.name));
}

function writeContext(OUT) {
    for (const [label, file] of [
        ['registry', REGISTRY],
        ['selection-guide', GUIDE],
    ]) {
        if (!existsSync(file)) {
            throw new Error(
                `[context] required ${label} is missing at ${file}`,
            );
        }
    }
    const contextDir = join(OUT, 'guidelines', 'context');
    mkdirSync(contextDir, { recursive: true });
    // The registry is a 6 MB repo artifact; the bundle ships the selection
    // projection plus a resolvable reference to it, not a second copy.
    cpSync(GUIDE, join(contextDir, 'selection-guide.json'));
    const copied = ['context/selection-guide.json'];
    if (existsSync(REPORT)) {
        cpSync(REPORT, join(contextDir, 'registry-report.md'));
        copied.push('context/registry-report.md');
    }

    const registry = readJson(REGISTRY);
    const commits = {
        app: registry.provenance?.app?.commit ?? null,
        kit: registry.provenance?.kit?.commit ?? null,
    };
    const tracked = trackedPaths(commits);
    const refs = [...collectRefs(registry).values()]
        .map((ref) => ({
            ...ref,
            url: immutableUrl(
                ref.repository,
                ref.repository === 'app' ? `apps/app/${ref.path}` : ref.path,
                ref.line,
                commits,
                tracked,
            ),
        }))
        .sort((a, b) =>
            `${a.repository}:${a.path}:${a.line}`.localeCompare(
                `${b.repository}:${b.path}:${b.line}`,
            ),
        );
    // One row per referenced source file, not per registry reference: the
    // per-line refs live in the registry itself and would add ~1 MB here.
    const sourceRows = [];
    for (const repo of ['app', 'kit']) {
        const files = [
            ...new Map(
                refs
                    .filter((ref) => ref.repository === repo)
                    .map((ref) => [ref.path, ref]),
            ).values(),
        ];
        if (!files.length) {
            continue;
        }
        sourceRows.push(`## ${repo === 'kit' ? 'GovKit' : 'App'}`, '');
        for (const ref of files) {
            sourceRows.push(
                ref.url
                    ? `- [${ref.path}](${ref.url})`
                    : `- \`${ref.path}\` (no verified tracked source at the recorded commit)`,
            );
        }
        sourceRows.push('');
    }
    const mapRows = configSourceMap(registry, tracked).map(
        ({ name, path, url }) =>
            url
                ? `- \`${name}\`: [${path}](${url})`
                : `- \`${name}\`: \`${path}\` (no commit-addressed source link available)`,
    );
    const sourceIndex = [
        '# Recorded source references',
        '',
        'Generated from the authoritative registry and `.design-sync/config.json`; this is a link view, not a second catalog.',
        'Links address the recorded commits, not snapshots of uncommitted changes. Check the dirty paths below before treating a linked file as the current candidate source.',
        '',
        '## Recorded revisions',
        '',
        commits.app
            ? `- App: [${commits.app}](https://github.com/aragon/app/tree/${commits.app})`
            : '- App: no commit recorded',
        commits.kit
            ? `- GovKit: [${commits.kit}](https://github.com/aragon/gov-ui-kit/tree/${commits.kit})`
            : '- GovKit: no commit recorded',
        `- App dirty inputs: ${JSON.stringify(registry.provenance?.app?.dirty ?? null)}`,
        `- GovKit dirty inputs: ${JSON.stringify(registry.provenance?.kit?.dirty ?? null)}`,
        '',
        '## Configured component sources',
        '',
        ...mapRows,
        '',
        ...sourceRows,
    ].join('\n');
    writeFileSync(
        join(contextDir, 'source-index.md'),
        `${sourceIndex.trimEnd()}\n`,
    );
    copied.push('context/source-index.md');

    const contextIndex = [
        '# Design-sync context',
        '',
        'These files are the delivered context for this candidate bundle. They are generated from the checked-in source registry/configuration and are not a second catalog.',
        '',
        `- Authoritative registry — \`.design-sync/component-registry/registry.json\` on the App branch that produced this candidate; SHA-256 \`${fileSha256(REGISTRY)}\`, ${registryRecordCount(registry)} records. Match that hash to confirm you are reading the registry this bundle was generated from. Not copied into this bundle, and NOT present at the recorded base revision below, which is the revision the sources were extracted from.`,
        '- [Selection guide](./selection-guide.json) — generated selection view whose fingerprint points at the registry above.',
        '- [Recorded source references](./source-index.md) — commit-addressed App/GovKit links and dirty-input caveats.',
        ...(existsSync(REPORT)
            ? [
                  '- [Registry report](./registry-report.md) — readable audit guidance and update procedure.',
              ]
            : []),
        '',
        `Recorded App revision: ${commits.app ?? 'unknown'}; GovKit revision: ${commits.kit ?? 'unknown'}.`,
        'The bundle status remains candidate/unknown until an external owner accepts and deploys it; this context does not claim upload or deployment.',
        '',
    ].join('\n');
    writeFileSync(join(contextDir, 'index.md'), contextIndex);
    copied.push('context/index.md');

    const index = join(OUT, 'guidelines', 'index.md');
    const existing = existsSync(index)
        ? readFileSync(index, 'utf8').trimEnd()
        : '# Guidelines';
    const marker = '- [Authoritative design context](./context/index.md)';
    const next = existing.includes(marker)
        ? existing
        : `${existing}\n\n## Delivered App context\n\n${marker}`;
    writeFileSync(index, `${next}\n`);
    return copied;
}

export function emitGuidelines(args) {
    const copied = base.emitGuidelines(args);
    return [...copied, ...writeContext(args.OUT)];
}
