import { type IProposalAction } from '@/modules/governance/api/governanceService';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import type { INormalizeActionsParams } from '@/modules/governance/types';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import type { ISppPluginSettings } from '../../types';

export interface IUseSppNormalizeActionsParams extends INormalizeActionsParams<ISppPluginSettings> {}

export const useSppNormalizeActions = (params: IUseSppNormalizeActionsParams) => {
    const { actions, settings, daoId } = params;

    const sppPlugins = settings.stages.flatMap((stage) => stage.plugins);
    const normalizedActions = sppPlugins.reduce<IProposalAction[]>((current, plugin) => {
        const normalizeFunction = pluginRegistryUtils.getSlotFunction<INormalizeActionsParams, IProposalAction[]>({
            slotId: GovernanceSlotId.GOVERNANCE_PLUGIN_NORMALIZE_ACTIONS,
            pluginId: plugin.subdomain,
        });

        return normalizeFunction != null
            ? normalizeFunction({ actions: current, daoId, settings: plugin.settings })
            : current;
    }, actions);

    return normalizedActions;
};
