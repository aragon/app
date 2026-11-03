import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
    type ICorpusDocument,
    type ICorpusSkippedFile,
    type IDocsCorpusMode,
    loadCorpus,
} from '@aragon/docs-corpus';
import { buildSite, type ISite, resolveSiteLink } from './buildContent';

// Reads the site a knowledge-base checkout publishes in a corpus mode: the content step builds
// it (prepareContent.ts), the release start compares two of them (diffContent.ts).

export interface ILoadSiteParams {
    rootDir: string;
    mode: IDocsCorpusMode;
    /**
     * Dates of the corpus files (readLastModified); the pages show no date without them.
     */
    lastModified?: ReadonlyMap<string, string>;
}

export interface ILoadSiteResult {
    site: ISite;
    documents: ICorpusDocument[];
    skipped: ICorpusSkippedFile[];
    indexSources: ReadonlyMap<string, string>;
}

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

export const loadSite = async (
    params: ILoadSiteParams,
): Promise<ILoadSiteResult> => {
    const { rootDir, mode, lastModified } = params;
    const { documents, skipped } = await loadCorpus({
        rootDir,
        mode,
        resolveLink: resolveSiteLink,
    });
    const indexSources = await readIndexSources(
        rootDir,
        documents.map((document) =>
            path.posix.dirname(document.path).replace(/^\.$/, ''),
        ),
    );
    const site = buildSite(documents, indexSources, lastModified);

    return { site, documents, skipped, indexSources };
};
