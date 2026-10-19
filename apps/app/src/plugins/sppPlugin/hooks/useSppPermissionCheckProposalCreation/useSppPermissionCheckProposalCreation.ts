import { addressUtils, invariant } from '@aragon/gov-ui-kit';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { useSimulateProposalCreation } from '@/modules/governance/hooks/useSimulateProposal';
import type {
    IPermissionCheckGuardParams,
    IPermissionCheckGuardResult,
} from '@/modules/governance/types';
import { externalPluginId } from '@/plugins/safeMultisigPlugin/constants';
import {
    type IDaoPlugin,
    PluginInterfaceType,
    useDao,
} from '@/shared/api/daoService';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import type { ISppPluginSettings, ISppStagePlugin } from '../../types';
import { SppProposalType, VotingBodyBrandIdentity } from '../../types';
import { useSppExternalPermissionCheckProposalCreation } from '../useSppExternalPermissionCheckProposalCreation';

export interface IUseSppPermissionCheckProposalCreationParams
    extends IPermissionCheckGuardParams<IDaoPlugin<ISppPluginSettings>> {}

export const useSppPermissionCheckProposalCreation = (
    params: IUseSppPermissionCheckProposalCreationParams,
): IPermissionCheckGuardResult => {
    const { daoId, plugin, useConnectedUserInfo = true } = params;

    const daoPlugins = useDaoPlugins({
        daoId,
        includeSubPlugins: true,
        includeLinkedAccounts: true,
    });
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    invariant(
        daoPlugins != null,
        'useSppPermissionCheckProposalCreation: Plugins are required',
    );

    const { isLoading: isSimulationLoading, result: simulationResult } =
        useSimulateProposalCreation({
            plugin,
            network: dao?.network,
        });
    const stageBodies = plugin.settings.stages.flatMap(
        (stage) => stage.plugins,
    );

    // Non-body proposer Safes: shape them as external bodies so the stage-condition fallback
    // (useSppExternalPermissionCheckProposalCreation) resolves them into a Safe eligibility group.
    const externalProposers = (plugin.settings.externalProposers ?? []).map(
        (proposer): ISppStagePlugin => ({
            proposalType: SppProposalType.NONE, // non-body proposers do not vote
            interfaceType: undefined, // marks it external, so the stage condition governs creation
            brandId: VotingBodyBrandIdentity.SAFE,
            address: proposer.address,
            proposalCreationConditionAddress:
                proposer.proposalCreationConditionAddress,
        }),
    );

    const sppPlugins = [...stageBodies, ...externalProposers];

    const pluginProposalCreationGuardResults = sppPlugins.map((sppPlugin) => {
        const canResolvePlugin =
            sppPlugin.interfaceType != null ||
            sppPlugin.brandId === VotingBodyBrandIdentity.SAFE;
        const subPlugin = canResolvePlugin
            ? daoPlugins.find(({ meta }) =>
                  addressUtils.isAddressEqual(meta.address, sppPlugin.address),
              )
            : undefined;

        // Internal bodies not installed on the DAO can't be resolved, so skip them.
        if (subPlugin == null && sppPlugin.interfaceType != null) {
            return undefined;
        }

        const pluginId = subPlugin?.meta.interfaceType ?? externalPluginId;
        // Safe eligibility comes from the SPP stage condition, not the canonical DAO plugin record.
        const bodyPlugin = (
            pluginId === PluginInterfaceType.SAFE
                ? sppPlugin
                : (subPlugin?.meta ?? sppPlugin)
        ) as IDaoPlugin;
        const permissionCheck =
            pluginRegistryUtils.getSlotFunction<
                IPermissionCheckGuardParams,
                IPermissionCheckGuardResult
            >({
                slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
                pluginId,
            }) ?? useSppExternalPermissionCheckProposalCreation;
        return permissionCheck({
            plugin: bodyPlugin,
            daoId,
            useConnectedUserInfo,
        });
    });

    const permissionGranted = simulationResult === 'success';

    const isLoading =
        dao == null ||
        isSimulationLoading ||
        pluginProposalCreationGuardResults.some((result) => result?.isLoading);

    // Individual settings are returned as a nested array, so we need to flatten them
    const settings = pluginProposalCreationGuardResults.flatMap((result) =>
        result?.isRestricted ? result.settings : [],
    );

    // The simulation only checks the connected wallet's permission; whether the process itself is restricted comes
    // from the sub-plugin creation rules.
    const isRestricted = pluginProposalCreationGuardResults.some(
        (result) => result?.isRestricted === true,
    );

    return {
        hasPermission: permissionGranted,
        settings,
        isLoading,
        isRestricted,
    };
};
