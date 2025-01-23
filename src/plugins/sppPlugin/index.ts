import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { SppProposalList } from '@/plugins/sppPlugin/components/sppProposalList';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { SppCreateProposalSettingsForm } from './components/sppCreateProposalSettingsForm';
import { SppGovernanceInfo } from './components/sppGovernanceInfo';
import { SppVotingTerminal } from './components/sppVotingTerminal';
import { plugin } from './constants/plugin';
import { useSppActions } from './hooks/useSppActions';
import { useSppGovernanceSettings } from './hooks/useSppGovernanceSettings';
import { useSppPermissionCheckProposalCreation } from './hooks/useSppPermissionCheckProposalCreation';
import { sppProposalUtils } from './utils/sppProposalUtils';
import { sppTransactionUtils } from './utils/sppTransactionUtils';

export const initialiseSppPlugin = () => {
    pluginRegistryUtils
        // Plugin definitions
        .registerPlugin(plugin)

        // Governance module slots
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_TERMINAL,
            pluginId: plugin.id,
            component: SppVotingTerminal,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS,
            pluginId: plugin.id,
            function: sppProposalUtils.getProposalStatus,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_CREATE_PROPOSAL_SETTINGS_FORM,
            pluginId: plugin.id,
            component: SppCreateProposalSettingsForm,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_BUILD_CREATE_PROPOSAL_DATA,
            pluginId: plugin.id,
            function: sppTransactionUtils.buildCreateProposalData,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PLUGIN_ACTIONS,
            pluginId: plugin.id,
            function: useSppActions,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_DAO_PROPOSAL_LIST,
            pluginId: plugin.id,
            component: SppProposalList,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
            pluginId: plugin.id,
            function: useSppPermissionCheckProposalCreation,
        })

        // Settings module slots
        .registerSlotFunction({
            slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
            pluginId: plugin.id,
            function: useSppGovernanceSettings,
        })
        .registerSlotComponent({
            slotId: SettingsSlotId.SETTINGS_GOVERNANCE_INFO,
            pluginId: plugin.id,
            component: SppGovernanceInfo,
        });
};
