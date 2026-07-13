import type { LanguageModel } from 'ai';
import { getConfig } from '../lib/config';

// The two model roles of the pipeline: 'intake' covers the structured steps (classifyIntent,
// extractFields — precision over latency, minimal reasoning helps edge cases), 'respond' is the
// user-facing streamed reply (time-to-first-token over everything else).
export type ChatStep = 'intake' | 'respond';

// Model boundary: everything below the routes consumes LanguageModel values; the Gateway model
// ids (and the per-step assignment) live in config only.
export const getChatModel = (step: ChatStep): LanguageModel =>
    step === 'respond'
        ? getConfig().chat.respondModel
        : getConfig().chat.intakeModel;

// Wall-clock caps per model call (including the AI SDK's internal retries): a stalled upstream
// call must fail fast so the user can retry, instead of burning the function timeout (observed:
// a single gateway call hanging for 34s). Intake calls are small structured outputs; respond
// streams up to maxOutputTokens and gets more room.
export const intakeStepTimeoutMs = 15_000;
export const respondTimeoutMs = 30_000;

// AI Gateway natively retries a failed call on these fallback models — passed as providerOptions
// to every generateText/streamText call, no custom retry wrapper involved.
export const getChatProviderOptions = () => ({
    // gpt-5-nano is a reasoning model; the intake flow needs no chain-of-thought and default
    // reasoning added ~7s per step. 'minimal' cuts it while keeping the (cheap) model. The
    // 'openai' key only applies when the Gateway routes to the OpenAI API (gpt-5-nano); the
    // other models in the chain are served by other providers and ignore it.
    //
    // strictJsonSchema constrains decoding to the exact output schema on structured calls
    // (classify/extract) — without it the schema is advisory and the model drifts from it
    // (observed: steps emitted as an array where a string was requested, broken JSON). It only
    // works together with required-but-nullable schemas: strict mode over optional fields lets
    // the model omit them, which produced empty extractions. Calls without an output schema
    // (respond) ignore the option.
    openai: { reasoningEffort: 'minimal', strictJsonSchema: true },
    gateway: { models: getConfig().chat.fallbackModels },
});
