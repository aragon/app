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
    agentModel: 'google/gemini-2.5-flash-lite',
    fallbackModels: ['openai/gpt-oss-20b', 'amazon/nova-micro'],
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
    },
    development: {
        corsAllowedOrigins: [...appOrigins, ...previewOrigins],
        docsSearchEnabled: false,
        rateLimit: defaultRateLimit,
        chat: defaultChat,
    },
    preview: {
        corsAllowedOrigins: [...appOrigins, ...previewOrigins],
        docsSearchEnabled: false,
        rateLimit: defaultRateLimit,
        chat: defaultChat,
    },
    production: {
        corsAllowedOrigins: appOrigins,
        docsSearchEnabled: false,
        rateLimit: defaultRateLimit,
        chat: defaultChat,
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
