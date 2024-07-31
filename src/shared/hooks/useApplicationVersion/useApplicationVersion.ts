import { envLabel } from '@/shared/constants/envLabel';

export const useApplicationVersion = () => {
    const version = process.env.version!;
    const env = envLabel[process.env.NEXT_PUBLIC_ENV!];
    const versionLabel = env != null ? 'versionEnv' : 'version';

    return { version, env, versionLabel };
};
