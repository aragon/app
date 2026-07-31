import {
    assistantLimits,
    chatRequestSchema,
    createTicketToolName,
    type IAssistantError,
    type IChatMessage,
} from '@aragon/assistant-contracts';
import {
    convertToModelMessages,
    createUIMessageStream,
    createUIMessageStreamResponse,
    stepCountIs,
    streamText,
    toUIMessageStream,
    type UIMessage,
    type UIMessageStreamWriter,
} from 'ai';
import { Hono } from 'hono';
import { chatTimeoutMs, getChatProviderOptions } from '../chat/models';
import { buildAgentSystemPrompt } from '../chat/prompts/agentPrompt';
import {
    tokenBudgetMessage,
    turnLimitMessage,
} from '../chat/prompts/fixedMessages';
import { buildCreateLinearTicketTool } from '../chat/tools/createLinearTicket';
import { buildFlagOffTopicTool } from '../chat/tools/flagOffTopic';
import { searchDocsTool } from '../chat/tools/searchDocs';
import type { IAppDependencies } from '../lib/appDependencies';
import { getConfig } from '../lib/config';
import { type IRefusalReason, observability } from '../lib/observability';
import {
    buildNewSessionLimiter,
    getClientIp,
    refuseRateLimited,
} from '../lib/rateLimit';

// Writes a complete fixed assistant message (no model involved) as UI message chunks. Approved
// tool calls the refused request was meant to execute are failed explicitly — without a result
// chunk their approval card would show the creation as in flight forever.
const writeFixedMessage = (
    writer: UIMessageStreamWriter,
    text: string,
    failedToolCallIds: string[] = [],
) => {
    const id = 'fixed-message';
    writer.write({ type: 'start' });
    for (const toolCallId of failedToolCallIds) {
        writer.write({
            type: 'tool-output-error',
            toolCallId,
            errorText: text,
        });
    }
    writer.write({ type: 'text-start', id });
    writer.write({ type: 'text-delta', id, delta: text });
    writer.write({ type: 'text-end', id });
    writer.write({ type: 'finish' });
};

const buildFixedMessageResponse = (params: {
    sessionId: string;
    text: string;
    refusalReason: IRefusalReason;
    failedToolCallIds?: string[];
}) => {
    const { sessionId, text, refusalReason, failedToolCallIds } = params;

    observability.logStep({
        sessionId,
        step: 'respond',
        latencyMs: 0,
        refusalReason,
    });

    const stream = createUIMessageStream({
        execute: ({ writer }) => {
            writeFixedMessage(writer, text, failedToolCallIds);
        },
    });

    return createUIMessageStreamResponse({ stream });
};

