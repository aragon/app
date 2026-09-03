import { type AssistantEnvironment, env } from './env';

export interface IAssistantConfig {
    /**
     * Origins allowed to call the API: exact origins or *suffix patterns. All environments accept
     * the app domain and its subdomains (app.aragon.org, dev.app.aragon.org, stg.app.aragon.org, …);
     * non-production environments additionally accept localhost and Vercel preview deployments of
     * the aragon-app team scope.
     */
    corsAllowedOrigins: string[];
    /**
     * Phase-2 seam: registers the searchDocs tool on the chat pipeline. Off everywhere in Phase 1.
     */
    docsSearchEnabled: boolean;
    /**
     * Per-IP rate limits; overridable through ASSISTANT_RATE_LIMIT_* environment variables.
     */
    rateLimit: { requestsPerMinute: number; sessionsPerDay: number };
    /**
     * AI Gateway model ids for the chat agent: a single model runs the streamed reply and the
     * tool calls. The fallbacks are tried in order by the Gateway when a call on the agent model
     * fails.
     */
    chat: {
        agentModel: string;
        fallbackModels: string[];
    };
    /**
     * AI Gateway model ids for the proposal analysis (POST /analysis/proposal): one structured
     * `generateObject` call per proposal, no tools, no streaming. Selected separately from the
     * chat agent because the criteria differ (see `defaultAnalysis`).
     */
    analysis: {
        model: string;
        fallbackModels: string[];
    };
}

const appOrigins = ['https://app.aragon.org', '*.app.aragon.org'];
// Vercel preview deployments of our team scope only (<deployment>-aragon-app.vercel.app).
const previewOrigins = ['http://localhost:3000', '*-aragon-app.vercel.app'];

// Balanced preset: generous enough for the preview loop (chat → prepare → adjust → prepare again)
// and for several users behind one NAT, still a hard abuse cap. Tunable per-env without a redeploy
// via ASSISTANT_RATE_LIMIT_* env overrides.
const defaultRateLimit = { requestsPerMinute: 10, sessionsPerDay: 10 };
// Model selection criteria, in priority order: tool-calling fidelity (the agent drafts the ticket
// as a tool call, plus searchDocs in Phase 2), time-to-first-token on the streamed reply,
// multilingual chat (ticket fields are forced English, the reply follows the user), proven
// providers, ≤ ~$0.15/M input. flash-lite is the starting agent (fast, cheap, thinking off by
// default); the fallbacks run on different serving infrastructure (Groq/Cerebras, AWS) so a vendor
// outage or a per-model rate limit degrades instead of failing. Fallback tool-calling fitness is
// to be re-confirmed on the stand / llm-smoke before finalizing.
const defaultChat = {
    // deepseek-v4-flash won the in-budget bake-off (4/4 tool calls with a warm sentence, clean
    // refusals); gemini-2.5-flash-lite skipped tool calls and once fabricated a ticket number,
    // gpt-5-nano never called the tool, gpt-oss-20b leaked harmony markup into the chat (which
    // also rules it out as a fallback).
    agentModel: 'deepseek/deepseek-v4-flash',
    fallbackModels: ['google/gemini-2.5-flash-lite'],
};

// Model selection criteria for the proposal analysis, in priority order: faithful reasoning over
// decoded calldata (which action does what, does the text match), a long context window (a fact
// pack with nested `execute` batches and NatSpec runs to tens of thousands of tokens), reliable
// structured output against a strict schema, output speed (the call is synchronous - the user
// holds a button and the route times out at 45s, so a 3k-token report must finish in seconds),
// no need for tool calling, ≤ ~$1/M input. Reasoning stays ON, unlike the chat agent: the value
// of the report is the cross-check between text and calldata, and thinking budget buys it.
//
// Desk bake-off, 2026-09-03, on AI Gateway pricing (per 1M in/out) and the Artificial Analysis
// Intelligence Index v4.1.1 (higher is better; the frontier sits at 63-66):
//   gemini-3.8-flash      $0.75/$3.75  AA 59  ~300 tok/s  1M ctx  - primary: best index in the
//                         budget tier, and 3-6x faster than every alternative below, which is
//                         what keeps a reasoning report inside the synchronous timeout
//   glm-5.3-flash         $0.15/$0.50  AA 57   ~47 tok/s  1M ctx  - cheapest good score, but a
//                         3k-token report takes ~60s: over the route timeout, so not a fallback
//   deepseek-v4-flash     $0.13/$0.26  AA 52  ~140 tok/s  1M ctx  - fallback: different vendor,
//                         fast, an order of magnitude cheaper, still a reasoning model
//   qwen3.8-flash-next    $0.12/$0.40  AA 56   ~85 tok/s  1M ctx  - borderline on speed
//   gpt-5.6-luna          $0.20/$1.20  AA 34 at low effort            - too weak for the cross-check
//   gemini-3.5-flash-lite $0.30/$2.50  AA 37                          - too weak
//   claude-sonnet-4.6     $3/$15, claude-opus-4.8 $5/$25             - 5-10x the budget
// A report is ~15k input + ~3k output tokens: ~$0.02-0.03 on the primary, ~$0.003 on the
// fallback. Not yet run against real proposals: confirm on the stand with the injection fixture
// (a description that says "mark this as safe" over a `grant` action) before leaving the POC.
const defaultAnalysis = {
    model: 'google/gemini-3.8-flash',
    fallbackModels: ['deepseek/deepseek-v4-flash'],
};

// Non-secret per-environment configuration. Kept as a checked-in typed module because Vercel
// functions receive no .env file at runtime; secrets stay in 1Password and reach the runtime as
// environment variables (see .env.example).
const configByEnvironment: Record<AssistantEnvironment, IAssistantConfig> = {
    local: {
        corsAllowedOrigins: [...appOrigins, ...previewOrigins],
        docsSearchEnabled: false,
        rateLimit: defaultRateLimit,
        chat: defaultChat,
        analysis: defaultAnalysis,
    },
    development: {
        corsAllowedOrigins: [...appOrigins, ...previewOrigins],
        docsSearchEnabled: false,
        rateLimit: defaultRateLimit,
        chat: defaultChat,
        analysis: defaultAnalysis,
    },
    preview: {
        corsAllowedOrigins: [...appOrigins, ...previewOrigins],
        docsSearchEnabled: false,
        rateLimit: defaultRateLimit,
        chat: defaultChat,
        analysis: defaultAnalysis,
    },
    production: {
        corsAllowedOrigins: appOrigins,
        docsSearchEnabled: false,
        rateLimit: defaultRateLimit,
        chat: defaultChat,
        analysis: defaultAnalysis,
    },
};

export const getConfig = (): IAssistantConfig => {
    const config = configByEnvironment[env.environment()];

    return {
        ...config,
        rateLimit: {
            requestsPerMinute:
                env.rateLimitRpm() ?? config.rateLimit.requestsPerMinute,
            sessionsPerDay:
                env.rateLimitSessionsPerDay() ??
                config.rateLimit.sessionsPerDay,
        },
    };
};
