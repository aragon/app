export interface ICanCreateProposalResult {
    /**
     *
     */
    canCreateProposal: boolean;
    /**
     *
     */
    settings: { term: string; definition: string }[];
    /**
     *
     */
    isLoading: boolean;
}