export const buildChatRoute = (deps: IAppDependencies) => {
    const getSessionLimiter = buildNewSessionLimiter(deps);

    return new Hono().post('/', async (context) => {
        const body = await context.req.json().catch(() => null);
        const parsed = chatRequestSchema.safeParse(body);

        if (!parsed.success) {
            const error: IAssistantError = {
                error: { code: 'validation', message: 'Invalid chat request.' },
            };

            return context.json(error, 400);
        }

        const { sessionId, messages, appContext } = parsed.data;
        const sessionStore = deps.getSessionStore();

        // A session's first turn consumes the per-IP new-session budget. The gate runs BEFORE
        // the turn is counted: a refused session never increments, so retries and concurrent
        // duplicate first turns re-enter the gate (the budget may over-count under concurrency
        // — the safe direction).
        const isNewSession = (await sessionStore.getTurns(sessionId)) === 0;
        if (isNewSession) {
            const { success, reset } = await getSessionLimiter().limit(
                getClientIp(context),
            );

            if (!success) {
                return refuseRateLimited(
                    context,
                    sessionId,
                    reset,
                    'session_limit',
                );
            }
        }

        // A resume carries no new user input — the user only answered the approval prompt of
        // the previous turn (Create / Dismiss) — so it does not consume the turn budget: a
        // created ticket costs one turn, not two. The limits below still apply to it; a refusal
        // fails its approved tool calls explicitly so the card never hangs on a spinner.
        const isResume = isResumeRequest(messages);
        const pendingApprovedToolCallIds =
            getPendingApprovedToolCallIds(messages);

        const turns = isResume
            ? await sessionStore.getTurns(sessionId)
            : await sessionStore.incrementTurns(sessionId);

        // Hard limits short-circuit before any model call.
        if (turns > assistantLimits.maxTurnsPerSession) {
            return buildFixedMessageResponse({
                sessionId,
                text: turnLimitMessage,
                refusalReason: 'turn_limit',
                failedToolCallIds: pendingApprovedToolCallIds,
            });
        }

        const tokens = await sessionStore.getTokens(sessionId);
        if (tokens >= assistantLimits.maxTokensPerSession) {
            return buildFixedMessageResponse({
                sessionId,
                text: tokenBudgetMessage,
                refusalReason: 'token_budget',
                failedToolCallIds: pendingApprovedToolCallIds,
            });
        }

        const { docsSearchEnabled } = getConfig();

        // Set by the nested stream error handler, which sees the ORIGINAL error; the outer onError
        // only receives an anonymized wrapper and reuses the classified payload so both emitted
        // error parts agree.
        let respondErrorPayload: string | undefined;

        const stream = createUIMessageStream({
            execute: async ({ writer }) => {
                // File metadata only (never contents): the model must know what is already
                // attached so it can acknowledge files instead of claiming it "can't see" them.
                const files = await sessionStore.listFiles(sessionId);

                // Open the message once here; the merged model stream reuses it (sendStart: false)
                // so the two producers never emit a duplicate start chunk.
                writer.write({ type: 'start' });

                const startTime = Date.now();
                const result = streamText({
                    model: deps.getChatModel(),
                    providerOptions: getChatProviderOptions(),
                    abortSignal: AbortSignal.timeout(chatTimeoutMs),
                    maxOutputTokens: assistantLimits.maxOutputTokens,
                    // Draft → tool → post-approval summary all happen within a bounded step count.
                    stopWhen: stepCountIs(5),
                    system: buildAgentSystemPrompt({
                        appContext,
                        files,
                        docsSearchEnabled,
                    }),
                    // ignoreIncompleteToolCalls drops tool parts the composer's Stop left in
                    // `input-streaming`/`input-available`: replayed as-is they would convert
                    // to a tool call without a response and fail every following model call.
                    messages: await convertToModelMessages(
                        toUiMessages(messages),
                        { ignoreIncompleteToolCalls: true },
                    ),
                    tools: {
                        [createTicketToolName]: buildCreateLinearTicketTool({
                            deps,
                            sessionId,
                            appContext,
                            messages,
                        }),
                        // Auto-approved (absent from toolApproval): records off-topic attempts
                        // for analytics; the model calls it before declining.
                        flagOffTopic: buildFlagOffTopicTool(sessionId),
                        ...(docsSearchEnabled
                            ? { searchDocs: searchDocsTool }
                            : {}),
                    },
                    // Ticket creation is gated behind an explicit user approval of the draft; the
                    // widget resumes the stream once the user presses Create.
                    toolApproval: {
                        [createTicketToolName]: () => 'user-approval',
                    },
                    onFinish: async ({ usage, finalStep }) => {
                        await sessionStore.addTokens(
                            sessionId,
                            usage.totalTokens ?? 0,
                        );
                        observability.logStep({
                            sessionId,
                            step: 'respond',
                            // The model that actually answered: under a Gateway fallback this
                            // differs from the requested model, keeping degradation visible.
                            model: finalStep.response.modelId,
                            latencyMs: Date.now() - startTime,
                            tokensIn: usage.inputTokens,
                            tokensOut: usage.outputTokens,
                            finishReason: finalStep.finishReason,
                        });
                    },
                });

                writer.merge(
                    toUIMessageStream({
                        stream: result.stream,
                        sendStart: false,
                        onError: (error) => {
                            respondErrorPayload = JSON.stringify(
                                buildStreamError(error),
                            );

                            return respondErrorPayload;
                        },
                    }),
                );
            },
            onError: (error) => {
                observability.logError(error, { sessionId, step: 'respond' });
                // The turn produced no reply, so the retry must not count double against the
                // turn budget — refund it (fire and forget, refusal paths never reach here).
                // Resumes were never counted, so there is nothing to refund.
                if (!isResume) {
                    void sessionStore.decrementTurns(sessionId);
                }

                return (
                    respondErrorPayload ??
                    JSON.stringify(buildStreamError(error))
                );
            },
        });

        return createUIMessageStreamResponse({ stream });
    });
};

