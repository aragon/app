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

const toStreamResult = (
    text: string,
    toolCall?: { toolName: string; input: unknown },
) => ({
    stream: simulateReadableStream({
        chunks: [
            { type: 'stream-start' as const, warnings: [] },
            { type: 'text-start' as const, id: 'text-1' },
            { type: 'text-delta' as const, id: 'text-1', delta: text },
            { type: 'text-end' as const, id: 'text-1' },
            ...(toolCall
                ? [
                      {
                          type: 'tool-call' as const,
                          toolCallId: 'call-1',
                          toolName: toolCall.toolName,
                          input: JSON.stringify(toolCall.input),
                      },
                  ]
                : []),
            {
                type: 'finish' as const,
                finishReason: {
                    unified: toolCall
                        ? ('tool-calls' as const)
                        : ('stop' as const),
                    raw: undefined,
                },
                usage: buildMockUsage(),
            },
        ],
    }),
});

// Mock chat agent: streams `streamedText`, optionally proposing a `toolCall` (the route gates it
// behind approval), or throws `streamError` to simulate an upstream failure.
export const createMockChatModel = (params: {
    streamedText?: string;
    streamError?: Error;
    toolCall?: { toolName: string; input: unknown };
}) => {
    const { streamedText = 'Mock reply.', streamError, toolCall } = params;

    return new MockLanguageModelV4({
        doStream: streamError
            ? () => {
                  throw streamError;
              }
            : toStreamResult(streamedText, toolCall),
    });
};
