import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { SppVotingTerminal } from './components/sppVotingTerminal';
import { plugin } from './constants/plugin';
import { sppProposalUtils } from './utils/sppProposalUtils';
import { SppCreateProposalSettingsForm } from './components/sppCreateProposalSettingsForm';
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
        });
};