// The string returned by the stream onError callback becomes the Error message on the client;
// encoding the shared error shape lets the widget map known failures to human messages.
const buildStreamError = (error: unknown): IAssistantError => ({
    error: isUpstreamRateLimited(error)
        ? {
              code: 'upstream_rate_limited',
              message:
                  'The assistant is receiving too many requests right now.',
          }
        : { code: 'internal', message: 'Something went wrong.' },
});

// AI SDK retry errors wrap the per-attempt errors and causes nest arbitrarily; walk the chain
// with a depth guard.
const collectErrorChain = (error: unknown, depth = 0): unknown[] => {
    if (error == null || typeof error !== 'object' || depth > 3) {
        return [];
    }

    const { errors, cause } = error as { errors?: unknown; cause?: unknown };
    const nested = [...(Array.isArray(errors) ? errors : []), cause];

    return [
        error,
        ...nested.flatMap((nestedError) =>
            collectErrorChain(nestedError, depth + 1),
        ),
    ];
};

// A 429 (or a *RateLimit* error class) anywhere in the chain means the model upstream refused
// the call — our own per-IP limits refuse before the stream starts and never reach this path.
const isUpstreamRateLimited = (error: unknown): boolean =>
    collectErrorChain(error).some((chainError) => {
        const { statusCode, name } = chainError as {
            statusCode?: unknown;
            name?: unknown;
        };

        return (
            statusCode === 429 ||
            (typeof name === 'string' && name.includes('RateLimit'))
        );
    });

// A resume re-sends the history with the assistant's message last (no new user input): the
// widget auto-resumes the stream once the user answers a tool approval (Create / Dismiss).
const isResumeRequest = (messages: IChatMessage[]): boolean =>
    messages.at(-1)?.role === 'assistant';

// Tool calls the user approved but whose execution has not run yet (once it runs, the part
// state moves past `approval-responded`): the request carrying them is what actually creates
// the ticket, and a refusal must resolve them so the approval card reaches a terminal state.
const getPendingApprovedToolCallIds = (messages: IChatMessage[]): string[] => {
    const lastMessage = messages.at(-1);

    if (lastMessage?.role !== 'assistant') {
        return [];
    }

    return lastMessage.parts
        .filter((part) => part.type === `tool-${createTicketToolName}`)
        .map((part) => {
            const { state, approval, toolCallId } = part as {
                state?: unknown;
                approval?: { approved?: unknown };
                toolCallId?: unknown;
            };

            return state === 'approval-responded' && approval?.approved === true
                ? toolCallId
                : null;
        })
        .filter(
            (toolCallId): toolCallId is string =>
                typeof toolCallId === 'string',
        );
};

// The request schema validates the exact subset of UIMessage the pipeline reads (text parts and
// roles); the cast bridges the contracts type to the AI SDK type in this single place.
const toUiMessages = (messages: IChatMessage[]): UIMessage[] =>
    messages
        .map(dropReasoningParts)
        .map(resolveDanglingApprovals) as unknown as UIMessage[];

// Replayed reasoning is dead weight: it feeds no next turn, burns input tokens and makes the
// gateway log a warning per part on providers that reject non-OpenAI reasoning in history.
const dropReasoningParts = (message: IChatMessage): IChatMessage => ({
    ...message,
    parts: message.parts.filter((part) => part.type !== 'reasoning'),
});

// A user may keep typing while a draft awaits approval; the history then carries a tool part
// stuck in `approval-requested`, which converts to a tool call without a response and makes the
// model call fail. Resolve such parts as denied so the model sees the draft was superseded and
// folds the new message into a fresh one. (Parts a Stop left in `input-streaming` /
// `input-available` never reached the approval and are dropped instead, via the
// ignoreIncompleteToolCalls conversion option.)
const resolveDanglingApprovals = (message: IChatMessage): IChatMessage => ({
    ...message,
    parts: message.parts.map((part) => {
        const { state, approval } = part as {
            state?: unknown;
            approval?: object;
        };

        return state === 'approval-requested'
            ? {
                  ...part,
                  state: 'approval-responded',
                  approval: {
                      ...approval,
                      approved: false,
                      reason: 'Superseded by a newer user message.',
                  },
              }
            : part;
    }),
});
