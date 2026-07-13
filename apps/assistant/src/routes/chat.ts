import {
    assistantLimits,
    chatRequestSchema,
    type IAssistantError,
    type IChatMessage,
} from '@aragon/assistant-contracts';
import {
    convertToModelMessages,
    createUIMessageStream,
    createUIMessageStreamResponse,
    streamText,
    toUIMessageStream,
    type UIMessage,
    type UIMessageStreamWriter,
} from 'ai';
import { Hono } from 'hono';
import { getChatProviderOptions, respondTimeoutMs } from '../chat/models';
import {
    offTopicMessage,
    tokenBudgetMessage,
    turnLimitMessage,
} from '../chat/prompts/fixedMessages';
import { buildRespondSystemPrompt } from '../chat/prompts/respond';
import { classifyIntent } from '../chat/steps/classifyIntent';
import { searchDocsTool } from '../chat/tools/searchDocs';
import type { IAppDependencies } from '../lib/appDependencies';
import { getConfig } from '../lib/config';
import {
    type IAssistantStep,
    type IRefusalReason,
    observability,
} from '../lib/observability';
import {
    buildNewSessionLimiter,
    getClientIp,
    refuseRateLimited,
} from '../lib/rateLimit';

// Writes a complete fixed assistant message (no model involved) as UI message chunks.
const writeFixedMessage = (writer: UIMessageStreamWriter, text: string) => {
    const id = 'fixed-message';
    writer.write({ type: 'start' });
    writer.write({ type: 'text-start', id });
    writer.write({ type: 'text-delta', id, delta: text });
    writer.write({ type: 'text-end', id });
    writer.write({ type: 'finish' });
};

const buildFixedMessageResponse = (params: {
    sessionId: string;
    text: string;
    refusalReason: IRefusalReason;
}) => {
    const { sessionId, text, refusalReason } = params;

    observability.logStep({
        sessionId,
        step: 'respond',
        latencyMs: 0,
        refusalReason,
    });

    const stream = createUIMessageStream({
        execute: ({ writer }) => {
            writeFixedMessage(writer, text);
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

        const turns = await sessionStore.incrementTurns(sessionId);

        // Hard limits short-circuit before any model call.
        if (turns > assistantLimits.maxTurnsPerSession) {
            return buildFixedMessageResponse({
                sessionId,
                text: turnLimitMessage,
                refusalReason: 'turn_limit',
            });
        }

        const tokens = await sessionStore.getTokens(sessionId);
        if (tokens >= assistantLimits.maxTokensPerSession) {
            return buildFixedMessageResponse({
                sessionId,
                text: tokenBudgetMessage,
                refusalReason: 'token_budget',
            });
        }

        const intakeModel = deps.getChatModel('intake');

        // Set by the nested respond-stream error handler, which sees the ORIGINAL error;
        // the outer onError only receives an anonymized wrapper and reuses the classified
        // payload so both emitted error parts agree.
        let respondErrorPayload: string | undefined;
        // Tracks the pipeline position for error logs: the outer onError also catches classify
        // failures, which must not be misattributed to the respond step.
        let currentStep: IAssistantStep = 'classifyIntent';

        const stream = createUIMessageStream({
            execute: async ({ writer }) => {
                const { intent, usage: classifyUsage } = await classifyIntent({
                    model: intakeModel,
                    sessionId,
                    messages,
                });
                // The classify guardrail consumes the session token budget too; the respond
                // step records its own usage in onFinish below.
                await sessionStore.addTokens(
                    sessionId,
                    classifyUsage.totalTokens ?? 0,
                );

                if (intent === 'off_topic') {
                    observability.logStep({
                        sessionId,
                        step: 'respond',
                        latencyMs: 0,
                        refusalReason: 'off_topic',
                    });
                    writeFixedMessage(writer, offTopicMessage);

                    return;
                }

                writer.write({ type: 'start' });

                // File metadata only (never contents): the model must know what is already
                // attached so it can acknowledge files instead of claiming it "can't see" them.
                const files = await sessionStore.listFiles(sessionId);

                currentStep = 'respond';
                const startTime = Date.now();
                const result = streamText({
                    model: deps.getChatModel('respond'),
                    providerOptions: getChatProviderOptions(),
                    abortSignal: AbortSignal.timeout(respondTimeoutMs),
                    maxOutputTokens: assistantLimits.maxOutputTokens,
                    system: buildRespondSystemPrompt({
                        intent,
                        appContext,
                        files,
                    }),
                    messages: await convertToModelMessages(
                        toUiMessages(messages),
                    ),
                    tools: getConfig().docsSearchEnabled
                        ? { searchDocs: searchDocsTool }
                        : undefined,
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
                observability.logError(error, { sessionId, step: currentStep });
                // The turn produced no reply, so the retry must not count double against the
                // turn budget — refund it (fire and forget, refusal paths never reach here).
                void sessionStore.decrementTurns(sessionId);

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

// The request schema validates the exact subset of UIMessage the pipeline reads (text parts and
// roles); the cast bridges the contracts type to the AI SDK type in this single place.
const toUiMessages = (messages: IChatMessage[]): UIMessage[] =>
    messages as unknown as UIMessage[];
