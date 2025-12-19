import type { IDaoPlugin } from '@/shared/api/daoService';
import { pluginMetaUtils } from '@/shared/utils/pluginMetaUtils';

export interface IAdminPluginHasExecutePermissionParams {
    /**
     * Token plugin to check if version has EXECUTE_PROPOSAL_PERMISSION auth modifier set in execute() smart contract function.
     */
    plugin: IDaoPlugin;
}

class AdminPluginUtils {
    hasExecuteProposalPermissionModifier = (
        params: IAdminPluginHasExecutePermissionParams,
    ): boolean => {
        const { plugin } = params;
        const hasExecuteProposalPermissionGuard =
            pluginMetaUtils.isVersionGreaterOrEqualTo(plugin, {
                release: 1,
                build: 2,
            });

        return hasExecuteProposalPermissionGuard;
    };
}

export const adminPluginUtils = new AdminPluginUtils();
