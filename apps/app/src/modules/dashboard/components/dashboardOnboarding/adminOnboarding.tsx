'use client';

import { Heading } from '@aragon/gov-ui-kit';
import { CtaCard } from '@/shared/components/ctaCard';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IAdminOnboardingProps {
    /**
     * Display name of the connected user (ENS or truncated address).
     */
    displayName?: string;
    /**
     * Callback to open the governance designer dialog.
     */
    onAddGovernance: () => void;
}

export const AdminOnboarding: React.FC<IAdminOnboardingProps> = (props) => {
    const { displayName, onAddGovernance } = props;

    const { t } = useTranslations();

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
                <Heading className="text-3xl! md:text-4xl!" size="h1">
                    {t('app.dashboard.dashboardOnboarding.admin.welcome')}{' '}
                    {displayName != null && (
                        <span className="text-primary-400">{displayName}</span>
                    )}
                    <br />
                    {t('app.dashboard.dashboardOnboarding.admin.subtitle')}
                </Heading>
                <p className="text-base text-neutral-500 md:text-lg">
                    {t('app.dashboard.dashboardOnboarding.admin.description')}
                </p>
            </div>
            <div className="flex flex-col gap-6">
                <CtaCard
                    description={t(
                        'app.dashboard.dashboardOnboarding.admin.enterprise.description',
                    )}
                    isPrimary={true}
                    objectType="USERS"
                    primaryAction={{
                        href: 'https://www.aragon.org/get-assistance-form',
                        label: t(
                            'app.dashboard.dashboardOnboarding.admin.enterprise.action',
                        ),
                    }}
                    tag={t(
                        'app.dashboard.dashboardOnboarding.admin.enterprise.tag',
                    )}
                    title={t(
                        'app.dashboard.dashboardOnboarding.admin.enterprise.title',
                    )}
                />
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-neutral-100" />
                    <span className="text-neutral-300 text-sm">
                        {t('app.dashboard.dashboardOnboarding.admin.divider')}
                    </span>
                    <div className="h-px flex-1 bg-neutral-100" />
                </div>
                <CtaCard
                    description={t(
                        'app.dashboard.dashboardOnboarding.admin.free.description',
                    )}
                    isPrimary={false}
                    objectType="SMART_CONTRACT"
                    primaryAction={{
                        label: t(
                            'app.dashboard.dashboardOnboarding.admin.free.addGovernance',
                        ),
                        onClick: onAddGovernance,
                    }}
                    secondaryAction={{
                        label: t(
                            'app.dashboard.dashboardOnboarding.admin.free.viewDocs',
                        ),
                        href: 'https://docs.aragon.org',
                    }}
                    title={t(
                        'app.dashboard.dashboardOnboarding.admin.free.title',
                    )}
                />
            </div>
        </div>
    );
};
