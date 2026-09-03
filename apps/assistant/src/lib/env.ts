export type AssistantEnvironment =
    | 'local'
    | 'development'
    | 'preview'
    | 'production';

const assistantEnvironments: AssistantEnvironment[] = [
    'local',
    'development',
    'preview',
    'production',
];

const isAssistantEnvironment = (
    value?: string,
): value is AssistantEnvironment =>
    assistantEnvironments.includes(value as AssistantEnvironment);

// Unset / empty / non-numeric → undefined (config defaults apply); an explicit 0 stays 0 — e.g.
// ASSISTANT_RATE_LIMIT_RPM=0 is a valid block-everything kill switch, not a missing value.
const parseOptionalNumber = (value?: string): number | undefined => {
    if (value == null || value === '') {
        return undefined;
    }

    const parsed = Number(value);

    return Number.isNaN(parsed) ? undefined : parsed;
};

// Shared with the Aragon backend's `AI_ANALYSIS_ASSISTANT_SECRET` default. Only ever accepted
// outside production; replace with a real 1Password secret when the analysis leaves the proof of
// concept.
export const analysisApiSecretPocDefault = 'poc-analysis-secret';

export const env = {
    // ASSISTANT_ENV is set locally through .env.local; on Vercel the runtime only exposes the
    // automatic VERCEL_ENV (production | preview | development), which maps 1:1 onto our values
    // (dev.assistant.aragon.org is an aliased preview deployment).
    environment: (): AssistantEnvironment => {
        const value = process.env.ASSISTANT_ENV ?? process.env.VERCEL_ENV;

        return isAssistantEnvironment(value) ? value : 'local';
    },
    // `||` (not `??`) so an empty PORT falls back too — Number('') is 0, which would make the
    // server listen on a random OS-assigned port.
    port: (): number => Number(process.env.PORT || 4000),
    linearApiKey: (): string | undefined =>
        process.env.LINEAR_API_KEY || undefined,
    linearTeamId: (): string | undefined =>
        process.env.LINEAR_TEAM_ID || undefined,
    sentryDsn: (): string | undefined => process.env.SENTRY_DSN || undefined,
    blobReadWriteToken: (): string | undefined =>
        process.env.BLOB_READ_WRITE_TOKEN || undefined,
    cronSecret: (): string | undefined => process.env.CRON_SECRET || undefined,
    // Bearer secret of the server-to-server proposal-analysis endpoint (/analysis/*); the Aragon
    // backend holds the same value. Outside production an unset variable falls back to the
    // proof-of-concept value below (the backend's default too), so a dev or preview deployment
    // works before the secret exists in 1Password. In production unset means the endpoint refuses
    // every request.
    analysisApiSecret: (): string | undefined => {
        const configured = process.env.ANALYSIS_API_SECRET || undefined;

        if (configured != null || env.environment() === 'production') {
            return configured;
        }

        return analysisApiSecretPocDefault;
    },
    rateLimitRpm: (): number | undefined =>
        parseOptionalNumber(process.env.ASSISTANT_RATE_LIMIT_RPM),
    rateLimitSessionsPerDay: (): number | undefined =>
        parseOptionalNumber(process.env.ASSISTANT_RATE_LIMIT_SESSIONS_PER_DAY),
};
