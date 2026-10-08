import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
    type DocsEnvironment,
    docsCorpusModes,
    loadCorpus,
    resolveCorpus,
} from '@aragon/docs-corpus';
import {
    buildSite,
    type IFile,
    renderContentFiles,
    renderPublicFiles,
    resolveSiteLink,
} from './buildContent';

// Build-time entry (`pnpm prepare:content`, before `next build` and before the dev server):
// fetches the knowledge base (aragon/platform-doc, branch development) into the git-ignored
// .docs-corpus/ — or reads the checkout DOCS_CORPUS_DIR names, unfetched — through the corpus
// ladder of @aragon/docs-corpus, keeps the pages the environment's corpus mode publishes and
// writes them as the site's content and public files (see buildContent.ts). Runs with the
// workspace .env files loaded (see package.json): DOCS_ENV names the environment, the repository
// token (DOCS_REPO_TOKEN) comes from the deploy workflow. Without a corpus there is no site, so
// the build fails: in CI when the fetch fails, on a developer machine when there is neither a
// cached checkout nor DOCS_CORPUS_DIR.

const log = (message: string) => {
    process.stdout.write(`[docs-content] ${message}\n`);
};

const workspaceDir = process.cwd();
const corpusCacheDir = path.resolve(workspaceDir, '.docs-corpus');
const contentDir = path.resolve(workspaceDir, 'content/docs');
const publicDir = path.resolve(workspaceDir, 'public');

const environments: readonly DocsEnvironment[] = [
    'local',
    'development',
    'preview',
    'production',
];

const readEnvironment = (): DocsEnvironment => {
    const value = process.env.DOCS_ENV ?? 'local';

    if (!environments.includes(value as DocsEnvironment)) {
        throw new Error(
            `DOCS_ENV=${value} is not one of ${environments.join(', ')}`,
        );
    }

    return value as DocsEnvironment;
};

// The raw index.md of the root and of every folder with a published page, where it exists.
const readIndexSources = async (
    rootDir: string,
    dirs: Iterable<string>,
): Promise<Map<string, string>> => {
    const sources = new Map<string, string>();

    for (const dir of new Set(['', ...dirs])) {
        const indexPath = dir === '' ? 'index.md' : `${dir}/index.md`;
        const source = await readFile(
            path.join(rootDir, indexPath),
            'utf8',
        ).catch(() => undefined);

        if (source != null) {
            sources.set(indexPath, source);
        }
    }

    return sources;
};

const writeFiles = async (dir: string, files: IFile[]) => {
    await rm(dir, { recursive: true, force: true });

    for (const file of files) {
        const target = path.join(dir, file.path);
        await mkdir(path.dirname(target), { recursive: true });
        await writeFile(target, file.content, 'utf8');
    }
};

const run = async () => {
    const mode = docsCorpusModes.site[readEnvironment()];
    const corpus = resolveCorpus({
        cacheDir: corpusCacheDir,
        workspaceDir,
        log,
    });

    if (corpus == null) {
        throw new Error(
            'the knowledge base is not available: point DOCS_CORPUS_DIR at a checkout of aragon/platform-doc, or make `git ls-remote https://github.com/aragon/platform-doc.git` work on this machine',
        );
    }

    const { documents, skipped } = await loadCorpus({
        rootDir: corpus.rootDir,
        mode,
        resolveLink: resolveSiteLink,
    });

    if (documents.length === 0) {
        throw new Error(
            `the knowledge base at ${corpus.rootDir} has no page to publish in mode ${mode}`,
        );
    }

    const indexSources = await readIndexSources(
        corpus.rootDir,
        documents.map((document) =>
            path.posix.dirname(document.path).replace(/^\.$/, ''),
        ),
    );
    const site = buildSite(documents, indexSources);
    const contentFiles = renderContentFiles(site);
    await writeFiles(contentDir, contentFiles);
    await writeFiles(publicDir, renderPublicFiles(site));

    const skippedByReason = new Map<string, number>();
    for (const { reason } of skipped) {
        skippedByReason.set(reason, (skippedByReason.get(reason) ?? 0) + 1);
    }
    const skippedSummary = [...skippedByReason.entries()]
        .map(([reason, count]) => `${reason}=${String(count)}`)
        .join(', ');

    log(
        `built mode=${mode}: ${String(documents.length)} pages, ${String(indexSources.size)} index pages, ${String(site.areas.length)} areas (corpus ${corpus.commit ?? 'unknown'})`,
    );
    log(`skipped ${String(skipped.length)} files: ${skippedSummary || 'none'}`);
};

run().catch((error: unknown) => {
    process.stderr.write(
        `[docs-content] failed: ${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exit(1);
});
