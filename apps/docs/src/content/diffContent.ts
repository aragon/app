import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
    docsCorpusModes,
    docsRepository,
    syncCorpus,
} from '@aragon/docs-corpus';
import { diffSites } from './diffSite';
import { loadSite } from './loadSite';

// Release-start step (`pnpm content:diff <base> <head>`, see docs-release.yml): the pages a release
// changes on the production site — the site the knowledge base publishes in production's mode at
// the <head> commit, against the one at <base>, the commit the previous release published (empty
// for the first release). Prints the diff as JSON on stdout; the fetches log on stderr. The
// repository token (DOCS_REPO_TOKEN) comes from the workflow, the git credentials of the machine
// serve without it.

const log = (message: string) => {
    process.stderr.write(`[docs-diff] ${message}\n`);
};

const readSite = async (commit: string, workDir: string) => {
    const token = process.env.DOCS_REPO_TOKEN ?? '';
    const { rootDir } = syncCorpus({
        repoUrl: docsRepository.url,
        ref: commit,
        targetDir: path.join(workDir, commit),
        token: token === '' ? undefined : token,
    });
    log(`corpus: ${docsRepository.name}@${commit}`);

    const { site } = await loadSite({
        rootDir,
        mode: docsCorpusModes.site.production,
    });

    return site;
};

const run = async () => {
    const [base = '', head = ''] = process.argv.slice(2);

    if (head === '') {
        throw new Error(
            'usage: pnpm content:diff <base commit, empty for none> <head commit>',
        );
    }

    const workDir = await mkdtemp(path.join(os.tmpdir(), 'docs-diff-'));

    try {
        const baseSite =
            base === '' ? undefined : await readSite(base, workDir);
        const headSite = await readSite(head, workDir);
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
