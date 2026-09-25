import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { getConfig } from '../lib/config';
import {
    buildDocsIndexArtifact,
    parseDocsIndexModule,
    renderDocsIndexModule,
} from './buildDocsIndexArtifact';
import { docsRepository, readGitHead, syncCorpus } from './corpusSource';
import {
    buildEmptyDocsIndexArtifact,
    type IDocsIndexArtifact,
} from './docsIndexArtifact';
import { createGatewayBatchEmbedder } from './docsModels';

// Build-time entry (`pnpm build:docs-index`, run before tsup and before the dev server): fetches
// the knowledge base (aragon/platform-doc, branch development) into the git-ignored .docs-corpus/
// — or reads the checkout DOCS_CORPUS_DIR names, unfetched — keeps the pages the environment's
// corpus mode publishes, embeds the passages through the AI Gateway and writes the index as a
// generated module the service bundle imports. Runs with the workspace .env files loaded (see
// package.json): the mode comes from the checked-in per-environment config, the gateway key from
// the secrets CI writes before the build, the repository token (DOCS_REPO_TOKEN) from the deploy
// workflow. A developer machine degrades where CI refuses: without a gateway key the index is
// full-text only, and when the repository cannot be fetched the build keeps the cached checkout,
// then the previous index, then writes an empty one — a deployment must carry the current
// documentation, so in CI both are errors.

const log = (message: string) => {
    process.stdout.write(`[docs-index] ${message}\n`);
};

const workspaceDir = process.cwd();
const corpusCacheDir = path.resolve(workspaceDir, '.docs-corpus');
const outputFile = path.resolve(
    workspaceDir,
    'src/docs/generated/docsIndex.js',
);
const isCi = process.env.CI === 'true';

interface ICorpusLocation {
    rootDir: string;
    commit?: string;
}

// Where the corpus comes from: the directory DOCS_CORPUS_DIR names as-is, otherwise a shallow
// fetch of the knowledge base into .docs-corpus/. Undefined when there is nothing to build from.
const resolveCorpus = (): ICorpusLocation | undefined => {
    const override = process.env.DOCS_CORPUS_DIR ?? '';

    if (override !== '') {
        const rootDir = path.resolve(workspaceDir, override);
        const commit = readGitHead(rootDir);
        log(
            `corpus: ${rootDir} (DOCS_CORPUS_DIR, commit ${commit ?? 'unknown'})`,
        );

        return { rootDir, commit };
    }

    const token = process.env.DOCS_REPO_TOKEN ?? '';
    const cacheLabel = `${path.relative(workspaceDir, corpusCacheDir)}/`;
    const source = `${docsRepository.name}@${docsRepository.ref}`;
    log(
        `corpus: fetching ${source} into ${cacheLabel} (${token === '' ? 'git credentials of this machine' : 'DOCS_REPO_TOKEN'})`,
    );

    try {
        return syncCorpus({
            repoUrl: docsRepository.url,
            ref: docsRepository.ref,
            targetDir: corpusCacheDir,
            token: token === '' ? undefined : token,
        });
    } catch (error) {
        const failure = `${source}: ${error instanceof Error ? error.message : String(error)}`;

        if (isCi) {
            throw new Error(
                `${failure}. A CI build needs DOCS_REPO_TOKEN with read access to the repository (the deploy workflow loads it from 1Password).`,
                { cause: error },
            );
        }

        const cachedCommit = readGitHead(corpusCacheDir);

        if (cachedCommit != null) {
            log(
                `warning: ${failure} — building from the cached checkout in ${cacheLabel} (commit ${cachedCommit})`,
            );

            return { rootDir: corpusCacheDir, commit: cachedCommit };
        }

        log(`warning: ${failure} — no cached checkout in ${cacheLabel} either`);

        return undefined;
    }
};

const readPreviousArtifact = async () => {
    try {
        return parseDocsIndexModule(await readFile(outputFile, 'utf8'));
    } catch {
        return undefined;
    }
};

const writeArtifact = async (artifact: IDocsIndexArtifact) => {
    await mkdir(path.dirname(outputFile), { recursive: true });
    await writeFile(outputFile, renderDocsIndexModule(artifact), 'utf8');
};

const run = async () => {
    const { docsCorpus: mode, docs } = getConfig();
    const hasGatewayKey = (process.env.AI_GATEWAY_API_KEY ?? '') !== '';

    if (!hasGatewayKey && isCi) {
        throw new Error(
            'AI_GATEWAY_API_KEY is not set: a CI build must embed the documentation index.',
        );
    }

    if (!hasGatewayKey) {
        log(
            'AI_GATEWAY_API_KEY is not set — building a full-text index without embeddings.',
        );
    }

    const previous = await readPreviousArtifact();
    const corpus = resolveCorpus();

    if (corpus == null) {
        if (previous != null) {
            log(
                `keeping the previous index (mode=${previous.meta.mode}, ${String(previous.meta.documentCount)} pages, corpus=${previous.meta.corpusCommit ?? 'unknown'})`,
            );

            return;
        }

        await writeArtifact(buildEmptyDocsIndexArtifact(mode));
        log(
            `wrote an empty index (mode=${mode}) — documentation answers stay off until the knowledge base can be fetched`,
        );

        return;
    }

    const startTime = Date.now();
    const { artifact, skipped, reused } = await buildDocsIndexArtifact({
        rootDir: corpus.rootDir,
        mode,
        embed: hasGatewayKey
            ? createGatewayBatchEmbedder(docs.embeddingModel)
            : undefined,
        embeddingModel: docs.embeddingModel,
        corpusCommit: corpus.commit,
        previous,
    });

    const skippedByReason = new Map<string, number>();
    for (const { reason } of skipped) {
        skippedByReason.set(reason, (skippedByReason.get(reason) ?? 0) + 1);
    }

    if (reused) {
        log(
            `index up to date (mode=${mode}, ${String(artifact.meta.documentCount)} pages, ${String(artifact.meta.chunkCount)} passages) — nothing to embed`,
        );

        return;
    }

    await writeArtifact(artifact);

    const dimensions =
        artifact.meta.dimensions == null
            ? ''
            : ` (${String(artifact.meta.dimensions)} dims)`;
    log(
        `built mode=${mode}: ${String(artifact.meta.documentCount)} pages, ${String(artifact.meta.chunkCount)} passages, embeddings=${artifact.meta.embeddingModel ?? 'none'}${dimensions} in ${String(Date.now() - startTime)}ms`,
    );
    const skippedSummary = [...skippedByReason.entries()]
        .map(([reason, count]) => `${reason}=${String(count)}`)
        .join(', ');
    log(`skipped ${String(skipped.length)} files: ${skippedSummary || 'none'}`);
};

run().catch((error: unknown) => {
    process.stderr.write(
        `[docs-index] failed: ${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exit(1);
});
