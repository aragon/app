import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { SppProposalList } from '@/plugins/sppPlugin/components/sppProposalList';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { SppCreateProposalSettingsForm } from './components/sppCreateProposalSettingsForm';
import { SppGovernanceInfo } from './components/sppGovernanceInfo';
import { SppVotingTerminal } from './components/sppVotingTerminal';
import { sppPlugin } from './constants/sppPlugin';
import { useSppActions } from './hooks/useSppActions';
import { useSppGovernanceSettings } from './hooks/useSppGovernanceSettings';
import { useSppPermissionCheckProposalCreation } from './hooks/useSppPermissionCheckProposalCreation';
import { sppProposalUtils } from './utils/sppProposalUtils';
import { sppTransactionUtils } from './utils/sppTransactionUtils';

export const initialiseSppPlugin = () => {
    pluginRegistryUtils
        // Plugin definitions
        .registerPlugin(sppPlugin)

        // Governance module slots
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_TERMINAL,
            pluginId: sppPlugin.id,
            component: SppVotingTerminal,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS,
            pluginId: sppPlugin.id,
            function: sppProposalUtils.getProposalStatus,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_CREATE_PROPOSAL_SETTINGS_FORM,
            pluginId: sppPlugin.id,
            component: SppCreateProposalSettingsForm,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_BUILD_CREATE_PROPOSAL_DATA,
            pluginId: sppPlugin.id,
            function: sppTransactionUtils.buildCreateProposalData,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PLUGIN_ACTIONS,
            pluginId: sppPlugin.id,
            function: useSppActions,
        })
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_DAO_PROPOSAL_LIST,
            pluginId: sppPlugin.id,
            component: SppProposalList,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
            pluginId: sppPlugin.id,
            function: useSppPermissionCheckProposalCreation,
        })

        // Settings module slots
        .registerSlotFunction({
            slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
            pluginId: sppPlugin.id,
            function: useSppGovernanceSettings,
        })
        .registerSlotComponent({
            slotId: SettingsSlotId.SETTINGS_GOVERNANCE_INFO,
            pluginId: sppPlugin.id,
            component: SppGovernanceInfo,
        });
};
