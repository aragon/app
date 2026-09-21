import { type AssistantEnvironment, env } from './env';

/**
 * How strictly one scan engine gates an upload:
 * - `off`: the engine's verdict is ignored entirely.
 * - `optional`: only a positive detection blocks; an engine failure or a missing verdict passes.
 * - `mandatory`: a detection blocks, and so does a missing verdict (fail-closed, retriable).
 */
export type IMalwareEngineMode = 'off' | 'optional' | 'mandatory';

export interface IMalwareScanConfig {
    /**
     * Master switch. When false no scan runs and uploads behave exactly as before.
     */
    enabled: boolean;
    /**
     * Base URL of the file-malware-scanner worker (its /v1/scan contract).
     */
    serviceUrl: string;
    /**
     * Strictness of the AI analyzer.
     */
    claude: IMalwareEngineMode;
    /**
     * Strictness of VirusTotal. Kept `optional` by default: the free tier allows 4 requests per
     * minute and does not know hashes of freshly created files, so its failures must not block.
     */
    virusTotal: IMalwareEngineMode;
    /**
     * Whether the scanner may upload hash-unknown files to VirusTotal. Off for user attachments:
     * uploaded files are shared with the VirusTotal community.
     */
    virusTotalUpload: boolean;
    /**
     * Budget for the scan call; a timeout counts as a missing verdict.
     */
    timeoutMs: number;
}

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
     * Malware scanning of confirmed uploads, before the file is queued for the ticket.
     */
    malwareScan: IMalwareScanConfig;
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

// Attachments are scanned by the file-malware-scanner worker (see the cloudflare-management repo)
// between the blob download and the queueing of the file. Claude is mandatory — it inspects the
// content itself and its verdict is the reason we scan at all — while VirusTotal stays optional:
// on the free tier it rate-limits at 4 requests/minute and returns no verdict for files it has
// never seen, neither of which should cost an honest user their attachment.
const defaultMalwareScan: IMalwareScanConfig = {
    enabled: true,
    serviceUrl: 'https://file-malware-scanner-0.aragon-project.workers.dev',
    claude: 'mandatory',
    virusTotal: 'optional',
    virusTotalUpload: false,
    timeoutMs: 20_000,
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
        malwareScan: defaultMalwareScan,
    },
    development: {
        corsAllowedOrigins: [...appOrigins, ...previewOrigins],
        docsSearchEnabled: false,
        rateLimit: defaultRateLimit,
        chat: defaultChat,
        malwareScan: defaultMalwareScan,
    },
    preview: {
        corsAllowedOrigins: [...appOrigins, ...previewOrigins],
        docsSearchEnabled: false,
        rateLimit: defaultRateLimit,
        chat: defaultChat,
        malwareScan: defaultMalwareScan,
    },
    production: {
        corsAllowedOrigins: appOrigins,
        docsSearchEnabled: false,
        rateLimit: defaultRateLimit,
        chat: defaultChat,
        // Rolled out to dev/preview first; flip `enabled` once the scanner has been observed
        // there (the ASSISTANT_MALWARE_SCAN_ENABLED override can also enable it per deployment).
        malwareScan: { ...defaultMalwareScan, enabled: false },
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
        // Env overrides let a single deployment flip the scan (or loosen one engine) without a
        // code change — the kill switch when the scanner misbehaves in production.
        malwareScan: {
            ...config.malwareScan,
            enabled: env.malwareScanEnabled() ?? config.malwareScan.enabled,
            serviceUrl:
                env.malwareScannerUrl() ?? config.malwareScan.serviceUrl,
            claude: env.malwareScanClaudeMode() ?? config.malwareScan.claude,
            virusTotal:
                env.malwareScanVirusTotalMode() ??
                config.malwareScan.virusTotal,
        },
    };
};
