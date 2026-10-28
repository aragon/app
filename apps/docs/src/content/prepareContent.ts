import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
    type DocsEnvironment,
    docsCorpusModes,
    readLastModified,
    resolveCorpus,
} from '@aragon/docs-corpus';
import {
    type IFile,
    renderContentFiles,
    renderPublicFiles,
} from './buildContent';
import { loadSite } from './loadSite';

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
    'staging',
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

    // The pages' "last updated": the checkout's log, which a fetch brings along and a local
    // checkout has; a directory without one dates nothing.
    const lastModified = readLastModified(corpus.rootDir);
    const { site, documents, skipped, indexSources } = await loadSite({
        rootDir: corpus.rootDir,
        mode,
        lastModified,
    });

    if (documents.length === 0) {
        throw new Error(
            `the knowledge base at ${corpus.rootDir} has no page to publish in mode ${mode}`,
        );
    }

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
        `built mode=${mode}: ${String(documents.length)} pages, ${String(indexSources.size)} index pages, ${String(site.areas.length)} areas (corpus ${corpus.commit ?? 'unknown'}, ${lastModified.size === 0 ? 'no page dates: not a git checkout' : `page dates from ${String(lastModified.size)} dated files`})`,
    );
    log(`skipped ${String(skipped.length)} files: ${skippedSummary || 'none'}`);
};

run().catch((error: unknown) => {
    process.stderr.write(
        `[docs-content] failed: ${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exit(1);
});
