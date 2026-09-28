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

// The level for a model the chain does not configure (a candidate tried in the eval).
export const defaultChatReasoning: IChatReasoning = 'low';

/**
 * Reasoning effort of the attempts a model serves, as the provider-neutral AI SDK call setting
 * (the SDK maps it to each provider's own: deepseek-v4.1-flash reasons by default, the OpenAI
 * models barely do). Thinking tokens count against maxOutputTokens and delay the answer, so each
 * model runs at the level where the eval stops improving — documentation conversations passed at
 * none / low / medium / high: gpt-6-luna 29 / 31 / 38 / 37 of 44 (median 4.0 / 3.8 / 5.4 / 5.9 s),
 * deepseek-v4.1-flash 26 / 34 / 36 / 33 of 44 (2.3 / 3.3 / 10.4 / 3.3 s). A Gateway fallback after
 * a failed call resends the request as it is, so there the fallback model runs at the level of
 * the model that failed.
 */
export const getChatReasoning = (model: string): IChatReasoning =>
    getConfig().chat.reasoning[model] ?? defaultChatReasoning;

// How long a model may stay silent before the turn moves to the next one. A healthy call on the
// current provider starts answering in about a second (measured on the preview: 1.0s, 1.7s,
// 2.3s; gpt-6-luna at medium reasoning within 2.0s, median 1.4s over sixteen documentation and
// report turns), so this leaves generous room for a cold start while still catching the stall —
// the same prompt on the same provider has taken 47.8s and, once, longer than the cap above. One
// attempt per model of the chain (three) at this deadline still fits inside chatTimeoutMs.
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
        // Chat text leaves our infrastructure only to hosts that keep none of it and train on
        // none of it: the gateway routes the agent and every fallback to providers under a
        // zero-data-retention agreement and fails the call when there is none (which rules out,
        // among others, the deepseek first-party host: it stores in China and may train). A
        // privacy commitment, not a tuning knob.
        zeroDataRetention: true,
        // `order` is a preference within that set, not a restriction, and a provider that does
        // not host a model is skipped for it: OpenAI answers gpt-6-luna and gpt-6-sol faster than
        // Azure (p50 2.1 s against 4.7 s and 3.2 s against 3.6 s), Together AI had the lowest
        // time-to-first-token among the third-party hosts of v4.1-flash. The stall detector in
        // modelFailover covers a host that accepts a call and goes quiet.
        order: ['openai', 'togetherai'],
    },
});
