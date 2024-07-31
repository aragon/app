export const envLabel: Record<string, string | undefined> = {
    development: 'DEV',
    staging: 'STG',
};

export const getApplicationVersion = (): string => {
    const version = process.env.version!;
    const env = envLabel[process.env.NEXT_PUBLIC_ENV!];
    const showEnv = env !== undefined;

    return `v${version}${showEnv ? ` (${env})` : ''}`;
};

export const ApplicationVersion: React.FC = () => <>{getApplicationVersion()}</>;
