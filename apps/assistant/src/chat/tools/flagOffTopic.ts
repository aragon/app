import { tool } from 'ai';
import { z } from 'zod';
import { observability } from '../../lib/observability';

// Auto-approved analytics tool (no toolApproval entry, so it runs inline). The agent refuses
// off-topic requests in its prompt anyway — this only records the attempt so we can monitor abuse
// (e.g. using the support chat as a free assistant) without burning a separate classifier call on
// every turn. The reason is a fixed category, never user text, so the log stays PII-free.
//
// With the documentation tools on, product questions are in scope and answered from the
// documentation, so the how-to reason (and the instruction to decline them) disappears.
export const buildFlagOffTopicTool = (
    sessionId: string,
    params: { docsSearchEnabled?: boolean } = {},
) => {
    const { docsSearchEnabled = false } = params;

    return tool({
        description: docsSearchEnabled
            ? 'Record that the latest user request is outside Aragon App support (an unrelated topic). Call this right before you decline it. Never call it for a question about the Aragon App or for a genuine feedback, bug or support request — a report or question that does not name Aragon (a page crashing, a vote failing, a setup question) is still about the Aragon App.'
            : 'Record that the latest user request is outside Aragon App support (unrelated topic, or a product how-to you cannot answer). Call this right before you decline it. Never call it for a genuine feedback, bug or support request.',
        inputSchema: z.object({
            reason: docsSearchEnabled
                ? z.enum(['unrelated_topic', 'other'])
                : z.enum(['unrelated_topic', 'product_how_to', 'other']),
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
};
