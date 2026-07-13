import { MockLanguageModelV4, simulateReadableStream } from 'ai/test';

export const buildMockUsage = (inputTokens = 10, outputTokens = 5) => ({
    inputTokens: {
        total: inputTokens,
        noCache: inputTokens,
        cacheRead: undefined,
        cacheWrite: undefined,
    },
    outputTokens: {
        total: outputTokens,
        text: outputTokens,
        reasoning: undefined,
    },
});

const toGenerateResult = (object: unknown) => ({
    content: [{ type: 'text' as const, text: JSON.stringify(object) }],
    finishReason: { unified: 'stop' as const, raw: undefined },
    usage: buildMockUsage(),
    warnings: [],
});

const toStreamResult = (text: string) => ({
    stream: simulateReadableStream({
        chunks: [
            { type: 'stream-start' as const, warnings: [] },
            { type: 'text-start' as const, id: 'text-1' },
            { type: 'text-delta' as const, id: 'text-1', delta: text },
            { type: 'text-end' as const, id: 'text-1' },
            {
                type: 'finish' as const,
                finishReason: { unified: 'stop' as const, raw: undefined },
                usage: buildMockUsage(),
            },
        ],
    }),
});

// Mock chat model: structured-output calls (generateText + Output.object) consume `objects` in
// order (classify → extract → …); streamText calls stream `streamedText`, or throw `streamError`
// when provided (upstream failure simulation).
export const createMockChatModel = (params: {
    objects?: unknown[];
    streamedText?: string;
    streamError?: Error;
}) => {
    const { objects = [], streamedText = 'Mock reply.', streamError } = params;

    return new MockLanguageModelV4({
        doGenerate: objects.map(toGenerateResult),
        doStream: streamError
            ? () => {
                  throw streamError;
              }
            : toStreamResult(streamedText),
    });
};
