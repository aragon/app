import type { IProposal } from '../api/governanceService';

export interface ISubmitVoteProps<TProposal extends IProposal = IProposal> {
    /**
     * ID of the DAO to create the proposal for.
     */
    daoId: string;
    /**
     * Proposal to submit the vote for.
     */
    proposal: TProposal;
    /**
     * Defines if the vote is to approve or veto the proposal.
     */
    isVeto?: boolean;
}
