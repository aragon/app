import type { LanguageModel, LanguageModelCallOptions } from 'ai';
import { getConfig } from '../lib/config';

// Model boundary: everything below the routes consumes LanguageModel values; the Gateway model id
// lives in config only. The id is a parameter so a turn can be restarted on a fallback model
// (see modelFailover) without the routes learning how models are resolved.
export const getChatModel = (model?: string): LanguageModel =>
    model ?? getConfig().chat.agentModel;

/**
 * Models a turn may run on, best first: the agent model, then the configured fallbacks.
 */
export const getChatModels = (): string[] => {
    const { agentModel, fallbackModels } = getConfig().chat;

    return [agentModel, ...fallbackModels];
};

// Wall-clock cap on the agent stream, including the AI SDK's internal retries and the resume step
// that runs the tool (blob transfer + Linear create): a stalled upstream call must fail fast so
// the user can retry, instead of burning the function timeout (observed: a single gateway call
// hanging for 34s).
export const chatTimeoutMs = 60_000;

// Bounded step count of one agent turn: a documentation answer is a search, at most a couple of
// page reads and the reply; a report is the draft, the tool and the post-approval summary.
export const maxAgentSteps = 8;

export type IChatReasoning = NonNullable<LanguageModelCallOptions['reasoning']>;

// Level for a model the chain does not configure.
export const defaultChatReasoning: IChatReasoning = 'low';

/**
 * Reasoning effort of the attempts a model serves, as the provider-neutral AI SDK setting.
 * Thinking tokens count against maxOutputTokens and delay the answer, so each model runs at the
 * lowest level that still reasons about a case the documentation does not spell out. A Gateway
 * fallback after a failed call resends the request unchanged, at the failed model's level.
 */
export const getChatReasoning = (model: string): IChatReasoning =>
    getConfig().chat.reasoning[model] ?? defaultChatReasoning;

// How long a model may stay silent before the turn moves to the next one: room for a cold start,
// short enough to catch a stalled provider. One attempt per model of the chain at this deadline
// fits inside chatTimeoutMs.
export const firstContentTimeoutMs = 12_000;

// AI Gateway natively retries a failed call on the given fallback models — passed as
// providerOptions to every streamText call, no custom retry wrapper involved. It only covers
// calls that actually fail; a provider that accepts the call and then goes quiet is handled a
// layer up, in modelFailover.
export const getChatProviderOptions = (fallbackModels: string[]) => ({
    // strictJsonSchema constrains tool-call argument decoding to the exact input schema so the
    // model cannot drift from it (OpenAI models; other providers ignore the key).
    openai: { strictJsonSchema: true },
    gateway: {
        models: fallbackModels,
        // Chat text goes only to providers under a zero-data-retention agreement; the gateway
        // fails the call when a model has none. A privacy commitment, not a tuning knob.
        zeroDataRetention: true,
        // A preference within that set, not a restriction: the faster host of each model first,
        // and a host that does not serve a model is skipped for it. A host that accepts a call
        // and goes quiet is handled in modelFailover.
        order: ['openai', 'togetherai'],
    },
});
