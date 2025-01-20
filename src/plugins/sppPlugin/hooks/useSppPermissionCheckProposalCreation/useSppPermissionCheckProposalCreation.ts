import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import type { IPermissionCheckGuardParams, IPermissionCheckGuardResult } from '@/modules/governance/types';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { addressUtils, invariant } from '@aragon/gov-ui-kit';
import type { ISppPluginSettings } from '../../types';

export interface IUseSppPermissionCheckProposalCreationParams extends IPermissionCheckGuardParams<ISppPluginSettings> {}

export const useSppPermissionCheckProposalCreation = (
    params: IUseSppPermissionCheckProposalCreationParams,
): IPermissionCheckGuardResult => {
    const { daoId, plugin } = params;

    const daoPlugins = useDaoPlugins({ daoId, includeSubPlugins: true });

    invariant(daoPlugins != null, 'useSppPermissionCheckProposalCreation: Plugins are required');

    const sppPlugins = plugin.settings.stages.flatMap((stage) => stage.plugins);

    // Find the sub plugins that are part of the DAO and filter out any potential undefined values
    const subPlugins = sppPlugins
        .map((sppPlugin) => daoPlugins.find(({ meta }) => addressUtils.isAddressEqual(meta.address, sppPlugin.address)))
        .filter((plugin) => plugin != undefined);

    const pluginProposalCreationGuardResults = subPlugins.map(({ meta: plugin }) =>
        pluginRegistryUtils.getSlotFunction<IPermissionCheckGuardParams, IPermissionCheckGuardResult>({
            slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
            pluginId: plugin.subdomain,
        })?.({ plugin, daoId }),
    );

    // Allow proposal creation if either:
    // - All plugins are unrestricted.
    // - At least one plugin is restricted and hasPermission = true.
    const permissionGranted =
        pluginProposalCreationGuardResults.every((result) => !result?.isRestricted) ||
        pluginProposalCreationGuardResults.some((result) => result?.isRestricted && result.hasPermission);

    const isLoading = pluginProposalCreationGuardResults.some((result) => result?.isLoading);

    // Individual settings are returned as a nested array, so we need to flatten them
    const settings = pluginProposalCreationGuardResults.flatMap((result) =>
        result?.isRestricted ? result.settings : [],
    );

    return {
        hasPermission: permissionGranted,
        settings,
        isLoading,
        isRestricted: !permissionGranted,
    };
};
