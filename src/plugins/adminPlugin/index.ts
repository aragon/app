import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { plugin } from './constants/plugin';
import { adminProposalUtils } from './utils/adminProposalUtils';
import { adminTransactionUtils } from './utils/adminTransactionUtils';

export const initialiseSppPlugin = () => {
    pluginRegistryUtils
        // Plugin definitions
        .registerPlugin(plugin)

        // Governance module slots
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_TERMINAL,
            pluginId: plugin.id,
            component: () => null,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS,
            pluginId: plugin.id,
            function: adminProposalUtils.getProposalStatus,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_BUILD_CREATE_PROPOSAL_DATA,
            pluginId: plugin.id,
            function: adminTransactionUtils.buildCreateProposalData,
        });
};
