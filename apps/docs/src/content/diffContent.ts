import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
    type DocsCorpusConsumer,
    docsCorpusModes,
    docsRepository,
    type IDocsCorpusMode,
    syncCorpus,
} from '@aragon/docs-corpus';
import { diffSites } from './diffSite';
import { loadSite } from './loadSite';

// Release-start step (`pnpm content:diff <base> <head> [consumer]`, see docs-release.yml and
// assistant-release.yml): the pages a release changes in production — the pages the knowledge
// base publishes in the consumer's production mode at the <head> commit, against the ones at
// <base>, the commit the previous release published (empty for the first release). The consumer
// is the site (default) or the assistant, whose index reads the same pages through the same
// loader. Prints the diff as JSON on stdout; the fetches log on stderr. The repository token
// (DOCS_REPO_TOKEN) comes from the workflow, the git credentials of the machine serve without it.

const log = (message: string) => {
    process.stderr.write(`[docs-diff] ${message}\n`);
};

const usage =
    'usage: pnpm content:diff <base commit, empty for none> <head commit> [site|assistant]';

const isConsumer = (value: string): value is DocsCorpusConsumer =>
    value === 'site' || value === 'assistant';

const readSite = async (
    commit: string,
    mode: IDocsCorpusMode,
    workDir: string,
) => {
    const token = process.env.DOCS_REPO_TOKEN ?? '';
    const { rootDir } = syncCorpus({
        repoUrl: docsRepository.url,
        ref: commit,
        targetDir: path.join(workDir, commit),
        token: token === '' ? undefined : token,
    });
    log(`corpus: ${docsRepository.name}@${commit}`);

    const { site } = await loadSite({ rootDir, mode });

    return site;
};

const run = async () => {
    const [base = '', head = '', consumer = 'site'] = process.argv.slice(2);

    if (head === '' || !isConsumer(consumer)) {
        throw new Error(usage);
    }

    const mode = docsCorpusModes[consumer].production;
    log(`consumer: ${consumer} (mode ${mode})`);

    const workDir = await mkdtemp(path.join(os.tmpdir(), 'docs-diff-'));

    try {
        const baseSite =
            base === '' ? undefined : await readSite(base, mode, workDir);
        const headSite = await readSite(head, mode, workDir);
        process.stdout.write(
            `${JSON.stringify(diffSites(baseSite, headSite))}\n`,
        );
    } finally {
        await rm(workDir, { recursive: true, force: true });
    }
};

run().catch((error: unknown) => {
    process.stderr.write(
        `[docs-diff] failed: ${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exit(1);
});
