import { useTranslations } from '@/shared/components/translationsProvider';
import { EmptyState, IconType } from '@aragon/ods';

export const ErrorFallback = () => {
    const { t } = useTranslations();

    return (
        <div className="flex grow flex-col items-center justify-center">
            <EmptyState
                heading={t('app.application.errorFallback.title')}
                description={t('app.application.errorFallback.description')}
                objectIllustration={{
                    object: 'WARNING',
                }}
                primaryButton={{
                    label: t('app.application.errorFallback.explore'),
                    href: '/',
                }}
                secondaryButton={{
                    label: t('app.application.errorFallback.report'),
                    href: 'https://aragonassociation.atlassian.net/servicedesk/customer/portal/3',
                    target: '_blank',
                    iconRight: IconType.LINK_EXTERNAL,
                }}
            />
        </div>
    );
};
