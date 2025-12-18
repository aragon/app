import { useAccount } from 'wagmi';
import { useMemberExists } from '@/modules/governance/api/governanceService';
import { type Network, PluginInterfaceType } from '@/shared/api/daoService';
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

export const useAdminStatus = (params: IUseAdminStatusParams) => {
    const { daoId, network } = params;

    const { address: memberAddress } = useAccount();

    const adminPlugin = useDaoPlugins({ daoId, interfaceType: PluginInterfaceType.ADMIN })?.[0]?.meta;

    const memberExistsParams = {
        urlParams: { memberAddress: memberAddress as string, pluginAddress: adminPlugin?.address as string, network },
        queryParams: { network },
    };

    const { data: isAdminMember } = useMemberExists(memberExistsParams, {
        enabled: memberAddress != null && adminPlugin != null,
    });

    const adminFeatureEnabled = process.env.NEXT_PUBLIC_FEATURE_GOVERNANCE_DESIGNER === 'true';

    return {
        isAdminMember: isAdminMember?.status === true && adminFeatureEnabled,
        adminPlugin,
    };
};
