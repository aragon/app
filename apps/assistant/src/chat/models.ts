import type { LanguageModel } from 'ai';
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

// How long a model may stay silent before the turn moves to the next one. A healthy call on the
// current provider starts answering in about a second (measured on the preview: 1.0s, 1.7s,
// 2.3s), so this leaves generous room for a cold start while still catching the stall — the same
// prompt on the same provider has taken 47.8s and, once, longer than the cap above. Two attempts
// at this deadline still fit inside chatTimeoutMs.
export const firstContentTimeoutMs = 12_000;

// AI Gateway natively retries a failed call on the given fallback models — passed as
// providerOptions to every streamText call, no custom retry wrapper involved. It only covers
// calls that actually fail; a provider that accepts the call and then goes quiet is handled a
// layer up, in modelFailover.
export const getChatProviderOptions = (fallbackModels: string[]) => ({
    // strictJsonSchema constrains tool-call argument decoding to the exact input schema so the
    // model cannot drift from it. It only applies when the Gateway routes to the OpenAI API;
    // other providers ignore the key.
    openai: { strictJsonSchema: true },
    // Intake needs no reasoning, and thinking tokens are invisible output that eats the
    // maxOutputTokens budget (observed: a draft clipped to an empty turn). Off for Gemini;
    // other providers ignore the key.
    google: { thinkingConfig: { thinkingBudget: 0 } },
    gateway: {
        models: fallbackModels,
        // The gateway load-balances one model across providers; the deepseek first-party host
        // proved flaky in testing (finishReason "other", retry storms surfacing error parts in
        // the chat) while Fireworks stayed clean — prefer it, without excluding the providers
        // that host the fallback models.
        order: ['fireworks'],
    },
});
