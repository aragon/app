import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import type { IActionComposerPluginData } from '@/modules/governance/types';
import type { IDao, IDaoPlugin } from '../../../api/daoService';
import { pluginRegistryUtils } from '../../../utils/pluginRegistryUtils';

class ActionComposerUtils {
    getPluginActionsFromDao = (dao?: IDao) => {
        const pluginActions =
            dao?.plugins.map((plugin) =>
                pluginRegistryUtils.getSlotFunction<IDaoPlugin, IActionComposerPluginData>({
                    pluginId: plugin.interfaceType,
                    slotId: GovernanceSlotId.GOVERNANCE_PLUGIN_ACTIONS,
                })?.(plugin),
            ) ?? [];
        const pluginItems = pluginActions.flatMap((data) => data?.items ?? []);
        const pluginGroups = pluginActions.flatMap((data) => data?.groups ?? []);
        const pluginComponents = pluginActions.reduce((acc, data) => ({ ...acc, ...data?.components }), {});

        return {
            pluginItems,
            pluginGroups,
            pluginComponents,
        };
    };
}

export const actionComposerUtils = new ActionComposerUtils();
