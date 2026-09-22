import path from 'node:path';
import {
    buildDocsIndexArtifact,
    parseDocsIndexModule,
    renderDocsIndexModule,
} from './buildDocsIndexArtifact';
import { decodeVector } from './docsIndexArtifact';

// Jest runs from the workspace root (its rootDir), which is what the paths below assume.
const fixtureRoot = path.resolve('src/test/fixtures/docsCorpus');

// Deterministic stand-in for the gateway embedder: one dimension per input, the input length.
const fakeEmbed = (values: string[]) =>
    Promise.resolve(values.map((value, index) => [value.length, index]));

describe('buildDocsIndexArtifact', () => {
    it('builds pages and passages with vectors from the filtered corpus', async () => {
        const embedCalls: string[][] = [];
        const { artifact, skipped, reused } = await buildDocsIndexArtifact({
            rootDir: fixtureRoot,
            mode: 'drafts',
            embed: (values) => {
                embedCalls.push(values);

                return fakeEmbed(values);
            },
            embeddingModel: 'test/embedding',
            corpusCommit: 'abc123',
            now: () => new Date('2026-09-08T12:00:00.000Z'),
        });

        expect(reused).toBe(false);
        expect(artifact.meta).toMatchObject({
            version: 1,
            mode: 'drafts',
            builtAt: '2026-09-08T12:00:00.000Z',
            corpusCommit: 'abc123',
            embeddingModel: 'test/embedding',
            dimensions: 2,
            documentCount: 6,
        });
        expect(artifact.meta.chunkCount).toEqual(artifact.chunks.length);
        expect(
            artifact.documents.map((document) => document.breadcrumb),
        ).toEqual([
            'Accounts › Account',
            'Accounts › Linked account',
            'Design › Full-screen wizard',
            'Governance › Action simulation',
            'Governance › Governance process',
            'Guides › Choose a voting-power mechanism',
        ]);
        // Every passage was embedded with its breadcrumb (and summary) prefix, once.
        expect(embedCalls).toHaveLength(1);
        expect(embedCalls[0]).toHaveLength(artifact.chunks.length);
        expect(
            embedCalls[0]?.find((input) => input.includes('Linked account')),
        ).toMatch(/^Accounts › Linked account\n\nHow an account links/);
        expect(artifact.chunks.every((chunk) => chunk.vector != null)).toBe(
            true,
        );
        expect(decodeVector(artifact.chunks[0]?.vector ?? '')).toEqual([
            embedCalls[0]?.[0]?.length,
            0,
        ]);
        expect(skipped.length).toBeGreaterThan(0);
    });

    it('builds a full-text index without an embedder', async () => {
        const { artifact } = await buildDocsIndexArtifact({
            rootDir: fixtureRoot,
            mode: 'ready',
            embeddingModel: 'test/embedding',
        });

        expect(artifact.meta.embeddingModel).toBeUndefined();
        expect(artifact.meta.dimensions).toBeUndefined();
        expect(artifact.meta.documentCount).toEqual(3);
        expect(artifact.chunks.every((chunk) => chunk.vector == null)).toBe(
            true,
        );
    });

    it('reuses the previous artifact while corpus, mode and embedding model are unchanged', async () => {
        const first = await buildDocsIndexArtifact({
            rootDir: fixtureRoot,
            mode: 'drafts',
            embed: fakeEmbed,
            embeddingModel: 'test/embedding',
        });
        let embedCalls = 0;
        const second = await buildDocsIndexArtifact({
            rootDir: fixtureRoot,
            mode: 'drafts',
            embed: (values) => {
                embedCalls += 1;

                return fakeEmbed(values);
            },
            embeddingModel: 'test/embedding',
            previous: first.artifact,
        });
        const otherMode = await buildDocsIndexArtifact({
            rootDir: fixtureRoot,
            mode: 'ready',
            embed: fakeEmbed,
            embeddingModel: 'test/embedding',
            previous: first.artifact,
        });
        const otherModel = await buildDocsIndexArtifact({
            rootDir: fixtureRoot,
            mode: 'drafts',
            embed: fakeEmbed,
            embeddingModel: 'test/other-embedding',
            previous: first.artifact,
        });

        expect(second.reused).toBe(true);
        expect(second.artifact).toBe(first.artifact);
        expect(embedCalls).toEqual(0);
        expect(otherMode.reused).toBe(false);
        expect(otherModel.reused).toBe(false);
    });

    it('renders a module the previous build reads back from', async () => {
        const { artifact } = await buildDocsIndexArtifact({
            rootDir: fixtureRoot,
            mode: 'drafts',
            embed: fakeEmbed,
            embeddingModel: 'test/embedding',
        });

        const source = renderDocsIndexModule(artifact);

        expect(source).toContain(
            'export const docsIndexArtifact = JSON.parse(',
        );
        expect(source).toContain('mode=drafts documents=6');
        expect(parseDocsIndexModule(source)).toEqual(artifact);
        expect(
            parseDocsIndexModule('export const nothing = 1;'),
        ).toBeUndefined();
    });
});
