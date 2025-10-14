import type { IDaoPlugin } from '@/shared/api/daoService';
import { pluginVersionComparatorUtils } from '@/shared/utils/pluginVersionComparatorUtils';

export interface ITokenPluginHasExecutePermissionParams {
    /**
     * Token plugin to check if version has EXECUTE_PROPOSAL_PERMISSION auth modifier set in execute() smart contract function.
     */
    plugin: IDaoPlugin;
}

class TokenPluginUtils {
    hasExecuteProposalPermissionModifier = (params: ITokenPluginHasExecutePermissionParams): boolean => {
        const { plugin } = params;
        const hasExecuteProposalPermissionGuard = pluginVersionComparatorUtils.isGreaterOrEqualTo(plugin, {
            release: 1,
            build: 3,
        });

        return hasExecuteProposalPermissionGuard;
    };
}

export const tokenPluginUtils = new TokenPluginUtils();
