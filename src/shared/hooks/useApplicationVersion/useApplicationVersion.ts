const envLabel: Record<string, string | undefined> = {
    development: 'DEV',
    staging: 'STG',
};

interface ApplicationVersion {
    version: string;
    env: string | undefined;
}

export const useApplicationVersion = (): ApplicationVersion => {
    const version = process.env.version!;
    const env = envLabel[process.env.NEXT_PUBLIC_ENV!];
    return { version, env };
};
