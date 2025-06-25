import { useMemberExists } from '@/modules/governance/api/governanceService';
import type { Network } from '@/shared/api/daoService';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { useAccount } from 'wagmi';

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

    const adminPlugins = useDaoPlugins({ daoId, subdomain: 'admin' });
    const adminPluginAddress = adminPlugins?.[0]?.meta?.address;

    const memberExistsParams = { memberAddress: memberAddress as string, pluginAddress: adminPluginAddress!, network };

    const { data: isAdminMember } = useMemberExists(
        { urlParams: memberExistsParams },
        { enabled: memberAddress != null && adminPluginAddress != null },
    );

    const adminFeatureEnabled = process.env.NEXT_PUBLIC_FEATURE_GOVERNANCE_DESIGNER === 'true';

    return {
        isAdminMember: isAdminMember?.status === true && adminFeatureEnabled,
        adminPluginAddress,
    };
};
