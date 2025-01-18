import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import type {
    IPermissionCheckGuardParams,
    IPermissionCheckGuardSetting,
    IProposalPermissionCheckGuardResult,
} from '@/modules/governance/types';
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
        pluginRegistryUtils.getSlotFunction<IPermissionCheckGuardParams, IProposalPermissionCheckGuardResult>({
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

    invariant(
        pluginProposalCreationGuardResults.every((result) => result !== undefined),
        'useSppPermissionCheckProposalCreation: Some plugin results are undefined',
    );

    const isLoading = pluginProposalCreationGuardResults.some((result) => result.isLoading);

    // Settings object with plugin name as key

    // Using reduce to accumulate all the settings into a single object
    const settings = pluginProposalCreationGuardResults.reduce<Record<string, IPermissionCheckGuardSetting[]>>(
        (acc, result) => {
            if (result.settings) {
                Object.entries(result.settings).forEach(([key, value]) => {
                    acc[key] = value;
                });
            }
            return acc;
        },
        {},
    );

    return {
        isRestricted: !permissionGranted,
        hasPermission: permissionGranted,
        isLoading,
        permissionSettings: false,
        settings: Object.keys(settings).length ? settings : undefined,
    };
};
