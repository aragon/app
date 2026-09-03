import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { Network } from '@/shared/api/daoService';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { generateSppStagePlugin } from '../sppPlugin/testUtils';
import { VotingBodyBrandIdentity } from '../sppPlugin/types';
import { sppStageUtils } from '../sppPlugin/utils/sppStageUtils';
import { SafeMultisigProposalVotingBreakdown } from './components/safeMultisigProposalVotingBreakdown';
import { SafeMultisigProposalVotingSummary } from './components/safeMultisigProposalVotingSummary';
import { SafeMultisigSubmitVote } from './components/safeMultisigSubmitVote';
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
