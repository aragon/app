import path from 'node:path';
import { docsRepository, readGitHead, syncCorpus } from './corpusSource';

export interface ICorpusLocation {
    rootDir: string;
    /**
     * Head commit of the checkout, when it is a git repository.
     */
    commit?: string;
}

export interface IResolveCorpusParams {
    /**
     * Where the fetch lands: a git-ignored directory of the consumer workspace, reused (and moved
     * to the current head) by its next build.
     */
    cacheDir: string;
    /**
     * What a relative DOCS_CORPUS_DIR is resolved against.
     */
    workspaceDir: string;
    log: (message: string) => void;
}

/**
 * Where a build reads the knowledge base from: the directory DOCS_CORPUS_DIR names, as-is and
 * unfetched, otherwise a shallow fetch of aragon/platform-doc into the cache directory — with
 * DOCS_REPO_TOKEN when it is set, the git credentials of the machine otherwise. A failed fetch
 * throws in CI (CI=true): a deployment must carry the current documentation. A developer machine
 * keeps the cached checkout of an earlier build, and without one gets undefined — what a build
 * without a corpus does is the caller's call.
 */
export const resolveCorpus = (
    params: IResolveCorpusParams,
): ICorpusLocation | undefined => {
    const { cacheDir, workspaceDir, log } = params;
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
    const cacheLabel = `${path.relative(workspaceDir, cacheDir)}/`;
    const source = `${docsRepository.name}@${docsRepository.ref}`;
    log(
        `corpus: fetching ${source} into ${cacheLabel} (${token === '' ? 'git credentials of this machine' : 'DOCS_REPO_TOKEN'})`,
    );

    try {
        return syncCorpus({
            repoUrl: docsRepository.url,
            ref: docsRepository.ref,
            targetDir: cacheDir,
            token: token === '' ? undefined : token,
        });
    } catch (error) {
        const failure = `${source}: ${error instanceof Error ? error.message : String(error)}`;

        if (process.env.CI === 'true') {
            throw new Error(
                `${failure}. A CI build needs DOCS_REPO_TOKEN with read access to the repository (the deploy workflow loads it from 1Password).`,
                { cause: error },
            );
        }

        const cachedCommit = readGitHead(cacheDir);

        if (cachedCommit != null) {
            log(
                `warning: ${failure} — building from the cached checkout in ${cacheLabel} (commit ${cachedCommit})`,
            );

            return { rootDir: cacheDir, commit: cachedCommit };
        }

        log(`warning: ${failure} — no cached checkout in ${cacheLabel} either`);

        return undefined;
    }
};
