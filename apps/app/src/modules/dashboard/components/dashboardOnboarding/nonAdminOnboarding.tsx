'use client';

import { CardEmptyState, Heading } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface INonAdminOnboardingProps {
    /**
     * Display name of the connected user (ENS or truncated address).
     */
    displayName?: string;
    /**
     * Name of the DAO.
     */
    daoName?: string;
    /**
     * URL to the admin members page.
     */
    viewAdminsHref: string;
}

export const NonAdminOnboarding: React.FC<INonAdminOnboardingProps> = (
    props,
) => {
    const { displayName, daoName, viewAdminsHref } = props;

    const { t } = useTranslations();

    return (
        <div className="flex flex-col gap-8">
            <Heading className="text-3xl! md:text-4xl!" size="h1">
                {t('app.dashboard.dashboardOnboarding.nonAdmin.welcome')}{' '}
                {displayName != null && (
                    <span className="text-primary-400">{displayName}</span>
                )}
            </Heading>
            <CardEmptyState
                description={t(
                    'app.dashboard.dashboardOnboarding.nonAdmin.description',
                )}
                heading={t('app.dashboard.dashboardOnboarding.nonAdmin.title', {
                    daoName,
                })}
                humanIllustration={{
                    body: 'BLOCKS',
                    hairs: 'COOL',
                    accessory: 'PIERCINGS_TATTOO',
                    sunglasses: 'SMALL_WEIRD_ONE',
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
