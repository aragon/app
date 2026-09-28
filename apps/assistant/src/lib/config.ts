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
     * Registers the documentation tools (searchDocs, readDoc, listDocs) on the chat pipeline and
     * switches the agent from "no product knowledge" to answering product questions from the
     * documentation index. Production stays dark until enough pages are validated — a separate
     * decision.
     */
    docsSearchEnabled: boolean;
    /**
     * Which pages the documentation index is built from (at build time, see
     * docs/buildDocsIndex.ts): `ready` is the product-owner-validated set the public docs
     * site will publish (pages whose `status: draft` the owner removed, or marked `ready`);
     * `drafts` adds the pages still under review, so the non-production environments have a real
     * corpus to test against while the review is in progress.
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
// The chain is chosen with the eval (evals/, `pnpm eval`): every kind of conversation the chat
// gets, deterministic checks of the prompt's rules and a judge grading accuracy, helpfulness and
// communication against a reference. Only models with a zero-data-retention host qualify. The
// fallbacks run on other serving infrastructure than the agent (OpenAI and Azure against the
// third-party DeepSeek hosts), so an outage or a per-model rate limit degrades instead of
// failing. A fallback takes over a call that fails or stalls, not an answer that is weak.
const defaultChat: IAssistantConfig['chat'] = {
    // Eval of 2026-09-28, each model at its level below, two runs of each scenario — checks passed
    // with the documentation tools on (two sweeps) and intake only, cost of a documentation
    // answer: gpt-6-luna at medium 38 and 36 of 44, 21 of 24, a tenth of a cent;
    // deepseek-v4.1-flash at low 34 and 35 of 44, 17 of 24, half a cent; gpt-6-sol at low 40 and 41
    // of 44, 22 of 24, two cents. The agent is the cheapest model that answers well, gpt-6-sol the
    // last resort. gemini-2.5-flash-lite (13 of 44) left the chain. The most common failure left
    // is the fixed sentence the prompt asks for in front of a draft.
    agentModel: 'openai/gpt-6-luna',
    fallbackModels: ['deepseek/deepseek-v4.1-flash', 'openai/gpt-6-sol'],
    reasoning: {
        'openai/gpt-6-luna': 'medium',
        'deepseek/deepseek-v4.1-flash': 'low',
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
        docsSearchEnabled: true,
        docsCorpus: 'drafts',
        docs: defaultDocsModels,
        rateLimit: defaultRateLimit,
        chat: defaultChat,
    },
    development: {
        corsAllowedOrigins: [...appOrigins, ...previewOrigins],
        docsSearchEnabled: true,
        docsCorpus: 'drafts',
        docs: defaultDocsModels,
        rateLimit: defaultRateLimit,
        chat: defaultChat,
    },
    preview: {
        corsAllowedOrigins: [...appOrigins, ...previewOrigins],
        docsSearchEnabled: true,
        docsCorpus: 'drafts',
        docs: defaultDocsModels,
        rateLimit: defaultRateLimit,
        chat: defaultChat,
    },
    production: {
        corsAllowedOrigins: appOrigins,
        docsSearchEnabled: false,
        docsCorpus: 'ready',
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
