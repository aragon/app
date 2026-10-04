import type { IChatReasoning } from '../chat/models';
import type { IDocsCorpusMode } from '../docs/corpus';
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
     * Which pages the documentation index is built from (at build time, see
     * docs/buildDocsIndex.ts): `ready` is the product-owner-validated set the public docs
     * site will publish (pages whose `status: draft` the owner removed, or marked `ready`);
     * `drafts` adds the pages still under review. Every environment answers from `drafts`: the
     * product owner considers the draft content correct and only its wording unreviewed, so the
     * chatbot may use it while the public docs site shows the reviewed pages only.
     */
    docsCorpus: IDocsCorpusMode;
    /**
     * AI Gateway model ids of the documentation search: the embedding model the index is built
     * with (and queries are embedded with, at runtime) and the reranker that orders the candidate
     * passages before they reach the agent.
     */
    docs: {
        embeddingModel: string;
        rerankModel: string;
    };
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
        /**
         * Reasoning level of each model of the chain, applied to the attempts that model serves
         * (see getChatReasoning).
         */
        reasoning: Record<string, IChatReasoning>;
    };
}

const appOrigins = ['https://app.aragon.org', '*.app.aragon.org'];
// Vercel preview deployments of our team scope only (<deployment>-aragon-app.vercel.app).
const previewOrigins = ['http://localhost:3000', '*-aragon-app.vercel.app'];

// Balanced preset: generous enough for the preview loop (chat → prepare → adjust → prepare again)
// and for several users behind one NAT, still a hard abuse cap. Tunable per-env without a redeploy
// via ASSISTANT_RATE_LIMIT_* env overrides.
const defaultRateLimit = { requestsPerMinute: 10, sessionsPerDay: 10 };
// Only models with a zero-data-retention host qualify (see getChatProviderOptions). The agent is
// the model that reads the documentation best at a low price, chosen by reading the same
// conversations side by side on every candidate. The fallbacks run on other serving
// infrastructure, so an outage or a per-model rate limit degrades instead of failing; they take
// over a call that fails or stalls, never an answer that is weak.
const defaultChat: IAssistantConfig['chat'] = {
    agentModel: 'deepseek/deepseek-v4.1-flash',
    fallbackModels: ['openai/gpt-6-luna', 'openai/gpt-6-sol'],
    reasoning: {
        'openai/gpt-6-luna': 'medium',
        'deepseek/deepseek-v4.1-flash': 'medium',
        'openai/gpt-6-sol': 'low',
    },
};
// Retrieval models settled in the APP-1069 analysis: voyage-4 for its retrieval quality at
// $0.06/M (embedding the whole corpus costs about a cent per build), rerank-2.5-lite because the
// candidate set is small (20 passages) and the lite tier at $0.02/M reorders it well enough.
const defaultDocsModels = {
    embeddingModel: 'voyage/voyage-4',
    rerankModel: 'voyage/rerank-2.5-lite',
};

// Non-secret per-environment configuration. Kept as a checked-in typed module because Vercel
// functions receive no .env file at runtime; secrets stay in 1Password and reach the runtime as
// environment variables (see .env.example).
const configByEnvironment: Record<AssistantEnvironment, IAssistantConfig> = {
    local: {
        corsAllowedOrigins: [...appOrigins, ...previewOrigins],
        docsCorpus: 'drafts',
        docs: defaultDocsModels,
        rateLimit: defaultRateLimit,
        chat: defaultChat,
    },
    development: {
        corsAllowedOrigins: [...appOrigins, ...previewOrigins],
        docsCorpus: 'drafts',
        docs: defaultDocsModels,
        rateLimit: defaultRateLimit,
        chat: defaultChat,
    },
    preview: {
        corsAllowedOrigins: [...appOrigins, ...previewOrigins],
        docsCorpus: 'drafts',
        docs: defaultDocsModels,
        rateLimit: defaultRateLimit,
        chat: defaultChat,
    },
    production: {
        corsAllowedOrigins: appOrigins,
        docsCorpus: 'drafts',
        docs: defaultDocsModels,
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
