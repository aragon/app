import type { IProposalAction as IGukProposalAction } from '@aragon/gov-ui-kit';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import type { IProposalAction } from '../../api/governanceService';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import type { INormalizeActionsParams } from '../../types';

export interface IUseNormalizedProposalActionsParams
    extends INormalizeActionsParams {}

/**
 * Normalizes the proposal actions through every registered plugin normalization function.
 *
 * The normalization functions are hooks themselves (e.g. `useMultisigNormalizeActions`), so this is a hook too: the
 * Rules of Hooks lint then keeps its call sites above any early return. All registered functions run regardless of
 * the DAO, so the number of hooks called stays the same across renders.
 */
export const useNormalizedProposalActions = (
    params: IUseNormalizedProposalActionsParams,
): IGukProposalAction[] => {
    const { actions, daoId } = params;

    // Use all registered normalization functions to make sure we render the native action correctly even if a DAO
    // does not have the related plugin (e.g. a Multisig DAO updating the settings of a Token-based DAO)
    const normalizeFunctions = pluginRegistryUtils.getSlotFunctions<
        INormalizeActionsParams,
        IProposalAction[]
    >(GovernanceSlotId.GOVERNANCE_PLUGIN_NORMALIZE_ACTIONS);

    return normalizeFunctions.reduce(
        (current, normalizeFunction) =>
            normalizeFunction({ actions: current, daoId }),
        actions,
    );
};
