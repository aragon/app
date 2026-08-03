import { tool } from 'ai';
import { z } from 'zod';
import { observability } from '../../lib/observability';

// Auto-approved analytics tool (no toolApproval entry, so it runs inline). The agent refuses
// off-topic requests in its prompt anyway — this only records the attempt so we can monitor abuse
// (e.g. using the support chat as a free assistant) without burning a separate classifier call on
// every turn. The reason is a fixed category, never user text, so the log stays PII-free.
export const buildFlagOffTopicTool = (sessionId: string) =>
    tool({
        description:
            'Record that the latest user request is outside Aragon App support (unrelated topic, or a product how-to you cannot answer). Call this right before you decline it. Never call it for a genuine feedback, bug or support request.',
        inputSchema: z.object({
            reason: z.enum(['unrelated_topic', 'product_how_to', 'other']),
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
