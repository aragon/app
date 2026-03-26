'use client';

import { EmptyState, Heading } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface INonAdminOnboardingProps {
    /**
     * Display name of the connected user (ENS or truncated address).
     */
    displayName: string | null;
    /**
     * URL to the admin members page.
     */
    viewAdminsHref: string;
}

export const NonAdminOnboarding: React.FC<INonAdminOnboardingProps> = (
    props,
) => {
    const { displayName, viewAdminsHref } = props;

    const { t } = useTranslations();

    return (
        <div className="flex flex-col gap-6">
            <Heading size="h1">
                {t('app.dashboard.dashboardOnboarding.nonAdmin.welcome')}{' '}
                {displayName != null && (
                    <span className="text-primary-400">{displayName}</span>
                )}
            </Heading>
            <EmptyState
                description={t(
                    'app.dashboard.dashboardOnboarding.nonAdmin.description',
                )}
                heading={t('app.dashboard.dashboardOnboarding.nonAdmin.title')}
                humanIllustration={{
                    body: 'ELEVATING',
                    hairs: 'SHORT',
                    accessory: 'PIERCINGS_TATTOO',
                    sunglasses: 'LARGE_STYLIZED',
                    expression: 'SMILE_WINK',
                }}
                secondaryButton={{
                    label: t(
                        'app.dashboard.dashboardOnboarding.nonAdmin.viewAdmins',
                    ),
                    href: viewAdminsHref,
                }}
            />
        </div>
    );
};
