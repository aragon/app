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

export interface ISafeMultisigVoteListViewProps {
    /**
     * Addresses of the owners that confirmed the transaction.
     */
    signers: string[];
    /**
     * Connected account, listed first when it is one of the signers.
     */
    connectedAddress?: string;
    /**
     * Builds the link of a signer row. Rows are not links when not set.
     */
    getSignerHref?: (signer: string) => string | undefined;
    /**
     * Defines if the Safe vetoes rather than approves.
     */
    isVeto?: boolean;
    /**
     * Renders the list skeleton while the Safe state is loading.
     */
    isLoading?: boolean;
}
