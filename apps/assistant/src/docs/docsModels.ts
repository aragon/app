import { embed, embedMany, rerank } from 'ai';

// Model boundary of the documentation search: the ids are AI Gateway model ids resolved by the
// SDK's default provider (the same way the chat models are), so the callers only see functions.

export const createGatewayQueryEmbedder =
    (model: string) =>
    async (query: string): Promise<number[]> => {
        const { embedding } = await embed({ model, value: query });

        return embedding;
    };

// Voyage caps one request at 1000 texts and at a token total the whole corpus exceeds, so the
// build embeds in batches rather than in one call.
export const embeddingBatchSize = 64;

export const createGatewayBatchEmbedder =
    (model: string) =>
    async (values: string[]): Promise<number[][]> => {
        const embeddings: number[][] = [];

        for (
            let start = 0;
            start < values.length;
            start += embeddingBatchSize
        ) {
            const batch = values.slice(start, start + embeddingBatchSize);
            const result = await embedMany({ model, values: batch });
            embeddings.push(...result.embeddings);
        }

        return embeddings;
    };

export const createGatewayReranker =
    (model: string) =>
    async (
        query: string,
        documents: string[],
        topN: number,
    ): Promise<Array<{ index: number; score: number }>> => {
        const { ranking } = await rerank({ model, query, documents, topN });

        return ranking.map(({ originalIndex, score }) => ({
            index: originalIndex,
            score,
        }));
    };
