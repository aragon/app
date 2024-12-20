import { useTranslations } from '@/shared/components/translationsProvider';

const envLabel: Record<string, string | undefined> = {
    development: 'DEV',
    staging: 'STG',
    local: 'LOC',
    preview: 'PRE_TEST',
};

export const useApplicationVersion = (): string => {
    const { t } = useTranslations();

    const version = process.env.version!;
    const env = envLabel[process.env.NEXT_PUBLIC_ENV!];

    const versionLabel = env
        ? t('app.shared.useApplicationVersion.versionEnv', { version, env })
        : t('app.shared.useApplicationVersion.version', { version });

    return versionLabel;
};
