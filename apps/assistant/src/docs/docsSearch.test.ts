import { docsIndexArtifact } from '../test/fixtures/docsIndexFixture';
import {
    decodeVector,
    encodeVector,
    type IDocsIndexArtifact,
} from './docsIndexArtifact';
import { buildExcerpt, createDocsSearch } from './docsSearch';

// A three-dimensional space where each fixture chunk has its own axis, so a query vector picks a
// chunk deterministically.
const axes = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
];

const buildVectorArtifact = (): IDocsIndexArtifact => ({
    ...docsIndexArtifact,
    meta: {
        ...docsIndexArtifact.meta,
        embeddingModel: 'test/embedding',
        dimensions: 3,
    },
    chunks: docsIndexArtifact.chunks.map((chunk, index) => ({
        ...chunk,
        vector: encodeVector(axes[index] ?? []),
    })),
});

describe('createDocsSearch', () => {
    it('searches full-text when the index has no vectors', async () => {
        const docsSearch = createDocsSearch(docsIndexArtifact);

        const hits = await docsSearch.search('linking control permissions');

        expect(hits[0]).toMatchObject({
            path: 'accounts/linked-account.md',
            title: 'Linked account',
            breadcrumb: 'Accounts › Linked account',
        });
        expect(hits[0]?.excerpt).toContain('Linking is a signal');
    });

    it('returns nothing for a blank query', async () => {
        const docsSearch = createDocsSearch(docsIndexArtifact);

        await expect(docsSearch.search('   ')).resolves.toEqual([]);
    });

    it('combines the query embedding with the text match and applies the reranker order', async () => {
        const rerankCalls: Array<{ query: string; documents: string[] }> = [];
        const docsSearch = createDocsSearch(buildVectorArtifact(), {
            // The query embedding points at the third chunk (the linked account).
            embedQuery: () => Promise.resolve([0, 0, 1]),
            rerank: (query, documents, topN) => {
                rerankCalls.push({ query, documents });

                // Reverse the candidate order and score them so the effect is visible.
                return Promise.resolve(
                    documents
                        .map((_document, index) => ({
                            index,
                            score: (index + 1) / documents.length,
                        }))
                        .reverse()
                        .slice(0, topN),
                );
            },
        });

        const hits = await docsSearch.search('account');

        expect(rerankCalls).toHaveLength(1);
        expect(rerankCalls[0]?.query).toEqual('account');
        // Reranker documents carry the breadcrumb ahead of the passage.
        expect(rerankCalls[0]?.documents[0]).toMatch(/^Accounts › /);
        // The reranked order is the returned order, with the reranker's scores.
        expect(hits.map((hit) => hit.score)).toEqual(
            [...hits.map((hit) => hit.score)].sort((a, b) => b - a),
        );
        expect(hits[0]?.score).toEqual(1);
    });

    it('degrades to full-text when the embedding fails and reports the fallback', async () => {
        const fallbacks: string[] = [];
        const docsSearch = createDocsSearch(
            buildVectorArtifact(),
            { embedQuery: () => Promise.reject(new Error('gateway down')) },
            { onFallback: (stage) => fallbacks.push(stage) },
        );

        const hits = await docsSearch.search('linking control');

        expect(fallbacks).toEqual(['embedding']);
        expect(hits[0]?.path).toEqual('accounts/linked-account.md');
    });

    it('keeps the retrieval order when the reranker fails', async () => {
        const fallbacks: string[] = [];
        const docsSearch = createDocsSearch(
            docsIndexArtifact,
            { rerank: () => Promise.reject(new Error('rerank down')) },
            { onFallback: (stage) => fallbacks.push(stage) },
        );

        const hits = await docsSearch.search('account');

        expect(fallbacks).toEqual(['rerank']);
        expect(hits.length).toBeGreaterThan(0);
    });

    it('reads a page back as its passages in order, tolerating path variations', () => {
        const docsSearch = createDocsSearch(docsIndexArtifact);

        const page = docsSearch.readDoc('accounts/account.md');

        expect(page).toMatchObject({
            path: 'accounts/account.md',
            title: 'Account',
            breadcrumb: 'Accounts › Account',
        });
        expect(page?.content.startsWith('# Account\n\nThe entity')).toBe(true);
        expect(page?.content).toContain('## What an account is');
        expect(docsSearch.readDoc('/accounts/account')?.path).toEqual(
            'accounts/account.md',
        );
        expect(
            docsSearch.readDoc('platform-doc/accounts/account.md')?.path,
        ).toEqual('accounts/account.md');
        expect(docsSearch.readDoc('accounts/missing.md')).toBeUndefined();
    });

    it('lists the pages, optionally narrowed to one area', () => {
        const docsSearch = createDocsSearch(docsIndexArtifact);

        expect(docsSearch.listDocs().map((entry) => entry.path)).toEqual([
            'accounts/account.md',
            'accounts/linked-account.md',
        ]);
        expect(docsSearch.listDocs({ area: 'accounts' })).toHaveLength(2);
        expect(docsSearch.listDocs({ area: 'Governance' })).toEqual([]);
        expect(docsSearch.listDocs()[1]?.summary).toContain(
            'links another account',
        );
    });
});

describe('buildExcerpt', () => {
    it('returns a short passage whole', () => {
        expect(buildExcerpt('Short.', 100)).toEqual('Short.');
    });

    it('clips at a paragraph break past the midpoint', () => {
        const text = `${'a'.repeat(70)}\n\n${'b'.repeat(70)}`;

        expect(buildExcerpt(text, 100)).toEqual(`${'a'.repeat(70)} …`);
    });

    it('clips at a sentence end when no paragraph break qualifies', () => {
        const text = `${'a'.repeat(60)}. ${'b'.repeat(60)}. ${'c'.repeat(60)}`;

        expect(buildExcerpt(text, 100)).toEqual(`${'a'.repeat(60)}. …`);
    });

    it('hard-cuts a passage without any boundary', () => {
        expect(buildExcerpt('x'.repeat(120), 100)).toEqual(
            `${'x'.repeat(100)} …`,
        );
    });
});

describe('vector encoding', () => {
    it('round-trips through base64 float32', () => {
        const vector = [0.25, -1.5, 3, 0];

        expect(decodeVector(encodeVector(vector))).toEqual(vector);
    });
});
