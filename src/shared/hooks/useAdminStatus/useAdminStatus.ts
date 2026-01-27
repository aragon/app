import { addressUtils } from '@aragon/gov-ui-kit';
import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useMemberExists } from '@/modules/governance/api/governanceService';
import { type Network, PluginInterfaceType } from '@/shared/api/daoService';
import { useFeatureFlags } from '@/shared/components/featureFlagsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { daoUtils } from '@/shared/utils/daoUtils';

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

    // Get all admin plugins, then filter to only those installed on the main DAO
    // (not subDAOs) to avoid showing admin banner when subDAO has admin plugin
    const allAdminPlugins = useDaoPlugins({
        daoId,
        interfaceType: PluginInterfaceType.ADMIN,
    });

    // Filter to only admin plugins installed on the main DAO (not subDAOs)
    const mainDaoAddress = useMemo(
        () => daoUtils.parseDaoId(daoId).address,
        [daoId],
    );

    const mainDaoAdminPlugin = useMemo(() => {
        return allAdminPlugins?.find((plugin) => {
            const pluginDaoAddress = plugin.meta.daoAddress ?? mainDaoAddress;
            return addressUtils.isAddressEqual(
                pluginDaoAddress,
                mainDaoAddress,
            );
        })?.meta;
    }, [allAdminPlugins, mainDaoAddress]);

    const memberExistsParams = {
        urlParams: {
            memberAddress: memberAddress as string,
            pluginAddress: mainDaoAdminPlugin?.address as string,
            network,
        },
        queryParams: { network },
    };

    const { data: isAdminMember } = useMemberExists(memberExistsParams, {
        enabled: memberAddress != null && mainDaoAdminPlugin != null,
    });

    const { isEnabled } = useFeatureFlags();
    const adminFeatureEnabled = isEnabled('governanceDesigner');

    return {
        isAdminMember: isAdminMember?.status === true && adminFeatureEnabled,
        adminPlugin: mainDaoAdminPlugin,
    };
};
