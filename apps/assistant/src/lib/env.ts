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

// Only an explicit "true"/"false" overrides the per-environment config; anything else (unset,
// empty, typo) leaves the checked-in default in place.
const parseOptionalBoolean = (value?: string): boolean | undefined => {
    if (value === 'true') {
        return true;
    }

    return value === 'false' ? false : undefined;
};

const malwareEngineModes = ['off', 'optional', 'mandatory'] as const;

const parseEngineMode = (
    value?: string,
): (typeof malwareEngineModes)[number] | undefined =>
    malwareEngineModes.find((mode) => mode === value);

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
    rateLimitRpm: (): number | undefined =>
        parseOptionalNumber(process.env.ASSISTANT_RATE_LIMIT_RPM),
    rateLimitSessionsPerDay: (): number | undefined =>
        parseOptionalNumber(process.env.ASSISTANT_RATE_LIMIT_SESSIONS_PER_DAY),
    malwareScanEnabled: (): boolean | undefined =>
        parseOptionalBoolean(process.env.ASSISTANT_MALWARE_SCAN_ENABLED),
    malwareScannerUrl: (): string | undefined =>
        process.env.ASSISTANT_MALWARE_SCANNER_URL || undefined,
    malwareScanClaudeMode: () =>
        parseEngineMode(process.env.ASSISTANT_MALWARE_SCAN_CLAUDE),
    malwareScanVirusTotalMode: () =>
        parseEngineMode(process.env.ASSISTANT_MALWARE_SCAN_VIRUSTOTAL),
    // Cloudflare Access service token for the scanner worker; both halves must be present.
    malwareScannerApiKey: ():
        | { clientId: string; clientSecret: string }
        | undefined => {
        const clientId = process.env.MALWARE_SCANNER_ACCESS_CLIENT_ID;
        const clientSecret = process.env.MALWARE_SCANNER_ACCESS_CLIENT_SECRET;

        return clientId && clientSecret
            ? { clientId, clientSecret }
            : undefined;
    },
};
