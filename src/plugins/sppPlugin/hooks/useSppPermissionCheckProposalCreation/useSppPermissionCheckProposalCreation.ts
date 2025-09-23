import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { useSimulateProposalCreation } from '@/modules/governance/hooks/useSimulateProposal';
import type { IPermissionCheckGuardParams, IPermissionCheckGuardResult } from '@/modules/governance/types';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { addressUtils, invariant } from '@aragon/gov-ui-kit';
import type { ISppPluginSettings } from '../../types';

export interface IUseSppPermissionCheckProposalCreationParams
    extends IPermissionCheckGuardParams<IDaoPlugin<ISppPluginSettings>> {}

export const useSppPermissionCheckProposalCreation = (
    params: IUseSppPermissionCheckProposalCreationParams,
): IPermissionCheckGuardResult => {
    const { daoId, plugin, useConnectedUserInfo = true } = params;

    const daoPlugins = useDaoPlugins({ daoId, includeSubPlugins: true });

    invariant(daoPlugins != null, 'useSppPermissionCheckProposalCreation: Plugins are required');

    const { isLoading: isSimulationLoading, isSuccess: hasSimulationSucceeded } = useSimulateProposalCreation({
        plugin,
    });

    const sppPlugins = plugin.settings.stages.flatMap((stage) => stage.plugins);

    // Find the sub plugins that are part of the DAO and filter out any potential undefined values
    const subPlugins = sppPlugins
        .map((sppPlugin) => daoPlugins.find(({ meta }) => addressUtils.isAddressEqual(meta.address, sppPlugin.address)))
        .filter((plugin) => plugin != undefined);

    const pluginProposalCreationGuardResults = subPlugins.map(({ meta: plugin }) =>
        pluginRegistryUtils.getSlotFunction<IPermissionCheckGuardParams, IPermissionCheckGuardResult>({
            slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
            pluginId: plugin.interfaceType,
        })?.({ plugin, daoId, useConnectedUserInfo }),
    );

    // Allow proposal creation if either:
    // OLD LOGIC:
    //   - All plugins are unrestricted.
    //   - User has permission on at least one restricted plugin.
    // NEW LOGIC:
    //   - Simulation is successful.
    //
    // GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION is now used only to get settings in the SPP case (we still miss settings for Safe bodies, though).
    const permissionGranted = hasSimulationSucceeded;

    const isLoading = isSimulationLoading || pluginProposalCreationGuardResults.some((result) => result?.isLoading);

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
