import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { useAdminPermissionCheckProposalCreation } from '@/plugins/adminPlugin/hooks/useAdminPermissionCheckProposalCreation';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { AdminGovernanceInfo } from './components/adminGovernanceInfo';
import { AdminMemberInfo } from './components/adminMemberInfo';
import { AdminSettingsPanel } from './components/adminSettingsPanel';
import { AdminVotingTerminal } from './components/adminVotingTerminal';
import { adminPlugin } from './constants/adminPlugin';
import { useAdminGovernanceSettings } from './hooks/useAdminGovernanceSettings';
import { adminProposalUtils } from './utils/adminProposalUtils';
import { adminTransactionUtils } from './utils/adminTransactionUtils';

export const initialiseAdminPlugin = () => {
    pluginRegistryUtils
        // Plugin definitions
        .registerPlugin(adminPlugin)

        // Governance module slots
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_TERMINAL,
            pluginId: adminPlugin.id,
            component: AdminVotingTerminal,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS,
            pluginId: adminPlugin.id,
            function: adminProposalUtils.getProposalStatus,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_BUILD_CREATE_PROPOSAL_DATA,
            pluginId: adminPlugin.id,
            function: adminTransactionUtils.buildCreateProposalData,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
            pluginId: adminPlugin.id,
            function: useAdminPermissionCheckProposalCreation,
        })
        // Settings module slots
        .registerSlotFunction({
            slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
            pluginId: adminPlugin.id,
            function: useAdminGovernanceSettings,
        })
        .registerSlotComponent({
            slotId: SettingsSlotId.SETTINGS_MEMBERS_INFO,
            pluginId: adminPlugin.id,
            component: AdminMemberInfo,
        })
        .registerSlotComponent({
            slotId: SettingsSlotId.SETTINGS_GOVERNANCE_INFO,
            pluginId: adminPlugin.id,
            component: AdminGovernanceInfo,
        })
        .registerSlotComponent({
            slotId: SettingsSlotId.SETTINGS_PLUGIN_SECTION,
            pluginId: adminPlugin.id,
            component: AdminSettingsPanel,
        });
};
