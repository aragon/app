import type { IDocsCorpusMode } from './corpus';

// The documentation index as it ships inside the service bundle: built at build time from the
// knowledge base (see build/buildDocsIndex.ts), re-inserted into Orama on first use at runtime
// (see docsSearch.ts). Pages are only metadata — a page's content is its chunks in order.

export const docsIndexArtifactVersion = 1;

export interface IDocsIndexMeta {
    version: typeof docsIndexArtifactVersion;
    mode: IDocsCorpusMode;
    builtAt: string;
    /**
     * Hash of the filtered corpus (paths and cleaned content): a rebuild over an unchanged
     * corpus is skipped.
     */
    corpusHash: string;
    /**
     * Commit of the platform-doc subtree the index was built from, when known.
     */
    corpusCommit?: string;
    /**
     * Gateway id of the model the chunk vectors were produced with; absent on an index built
     * without embeddings (no gateway key at build time), which searches full-text only.
     */
    embeddingModel?: string;
    dimensions?: number;
    documentCount: number;
    chunkCount: number;
}

export interface IDocsIndexDocument {
    path: string;
    title: string;
    breadcrumb: string;
    summary?: string;
}

export interface IDocsIndexChunk {
    id: string;
    path: string;
    title: string;
    breadcrumb: string;
    text: string;
    /**
     * The passage embedding as base64 little-endian float32 — a third of the size of the number
     * array in JSON and parsed in one step.
     */
    vector?: string;
}

export interface IDocsIndexArtifact {
    meta: IDocsIndexMeta;
    documents: IDocsIndexDocument[];
    chunks: IDocsIndexChunk[];
}

export const buildEmptyDocsIndexArtifact = (
    mode: IDocsCorpusMode,
): IDocsIndexArtifact => ({
    meta: {
        version: docsIndexArtifactVersion,
        mode,
        builtAt: new Date(0).toISOString(),
        corpusHash: '',
        documentCount: 0,
        chunkCount: 0,
    },
    documents: [],
    chunks: [],
});

export const encodeVector = (vector: number[]): string =>
    Buffer.from(new Float32Array(vector).buffer).toString('base64');

export const decodeVector = (encoded: string): number[] => {
    const bytes = Buffer.from(encoded, 'base64');
    // A Buffer may sit inside a shared pool: view exactly its bytes, not the whole pool.
    const view = new Float32Array(
        bytes.buffer,
        bytes.byteOffset,
        bytes.byteLength / Float32Array.BYTES_PER_ELEMENT,
    );

    return Array.from(view);
};
