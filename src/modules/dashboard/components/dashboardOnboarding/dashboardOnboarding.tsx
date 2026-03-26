'use client';

import {
    addressUtils,
    EmptyState,
    Heading,
    invariant,
} from '@aragon/gov-ui-kit';
import type { Hex } from 'viem';
import { useConnection } from 'wagmi';
import { CreateDaoDialogId } from '@/modules/createDao/constants/createDaoDialogId';
import type { ICreateProcessDetailsDialogParams } from '@/modules/createDao/dialogs/createProcessDetailsDialog';
import { useEnsName } from '@/modules/ens';
import { daoMembersPageFilterParam } from '@/modules/governance/pages/daoMembersPage';
import type { IDao } from '@/shared/api/daoService';
import { CtaCard } from '@/shared/components/ctaCard';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useAdminStatus } from '@/shared/hooks/useAdminStatus';
import { daoUtils } from '@/shared/utils/daoUtils';

export interface IDashboardOnboardingProps {
    /**
     * The DAO data.
     */
    dao: IDao;
}

export const DashboardOnboarding: React.FC<IDashboardOnboardingProps> = (
    props,
) => {
    const { dao } = props;

    const { open } = useDialogContext();
    const { address } = useConnection();
    const { data: ensName } = useEnsName(address);

    const { isAdminMember, adminPlugin } = useAdminStatus({
        daoId: dao.id,
        network: dao.network,
    });

    const displayName =
        ensName ?? (address ? addressUtils.truncateAddress(address) : null);

    const daoUrl = daoUtils.getDaoUrl(dao)!;

    const handleAddGovernance = () => {
        invariant(
            adminPlugin != null,
            'DashboardOnboarding: admin plugin is expected.',
        );
        const params: ICreateProcessDetailsDialogParams = {
            daoUrl,
            pluginAddress: adminPlugin.address as Hex,
        };
        open(CreateDaoDialogId.CREATE_PROCESS_DETAILS, { params });
    };

    if (isAdminMember) {
        return (
            <AdminOnboarding
                displayName={displayName}
                onAddGovernance={handleAddGovernance}
            />
        );
    }

    const viewAdminsHref = `${daoUrl}/members?${daoMembersPageFilterParam}=${adminPlugin?.slug ?? ''}`;

    return (
        <NonAdminOnboarding
            displayName={displayName}
            viewAdminsHref={viewAdminsHref}
        />
    );
};

interface IAdminOnboardingProps {
    /**
     * Display name of the connected user (ENS or truncated address).
     */
    displayName: string | null;
    /**
     * Callback to open the governance designer dialog.
     */
    onAddGovernance: () => void;
}

const AdminOnboarding: React.FC<IAdminOnboardingProps> = (props) => {
    const { displayName, onAddGovernance } = props;

    const { t } = useTranslations();

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
                <Heading size="h1">
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
            <div className="flex flex-col gap-4">
                <CtaCard
                    actionHref="https://www.aragon.org/get-assistance-form"
                    actionLabel={t(
                        'app.dashboard.dashboardOnboarding.admin.enterprise.action',
                    )}
                    description={t(
                        'app.dashboard.dashboardOnboarding.admin.enterprise.description',
                    )}
                    isPrimary={true}
                    objectType="USERS"
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
                    actionLabel={t(
                        'app.dashboard.dashboardOnboarding.admin.free.addGovernance',
                    )}
                    actionOnClick={onAddGovernance}
                    description={t(
                        'app.dashboard.dashboardOnboarding.admin.free.description',
                    )}
                    isPrimary={false}
                    objectType="SMART_CONTRACT"
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

interface INonAdminOnboardingProps {
    /**
     * Display name of the connected user (ENS or truncated address).
     */
    displayName: string | null;
    /**
     * URL to the admin members page.
     */
    viewAdminsHref: string;
}

const NonAdminOnboarding: React.FC<INonAdminOnboardingProps> = (props) => {
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
