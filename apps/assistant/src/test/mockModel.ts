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

// Mock chat agent: streams `streamedText`, optionally proposing a `toolCall` (the route gates a
// ticket draft behind approval and runs the other tools inline), or throws `streamError` to
// simulate an upstream failure. With `followUpText` the second model call — the step after an
// inline tool result — streams that text instead of proposing the tool call again.
export const createMockChatModel = (params: {
    streamedText?: string;
    streamError?: Error;
    toolCall?: { toolName: string; input: unknown };
    followUpText?: string;
}) => {
    const {
        streamedText = 'Mock reply.',
        streamError,
        toolCall,
        followUpText,
    } = params;

    if (streamError) {
        return new MockLanguageModelV4({
            doStream: () => {
                throw streamError;
            },
        });
    }

    return new MockLanguageModelV4({
        doStream:
            followUpText == null
                ? toStreamResult(streamedText, toolCall)
                : [
                      toStreamResult(streamedText, toolCall),
                      toStreamResult(followUpText),
                  ],
    });
};
