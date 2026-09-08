import {
    type AnyOrama,
    type AnySchema,
    create,
    insertMultiple,
    search as searchOrama,
    type Vector,
} from '@orama/orama';
import {
    decodeVector,
    type IDocsIndexArtifact,
    type IDocsIndexChunk,
    type IDocsIndexMeta,
} from './docsIndexArtifact';

export interface IDocsSearchHit {
    path: string;
    title: string;
    breadcrumb: string;
    excerpt: string;
    score: number;
}

export interface IDocPage {
    path: string;
    title: string;
    breadcrumb: string;
    summary?: string;
    content: string;
}

export interface IDocListEntry {
    path: string;
    title: string;
    breadcrumb: string;
    summary?: string;
}

export interface IDocsSearchModels {
    /**
     * Embeds a query in the space the index vectors live in. Absent (or failing) → the search
     * runs full-text only.
     */
    embedQuery?: (query: string) => Promise<number[]>;
    /**
     * Reorders candidate passages by relevance to the query and keeps the best `topN`. Absent
     * (or failing) → the index order stands.
     */
    rerank?: (
        query: string,
        documents: string[],
        topN: number,
    ) => Promise<Array<{ index: number; score: number }>>;
}

export type IDocsSearchFallbackStage = 'embedding' | 'rerank';

export interface IDocsSearchOptions {
    /**
     * Called when a model step failed and the search degraded around it.
     */
    onFallback?: (stage: IDocsSearchFallbackStage, error: unknown) => void;
}

export interface IDocsSearch {
    meta: IDocsIndexMeta;
    search: (query: string) => Promise<IDocsSearchHit[]>;
    readDoc: (path: string) => IDocPage | undefined;
    listDocs: (params?: { area?: string }) => IDocListEntry[];
}

// Hybrid retrieval keeps the top candidates for the reranker; the model then sees the best five.
export const searchCandidateLimit = 20;
export const searchResultLimit = 5;
// Floor on the cosine similarity a passage needs to enter the vector side of the hybrid search.
// Orama's default is 0.8, which voyage-4 never reaches: measured on the drafts corpus, the
// passages that answer a question score 0.55–0.70 against it and unrelated ones sit below 0.35,
// so with the default the "hybrid" search was full-text only (a Spanish query found nothing).
// The floor only keeps noise out; the candidate limit and the reranker pick the answer.
export const vectorSimilarityFloor = 0.3;
// A hit's excerpt is the passage clipped to about 400 tokens; the model reads the page with
// readDoc when it needs more.
export const excerptMaxChars = 1500;

const excerptEllipsis = ' …';

// Clips at the last paragraph break, else the last sentence end, before the cap; a hard cut only
// when the passage has neither in its second half.
export const buildExcerpt = (
    text: string,
    maxChars = excerptMaxChars,
): string => {
    if (text.length <= maxChars) {
        return text;
    }

    const head = text.slice(0, maxChars);
    const paragraphBreak = head.lastIndexOf('\n\n');
    const sentenceEnd = Math.max(
        head.lastIndexOf('. '),
        head.lastIndexOf('.\n'),
    );
    const cut = [paragraphBreak, sentenceEnd + 1].find(
        (index) => index > maxChars / 2,
    );

    return `${head.slice(0, cut ?? maxChars).trimEnd()}${excerptEllipsis}`;
};

