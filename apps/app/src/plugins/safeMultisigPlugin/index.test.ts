import type { ProposalVotingTab } from '@aragon/gov-ui-kit';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { PluginInterfaceType } from '@/shared/api/daoService';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { useSppExternalPermissionCheckProposalCreation } from '../sppPlugin/hooks/useSppExternalPermissionCheckProposalCreation';
import { generateSppStagePlugin } from '../sppPlugin/testUtils';
import { sppStageUtils } from '../sppPlugin/utils/sppStageUtils';
import { SafeMultisigProposalVotingBreakdown } from './components/safeMultisigProposalVotingBreakdown';
import { SafeMultisigProposalVotingSummary } from './components/safeMultisigProposalVotingSummary';
import { SafeMultisigSubmitVote } from './components/safeMultisigSubmitVote';
import { SafeMultisigVoteList } from './components/safeMultisigVoteList';
import { SafePluginInfo } from './components/safePluginInfo';
import { useSafeMultisigVotePermissionCheck } from './hooks/useSafeMultisigVotePermissionCheck';
import { initialiseSafeMultisigPlugin } from './index';

describe('safeMultisigPlugin registrations', () => {
    const safeBody = generateSppStagePlugin({
        interfaceType: PluginInterfaceType.SAFE,
    });

    beforeAll(() => {
        initialiseSafeMultisigPlugin();
    });

    // A slot registered under an id the resolver never produces fails silently. Pair the
    // canonical body resolver with each registration rather than trusting either.
    it.each([
        {
            slotId: SettingsSlotId.SETTINGS_PLUGIN_INFO,
            component: SafePluginInfo,
        },
        {
            slotId: GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_BREAKDOWN,
            component: SafeMultisigProposalVotingBreakdown,
        },
        {
            slotId: GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_MULTI_BODY_SUMMARY,
            component: SafeMultisigProposalVotingSummary,
        },
        {
            slotId: GovernanceSlotId.GOVERNANCE_SUBMIT_VOTE,
            component: SafeMultisigSubmitVote,
        },
        {
            slotId: GovernanceSlotId.GOVERNANCE_VOTE_LIST,
            component: SafeMultisigVoteList,
        },
    ])('serves $slotId for a canonical Safe body', ({ slotId, component }) => {
        const pluginId = sppStageUtils.getBodyPluginId(safeBody);

        expect(
            pluginRegistryUtils.getSlotComponent({ slotId, pluginId }),
        ).toEqual(component);
    });

    // The Votes tab exists for a Safe body only because this function answers for it; unregistered,
    // the shared chrome falls back to hiding Votes and the tab silently disappears.
    it('keeps the Votes tab for a Safe body through the tab-policy slot', () => {
        const getHiddenTabs = pluginRegistryUtils.getSlotFunction<
            undefined,
            ProposalVotingTab[]
        >({
            slotId: GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_HIDDEN_TABS,
            pluginId: sppStageUtils.getBodyPluginId(safeBody),
        });

        expect(getHiddenTabs?.(undefined)).toEqual([]);
    });

    // Without this registration the guard's own fallback answers `hasPermission: true`, so
    // ownership gating disappears while every other test stays green.
    it('answers the vote-permission slot with the Safe ownership check', () => {
        const checkPermission = pluginRegistryUtils.getSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_VOTE_SUBMISSION,
            pluginId: sppStageUtils.getBodyPluginId(safeBody),
        });

        expect(checkPermission).toEqual(useSafeMultisigVotePermissionCheck);
    });

    it('routes Safe proposal creation through the SPP condition check', () => {
        const checkPermission = pluginRegistryUtils.getSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
            pluginId: sppStageUtils.getBodyPluginId(safeBody),
        });

        expect(checkPermission).toEqual(
            useSppExternalPermissionCheckProposalCreation,
        );
    });

    it('allows Safe bodies to report after the voting window', () => {
        const votesAfterWindow = pluginRegistryUtils.getSlotFunction<
            undefined,
            boolean
        >({
            slotId: GovernanceSlotId.GOVERNANCE_BODY_VOTES_AFTER_WINDOW,
            pluginId: sppStageUtils.getBodyPluginId(safeBody),
        });

        expect(votesAfterWindow?.(undefined)).toBe(true);
    });
});
