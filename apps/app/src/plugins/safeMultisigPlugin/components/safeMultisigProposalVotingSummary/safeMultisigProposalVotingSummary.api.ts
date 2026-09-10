import type { ISppProposal, ISppStage } from '@/plugins/sppPlugin/types';

export interface ISafeMultisigProposalVotingSummaryProps {
    /**
     * Parent process proposal the body reports a result for.
     */
    proposal: ISppProposal;
    /**
     * Address of the Safe acting as the body.
     */
    body: string;
    /**
     * Stage the body is set up on.
     */
    stage: ISppStage;
    /**
     * Defines if the body vetoes rather than approves.
     */
    isVeto: boolean;
}
