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

export const env = {
    // ASSISTANT_ENV is set locally through .env.local; on Vercel the runtime only exposes the
    // automatic VERCEL_ENV (production | preview | development), which maps 1:1 onto our values
    // (dev.assistant.aragon.org is an aliased preview deployment).
    environment: (): AssistantEnvironment => {
        const value = process.env.ASSISTANT_ENV ?? process.env.VERCEL_ENV;

        return isAssistantEnvironment(value) ? value : 'local';
    },
    port: (): number => Number(process.env.PORT ?? 4000),
};
