import { addressUtils, invariant } from '@aragon/gov-ui-kit';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { useSimulateProposalCreation } from '@/modules/governance/hooks/useSimulateProposal';
import type {
    IPermissionCheckGuardParams,
    IPermissionCheckGuardResult,
} from '@/modules/governance/types';
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
        // In this stacked branch the unified Safe slot creates native Safe processes. SPP Safe
        // bodies must keep using their stage's SafeOwnerCondition instead of that process guard,
        // including when the same Safe is installed as both a body and a process.
        const usesStageCondition =
            sppPlugin.interfaceType === PluginInterfaceType.SAFE ||
            ('brandId' in sppPlugin &&
                sppPlugin.brandId === VotingBodyBrandIdentity.SAFE);
        const subPlugin =
            !usesStageCondition && sppPlugin.interfaceType != null
                ? daoPlugins.find(({ meta }) =>
                      addressUtils.isAddressEqual(
                          meta.address,
                          sppPlugin.address,
                      ),
                  )
                : undefined;

        // Internal bodies not installed on the DAO can't be resolved, so skip them.
        if (
            subPlugin == null &&
            sppPlugin.interfaceType != null &&
            !usesStageCondition
        ) {
            return undefined;
        }

        // Installed bodies delegate to their own permission-check slot. Safe stage descriptors and
        // external proposers use the condition the SPP process was created with.
        const bodyPlugin = (subPlugin?.meta ?? sppPlugin) as IDaoPlugin;
        const permissionCheck =
            usesStageCondition || subPlugin == null
                ? useSppExternalPermissionCheckProposalCreation
                : (pluginRegistryUtils.getSlotFunction<
                      IPermissionCheckGuardParams,
                      IPermissionCheckGuardResult
                  >({
                      slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
                      pluginId: subPlugin.meta.interfaceType,
                  }) ?? useSppExternalPermissionCheckProposalCreation);

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
