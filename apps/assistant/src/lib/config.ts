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
// as a tool call and drives the documentation tools), time-to-first-token on the streamed reply,
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
