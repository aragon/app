import type { LanguageModel } from 'ai';
import { getConfig } from '../lib/config';

// Model boundary for the proposal analysis: the route consumes a LanguageModel value, the Gateway
// model id lives in config only.
export const getAnalysisModel = (): LanguageModel => getConfig().analysis.model;

// Wall-clock cap on one report, including the AI SDK's internal retries and a gateway fallback.
// The backend that calls us waits synchronously with its own (longer) timeout, and the user is
// holding a button in the app, so a stalled upstream call must fail here first.
export const analysisTimeoutMs = 45_000;

// The report is six short fields; the cap leaves room for a reasoning model's thinking tokens,
// which count against the same budget.
export const analysisMaxOutputTokens = 6000;

// Version of the system prompt, returned with every report so a stored report can be told apart
// from one written with a later prompt. Bump on every wording change of `analysisPrompt.ts`.
export const analysisPromptVersion = 'v1';

// AI Gateway natively retries a failed call on the fallback models — passed as providerOptions to
// the generateObject call, no custom retry wrapper involved.
export const getAnalysisProviderOptions = () => ({
    // Constrains decoding to the exact report schema when the Gateway routes to the OpenAI API;
    // other providers ignore the key.
    openai: { strictJsonSchema: true },
    gateway: {
        models: getConfig().analysis.fallbackModels,
    },
});
