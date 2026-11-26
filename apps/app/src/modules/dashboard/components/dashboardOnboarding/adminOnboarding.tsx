'use client';

import { Heading } from '@aragon/gov-ui-kit';
import { CtaCard } from '@/shared/components/ctaCard';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useHelpCenterLink } from '@/shared/hooks/useHelpCenterLink';

export interface IAdminOnboardingProps {
    /**
     * Display name of the connected user (ENS name or address output).
     */
    displayName?: React.ReactNode;
    /**
     * Callback to open the governance designer dialog.
     */
    onAddGovernance: () => void;
}

export const AdminOnboarding: React.FC<IAdminOnboardingProps> = (props) => {
    const { displayName, onAddGovernance } = props;

    const { t } = useTranslations();

    // The governance area of the help center, the developer portal while the help center is off.
    const docsUrl = useHelpCenterLink({
        path: '/governance',
        fallback: 'https://docs.aragon.org',
    });

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
                <Heading as="h1" typeClassName="type-title-page--onboarding">
                    {t('app.dashboard.dashboardOnboarding.admin.welcome')}{' '}
                    {displayName != null && (
                        <span className="text-accent-primary">
                            {displayName}
                        </span>
                    )}
                    <br />
                    {t('app.dashboard.dashboardOnboarding.admin.subtitle')}
                </Heading>
                <p className="type-body--framework-leading text-surface-secondary">
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
                    <div className="h-px flex-1 bg-surface-tertiary" />
                    <span className="type-supporting--compact-detail text-surface-tertiary-hint">
                        {t('app.dashboard.dashboardOnboarding.admin.divider')}
                    </span>
                    <div className="h-px flex-1 bg-surface-tertiary" />
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
                        href: docsUrl,
                    }}
                    title={t(
                        'app.dashboard.dashboardOnboarding.admin.free.title',
                    )}
                />
            </div>
        </div>
    );
};
