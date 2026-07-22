import type { LanguageModel } from 'ai';
import { getConfig } from '../lib/config';

// Model boundary: everything below the routes consumes LanguageModel values; the Gateway model id
// lives in config only.
export const getChatModel = (): LanguageModel => getConfig().chat.agentModel;

// Wall-clock cap on the agent stream, including the AI SDK's internal retries and the resume step
// that runs the tool (blob transfer + Linear create): a stalled upstream call must fail fast so
// the user can retry, instead of burning the function timeout (observed: a single gateway call
// hanging for 34s).
export const chatTimeoutMs = 60_000;

// AI Gateway natively retries a failed call on these fallback models — passed as providerOptions
// to every streamText call, no custom retry wrapper involved.
export const getChatProviderOptions = () => ({
    // strictJsonSchema constrains tool-call argument decoding to the exact input schema so the
    // model cannot drift from it. It only applies when the Gateway routes to the OpenAI API;
    // other providers ignore the key.
    openai: { strictJsonSchema: true },
    gateway: { models: getConfig().chat.fallbackModels },
});
