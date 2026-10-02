import type { ProposalVotingTab } from '@aragon/gov-ui-kit';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { Network } from '@/shared/api/daoService';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { generateSppStagePlugin } from '../sppPlugin/testUtils';
import { VotingBodyBrandIdentity } from '../sppPlugin/types';
import { sppStageUtils } from '../sppPlugin/utils/sppStageUtils';
import { SafeMemberPanel } from './components/safeMemberPanel';
import { SafeMultisigProposalVotingBreakdown } from './components/safeMultisigProposalVotingBreakdown';
import { SafeMultisigProposalVotingSummary } from './components/safeMultisigProposalVotingSummary';
import { SafeMultisigSubmitVote } from './components/safeMultisigSubmitVote';
import { SafeMultisigVoteList } from './components/safeMultisigVoteList';
import { useSafeMultisigVotePermissionCheck } from './hooks/useSafeMultisigVotePermissionCheck';
import { initialiseSafeMultisigPlugin } from './index';

describe('safeMultisigPlugin registrations', () => {
    const safeBody = generateSppStagePlugin({
        interfaceType: undefined,
        brandId: VotingBodyBrandIdentity.SAFE,
    });

    beforeAll(() => {
        initialiseSafeMultisigPlugin();
    });

    // A slot registered under an id the resolver never produces fails silently: the body simply
    // renders through the generic external fallback. Pair the two rather than trusting either.
    it.each([
        {
            slotId: GovernanceSlotId.GOVERNANCE_MEMBER_PANEL,
            component: SafeMemberPanel,
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
    ])(
        'serves $slotId for a Safe body on a supported network',
        ({ slotId, component }) => {
            const pluginId = sppStageUtils.getBodyPluginId(
                safeBody,
                Network.ETHEREUM_SEPOLIA,
            );

            expect(
                pluginRegistryUtils.getSlotComponent({ slotId, pluginId }),
            ).toEqual(component);
        },
    );

    // The Votes tab exists for a Safe body only because this function answers for it; unregistered,
    // the shared chrome falls back to hiding Votes and the tab silently disappears.
    it('keeps the Votes tab for a Safe body through the tab-policy slot', () => {
        const getHiddenTabs = pluginRegistryUtils.getSlotFunction<
            undefined,
            ProposalVotingTab[]
        >({
            slotId: GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_HIDDEN_TABS,
            pluginId: sppStageUtils.getBodyPluginId(
                safeBody,
                Network.ETHEREUM_SEPOLIA,
            ),
        });

        expect(getHiddenTabs?.(undefined)).toEqual([]);
    });

    // Without this registration the guard's own fallback answers `hasPermission: true`, so
    // ownership gating disappears while every other test stays green.
    it('answers the vote-permission slot with the Safe ownership check', () => {
        const checkPermission = pluginRegistryUtils.getSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_VOTE_SUBMISSION,
            pluginId: sppStageUtils.getBodyPluginId(
                safeBody,
                Network.ETHEREUM_SEPOLIA,
            ),
        });

        expect(checkPermission).toEqual(useSafeMultisigVotePermissionCheck);
    });

    it('leaves a Safe on an unserved network to the external fallbacks', () => {
        const pluginId = sppStageUtils.getBodyPluginId(
            safeBody,
            Network.CITREA_MAINNET,
        );

        expect(
            pluginRegistryUtils.getSlotComponent({
                slotId: GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_MULTI_BODY_SUMMARY,
                pluginId,
            }),
        ).toBeUndefined();
    });
});
