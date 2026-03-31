'use client';

import { addressUtils, invariant } from '@aragon/gov-ui-kit';
import type { Hex } from 'viem';
import { useConnection } from 'wagmi';
import { CreateDaoDialogId } from '@/modules/createDao/constants/createDaoDialogId';
import type { ICreateProcessDetailsDialogParams } from '@/modules/createDao/dialogs/createProcessDetailsDialog';
import { useEnsName } from '@/modules/ens';
import { daoMembersPageFilterParam } from '@/modules/governance/pages/daoMembersPage';
import type { IDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useAdminStatus } from '@/shared/hooks/useAdminStatus';
import { daoUtils } from '@/shared/utils/daoUtils';
import { AdminOnboarding } from './adminOnboarding';
import { NonAdminOnboarding } from './nonAdminOnboarding';

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
    const { address, isConnected } = useConnection();
    const { data: ensName } = useEnsName(address);

    const {
        isAdminMember,
        adminPlugin,
        isLoading: isAdminMemberLoading,
    } = useAdminStatus({
        daoId: dao.id,
        network: dao.network,
    });

    const displayName =
        ensName ??
        (address ? addressUtils.truncateAddress(address) : undefined);

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

    // To avoid rendering NonAdminOnboarding first even if user is a member
    // If not connected, NonAdminOnboarding should be rendered
    if (isConnected && isAdminMemberLoading) {
        return null;
    }

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
            daoName={dao.name}
            displayName={displayName}
            viewAdminsHref={viewAdminsHref}
        />
    );
};
