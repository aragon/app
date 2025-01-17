import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import type { IPermissionCheckGuardParams, IProposalPermissionCheckGuardResult } from '@/modules/governance/types';
import type { ITokenPermissionCheckProposalCreationParams } from '@/plugins/tokenPlugin/hooks/useTokenPermissionCheckProposalCreation';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { invariant } from '@aragon/gov-ui-kit';
import type { ISppPluginSettings } from '../../types';

export interface IUseSppPermissionCheckProposalCreationParams extends IPermissionCheckGuardParams<ISppPluginSettings> {}

export const useSppPermissionCheckProposalCreation = (
    params: IUseSppPermissionCheckProposalCreationParams,
): IProposalPermissionCheckGuardResult => {
    const { daoId } = params;

    const plugins = useDaoPlugins({ daoId, includeSubPlugins: true });

    invariant(plugins != null, 'useSppPermissionCheckProposalCreation: plugins are required');

    const subPlugins = plugins.filter((plugin) => plugin.meta.isSubPlugin);

    const pluginProposalCreationGuardResults = subPlugins.map(({ meta: plugin }) =>
        pluginRegistryUtils.getSlotFunction<
            ITokenPermissionCheckProposalCreationParams,
            IProposalPermissionCheckGuardResult
        >({
            slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
            pluginId: plugin.subdomain,
        })?.({ plugin: plugin }),
    );

    // Allow proposal creation if either:
    // - All plugins are unrestricted.
    // - At least one plugin is restricted and hasPermission = true.
    const permissionGranted =
        pluginProposalCreationGuardResults.every((result) => !result?.isRestricted) ||
        pluginProposalCreationGuardResults.some((result) => result?.isRestricted && result.hasPermission);

    const isLoading = pluginProposalCreationGuardResults.some((result) => result?.isLoading);

    const settings = pluginProposalCreationGuardResults.map((result) => result?.settings);

    console.log('permissionGranted', permissionGranted, pluginProposalCreationGuardResults);

    return {
        isRestricted: !permissionGranted,
        hasPermission: permissionGranted,
        isLoading,
        permissionSettings: false,
        settings: settings ?? undefined,
    };
};
