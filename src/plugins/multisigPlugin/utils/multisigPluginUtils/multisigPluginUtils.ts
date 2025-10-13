import type { IDaoPlugin } from '@/shared/api/daoService';
import { versionComparatorUtils } from '@/shared/utils/versionComparatorUtils';

export interface IMultisigPluginHasExecutePermissionParams {
    /**
     * Multisig plugin to check if version has EXECUTE_PROPOSAL_PERMISSION auth guard set in execute() smart contract function.
     */
    plugin: IDaoPlugin;
}

class MultisigPluginUtils {
    hasExecuteProposalPermissionGuard = (params: IMultisigPluginHasExecutePermissionParams): boolean => {
        const { plugin } = params;

        const normalisedPluginVersion = versionComparatorUtils.normaliseComparatorInput({
            build: plugin.build,
            release: plugin.release,
        });
        const hasExecuteProposalPermissionGuard = versionComparatorUtils.isGreaterOrEqualTo(normalisedPluginVersion, {
            release: 1,
            build: 3,
        });

        return hasExecuteProposalPermissionGuard;
    };
}

export const multisigPluginUtils = new MultisigPluginUtils();
