import { type AssistantEnvironment, env } from './env';

export interface IAssistantConfig {
    /**
     * Origins allowed to call the API: exact origins or *.suffix patterns. All environments accept
     * the app domain and its subdomains (app.aragon.org, dev.app.aragon.org, stg.app.aragon.org, …);
     * non-production environments additionally accept localhost and Vercel preview deployments.
     */
    corsAllowedOrigins: string[];
}

const appOrigins = ['https://app.aragon.org', '*.app.aragon.org'];
const previewOrigins = ['http://localhost:3000', '*.vercel.app'];

// Non-secret per-environment configuration. Kept as a checked-in typed module because Vercel
// functions receive no .env file at runtime; secrets stay in 1Password and reach the runtime as
// environment variables (see .env.example).
const configByEnvironment: Record<AssistantEnvironment, IAssistantConfig> = {
    local: {
        corsAllowedOrigins: [...appOrigins, ...previewOrigins],
    },
    development: {
        corsAllowedOrigins: [...appOrigins, ...previewOrigins],
    },
    preview: {
        corsAllowedOrigins: [...appOrigins, ...previewOrigins],
    },
    production: {
        corsAllowedOrigins: appOrigins,
    },
};

export const getConfig = (): IAssistantConfig =>
    configByEnvironment[env.environment()];
