import { useConnection } from 'wagmi';
import { useMemberExists } from '@/modules/governance/api/governanceService';
import { type Network, PluginInterfaceType } from '@/shared/api/daoService';
import { useFeatureFlags } from '@/shared/components/featureFlagsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';

export interface IUseAdminStatusParams {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Network of the DAO.
     */
    network: Network;
}

/**
 * Hook to check if the user is an admin member of the DAO.
 *
 * Note: This will not search any subDAOs of the DAO. It will only check admin members of the DAO specified directly.
 */
export const useAdminStatus = (params: IUseAdminStatusParams) => {
    const { daoId, network } = params;

    const { address: memberAddress } = useConnection();

    const adminPlugin = useDaoPlugins({
        daoId,
        interfaceType: PluginInterfaceType.ADMIN,
        includeSubDaos: false,
    })?.[0]?.meta;

    const memberExistsParams = {
        urlParams: {
            memberAddress: memberAddress as string,
            pluginAddress: adminPlugin?.address as string,
            network,
        },
        queryParams: { network },
    };

    const { data: isAdminMember } = useMemberExists(memberExistsParams, {
        enabled: memberAddress != null && adminPlugin != null,
    });

    const { isEnabled } = useFeatureFlags();
    const adminFeatureEnabled = isEnabled('governanceDesigner');

    return {
        isAdminMember: isAdminMember?.status === true && adminFeatureEnabled,
        adminPlugin,
    };
};
