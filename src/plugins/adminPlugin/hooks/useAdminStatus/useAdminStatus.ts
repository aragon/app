import { useMemberExists } from '@/modules/governance/api/governanceService';
import { useAccount } from 'wagmi';
import { useDaoPlugins } from '../../../../shared/hooks/useDaoPlugins';

export interface IUseAdminStatusParams {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const useAdminStatus = (params: IUseAdminStatusParams) => {
    const { daoId } = params;

    const { address: memberAddress } = useAccount();

    const adminPlugins = useDaoPlugins({ daoId, subdomain: 'admin' });
    const adminPluginAddress = adminPlugins?.[0]?.meta?.address;

    const memberExistsParams = { memberAddress: memberAddress as string, pluginAddress: adminPluginAddress! };

    const { data: isAdminMember } = useMemberExists(
        { urlParams: memberExistsParams },
        { enabled: memberAddress != null && adminPluginAddress != null },
    );

    const adminFeatureEnabled = process.env.NEXT_PUBLIC_FEATURE_GOVERNANCE_DESIGNER === 'true';

    return {
        isAdminMember: isAdminMember && adminFeatureEnabled,
        adminPluginAddress,
    };
};