const normalizePath = (path: string): string =>
    path
        .trim()
        .replace(/^\.?\//, '')
        .replace(/^platform-doc\//, '');

const roundScore = (score: number): number => Math.round(score * 1000) / 1000;

/**
 * In-memory documentation search over one built index. The Orama database is filled on the first
 * search of the process (a lambda instance pays it once); hybrid when the index has vectors and a
 * query embedder is given, full-text otherwise; reranked when a reranker is given.
 */
export const createDocsSearch = (
    artifact: IDocsIndexArtifact,
    models: IDocsSearchModels = {},
    options: IDocsSearchOptions = {},
): IDocsSearch => {
    const { meta, documents, chunks } = artifact;
    const chunkById = new Map(chunks.map((chunk) => [chunk.id, chunk]));
    const chunksByPath = new Map<string, IDocsIndexChunk[]>();
    for (const chunk of chunks) {
        const pageChunks = chunksByPath.get(chunk.path);

        if (pageChunks == null) {
            chunksByPath.set(chunk.path, [chunk]);
        } else {
            pageChunks.push(chunk);
        }
    }
    const documentByPath = new Map(
        documents.map((document) => [document.path, document]),
    );
    const dimensions =
        meta.dimensions != null && chunks.every((chunk) => chunk.vector != null)
            ? meta.dimensions
            : undefined;
    const usesVectors = dimensions != null && models.embedQuery != null;

    let database: Promise<AnyOrama> | undefined;

    const getDatabase = (): Promise<AnyOrama> => {
        database ??= (async () => {
            const embedding: Vector = `vector[${dimensions ?? 0}]`;
            const schema: AnySchema = {
                id: 'string',
                path: 'string',
                title: 'string',
                breadcrumb: 'string',
                text: 'string',
                ...(usesVectors ? { embedding } : {}),
            };
            const db = create({ schema });
            await insertMultiple(
                db,
                chunks.map((chunk) => ({
                    id: chunk.id,
                    path: chunk.path,
                    title: chunk.title,
                    breadcrumb: chunk.breadcrumb,
                    text: chunk.text,
                    ...(usesVectors && chunk.vector != null
                        ? { embedding: decodeVector(chunk.vector) }
                        : {}),
                })),
            );

            return db;
        })();

        return database;
    };

    const embedQuery = async (query: string): Promise<number[] | undefined> => {
        if (!usesVectors || models.embedQuery == null) {
            return undefined;
        }

        try {
            return await models.embedQuery(query);
        } catch (error) {
            options.onFallback?.('embedding', error);

            return undefined;
        }
    };

    const rerankCandidates = async (
        query: string,
        candidates: Array<{ chunk: IDocsIndexChunk; score: number }>,
    ): Promise<Array<{ chunk: IDocsIndexChunk; score: number }>> => {
        if (models.rerank == null || candidates.length < 2) {
            return candidates;
        }

        try {
            const ranking = await models.rerank(
                query,
                candidates.map(
                    ({ chunk }) => `${chunk.breadcrumb}\n\n${chunk.text}`,
                ),
                searchResultLimit,
            );

            return ranking.flatMap(({ index, score }) => {
                const candidate = candidates[index];

                return candidate == null
                    ? []
                    : [{ chunk: candidate.chunk, score }];
            });
        } catch (error) {
            options.onFallback?.('rerank', error);

            return candidates;
        }
    };

    const search = async (query: string): Promise<IDocsSearchHit[]> => {
        const term = query.trim();
        if (term === '' || chunks.length === 0) {
            return [];
        }

        const db = await getDatabase();
        const vector = await embedQuery(term);
        const textParams = {
            term,
            limit: searchCandidateLimit,
            properties: ['title', 'breadcrumb', 'text'],
            boost: { title: 2, breadcrumb: 1.5 },
        };
        const results = await searchOrama(
            db,
            vector == null
                ? { mode: 'fulltext', ...textParams }
                : {
                      mode: 'hybrid',
                      ...textParams,
                      vector: { value: vector, property: 'embedding' },
                      similarity: vectorSimilarityFloor,
                  },
        );
        const candidates = results.hits.flatMap((hit) => {
            const chunk = chunkById.get(String(hit.id));

            return chunk == null ? [] : [{ chunk, score: hit.score }];
        });
        const ranked = await rerankCandidates(term, candidates);

        return ranked.slice(0, searchResultLimit).map(({ chunk, score }) => ({
            path: chunk.path,
            title: chunk.title,
            breadcrumb: chunk.breadcrumb,
            excerpt: buildExcerpt(chunk.text),
            score: roundScore(score),
        }));
    };

    const readDoc = (path: string): IDocPage | undefined => {
        const normalized = normalizePath(path);
        const document =
            documentByPath.get(normalized) ??
            documentByPath.get(`${normalized}.md`);

        if (document == null) {
            return undefined;
        }

        const content = (chunksByPath.get(document.path) ?? [])
            .map((chunk) => chunk.text)
            .join('\n\n');

        return {
            path: document.path,
            title: document.title,
            breadcrumb: document.breadcrumb,
            summary: document.summary,
            content: `# ${document.title}\n\n${content}`.trim(),
        };
    };

    const listDocs = (params: { area?: string } = {}): IDocListEntry[] => {
        const area = params.area?.trim().toLowerCase();

        return documents
            .filter(
                (document) =>
                    area == null ||
                    area === '' ||
                    document.breadcrumb.toLowerCase().startsWith(area) ||
                    document.path.toLowerCase().startsWith(area),
            )
            .map(({ path, title, breadcrumb, summary }) => ({
                path,
                title,
                breadcrumb,
                summary,
            }));
    };

    return { meta, search, readDoc, listDocs };
};
