import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { getConfig } from '../lib/config';
import {
    buildDocsIndexArtifact,
    parseDocsIndexModule,
    renderDocsIndexModule,
} from './buildDocsIndexArtifact';
import { createGatewayBatchEmbedder } from './docsModels';

// Build-time entry (`pnpm build:docs-index`, run before tsup and before the dev server): reads the
// platform-doc subtree at the repository root, keeps the pages the environment's corpus mode
// publishes, embeds the passages through the AI Gateway and writes the index as a generated module
// the service bundle imports. Runs with the workspace .env files loaded (see package.json): the
// mode comes from the checked-in per-environment config, the gateway key from the secrets CI
// writes before the build. Without a key the index is built full-text only — fine on a developer
// machine, refused in CI where the key is expected to be there.

const log = (message: string) => {
    process.stdout.write(`[docs-index] ${message}\n`);
};

const workspaceDir = process.cwd();
const rootDir =
    process.env.DOCS_CORPUS_DIR ??
    path.resolve(workspaceDir, '../../platform-doc');
const outputFile = path.resolve(
    workspaceDir,
    'src/docs/generated/docsIndex.js',
);

const runGit = (args: string[]): string | undefined => {
    try {
        const output = execFileSync('git', args, {
            cwd: workspaceDir,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
        }).trim();

        return output === '' ? undefined : output;
    } catch {
        return undefined;
    }
};

// The last commit that touched the corpus, so the index says which documentation it holds. A
// shallow CI checkout only knows its head commit, which then stands in: still a commit whose
// tree holds exactly the corpus that was indexed.
const readCorpusCommit = (): string | undefined =>
    runGit(['log', '-1', '--format=%H', '--', rootDir]) ??
    runGit(['rev-parse', 'HEAD']);

const readPreviousArtifact = async () => {
    try {
        return parseDocsIndexModule(await readFile(outputFile, 'utf8'));
    } catch {
        return undefined;
    }
};

const run = async () => {
    const { docsCorpus: mode, docs } = getConfig();
    const hasGatewayKey = (process.env.AI_GATEWAY_API_KEY ?? '') !== '';

    if (!hasGatewayKey && process.env.CI === 'true') {
        throw new Error(
            'AI_GATEWAY_API_KEY is not set: a CI build must embed the documentation index.',
        );
    }

    if (!hasGatewayKey) {
        log(
            'AI_GATEWAY_API_KEY is not set — building a full-text index without embeddings.',
        );
    }

    const startTime = Date.now();
    const { artifact, skipped, reused } = await buildDocsIndexArtifact({
        rootDir,
        mode,
        embed: hasGatewayKey
            ? createGatewayBatchEmbedder(docs.embeddingModel)
            : undefined,
        embeddingModel: docs.embeddingModel,
        corpusCommit: readCorpusCommit(),
        previous: await readPreviousArtifact(),
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

    await mkdir(path.dirname(outputFile), { recursive: true });
    await writeFile(outputFile, renderDocsIndexModule(artifact), 'utf8');

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
