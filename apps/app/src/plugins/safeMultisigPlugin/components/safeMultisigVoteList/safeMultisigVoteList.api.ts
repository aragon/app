import type { ISppProposal, ISppStage } from '@/plugins/sppPlugin/types';

export interface ISafeMultisigVoteListProps {
    /**
     * Parent process proposal the body reports a result for. Only available in proposal context.
     */
    proposal?: ISppProposal;
    /**
     * Address of the Safe acting as the body. Only available in proposal context.
     */
    body?: string;
    /**
     * Stage the body is set up on. Only available in proposal context.
     */
    stage?: ISppStage;
    /**
     * Defines if the body vetoes rather than approves.
     */
    isVeto?: boolean;
}
