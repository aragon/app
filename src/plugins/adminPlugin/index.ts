import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { useAdminPermissionCheckProposalCreation } from '@/plugins/adminPlugin/hooks/useAdminPermissionCheckProposalCreation';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { AdminGovernanceInfo } from './components/adminGovernanceInfo';
import { AdminMemberInfo } from './components/adminMemberInfo';
import { AdminVotingTerminal } from './components/adminVotingTerminal';
import { plugin } from './constants/plugin';
import { useAdminGovernanceSettings } from './hooks/useAdminGovernanceSettings';
import { adminProposalUtils } from './utils/adminProposalUtils';
import { adminTransactionUtils } from './utils/adminTransactionUtils';

export const initialiseAdminPlugin = () => {
    pluginRegistryUtils
        // Plugin definitions
        .registerPlugin(plugin)

        // Governance module slots
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_TERMINAL,
            pluginId: plugin.id,
            component: AdminVotingTerminal,
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
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
            pluginId: plugin.id,
            function: useAdminPermissionCheckProposalCreation,
        })
        // Settings module slots
        .registerSlotFunction({
            slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
            pluginId: plugin.id,
            function: useAdminGovernanceSettings,
        })
        .registerSlotComponent({
            slotId: SettingsSlotId.SETTINGS_MEMBERS_INFO,
            pluginId: plugin.id,
            component: AdminMemberInfo,
        })
        .registerSlotComponent({
            slotId: SettingsSlotId.SETTINGS_GOVERNANCE_INFO,
            pluginId: plugin.id,
            component: AdminGovernanceInfo,
        });
};
