import { embed, embedMany, rerank } from 'ai';
import {
    createGatewayBatchEmbedder,
    createGatewayQueryEmbedder,
    createGatewayReranker,
} from './docsModels';

jest.mock('ai', () => ({
    embed: jest.fn(() => Promise.resolve({ embedding: [0.1] })),
    embedMany: jest.fn(() => Promise.resolve({ embeddings: [[0.1]] })),
    rerank: jest.fn(() =>
        Promise.resolve({ ranking: [{ originalIndex: 0, score: 1 }] }),
    ),
}));

const noTraining = {
    providerOptions: { gateway: { disallowPromptTraining: true } },
};

describe('docsModels', () => {
    it('sends the query, the corpus and the rerank only to providers that do not train on them', async () => {
        await createGatewayQueryEmbedder('voyage/voyage-4')('a user question');
        await createGatewayBatchEmbedder('voyage/voyage-4')(['a passage']);
        await createGatewayReranker('voyage/rerank-2.5-lite')(
            'a user question',
            ['a passage'],
            1,
        );

        expect(embed).toHaveBeenCalledWith(expect.objectContaining(noTraining));
        expect(embedMany).toHaveBeenCalledWith(
            expect.objectContaining(noTraining),
        );
        expect(rerank).toHaveBeenCalledWith(
            expect.objectContaining(noTraining),
        );
    });
});
