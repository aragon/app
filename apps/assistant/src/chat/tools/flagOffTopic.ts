import { tool } from 'ai';
import { z } from 'zod';
import { observability } from '../../lib/observability';

// Auto-approved analytics tool (no toolApproval entry, so it runs inline). The agent declines
// unrelated requests in its prompt anyway — this only records the attempt so we can monitor abuse
// (e.g. using the support chat as a free assistant) without burning a separate classifier call on
// every turn. The reason is a fixed category, never user text, so the log stays PII-free. A product
// question is never off-topic: it is answered, or offered to the team when the documentation tools
// are off.
export const buildFlagOffTopicTool = (sessionId: string) =>
    tool({
        description:
            'Record that you are declining an unrelated request (a poem, code, homework, using the chat as a general assistant). Call it right before the one-sentence decline; never for anything about Aragon, even when Aragon is not named.',
        inputSchema: z.object({
            reason: z.enum(['unrelated_topic', 'other']),
        }),
        execute: ({ reason }) => {
            observability.logStep({
                sessionId,
                step: 'respond',
                latencyMs: 0,
                refusalReason: 'off_topic',
                intent: reason,
            });

            return Promise.resolve({ acknowledged: true });
        },
    });
