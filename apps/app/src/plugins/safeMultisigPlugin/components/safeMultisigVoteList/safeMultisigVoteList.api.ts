import type { ISppProposal, ISppStage } from '@/plugins/sppPlugin/types';
import type { Network } from '@/shared/api/daoService';

/**
 * SPP-independent Safe confirmation list presentation.
 */
export interface ISafeMultisigVoteListViewProps {
    /**
     * Confirming Safe owners.
     */
    signers: string[];
    /**
     * Network where the Safe is deployed.
     */
    network: Network;
    /**
     * Safe address.
     */
    safeAddress: string;
    /**
     * DAO address used to build member links.
     */
    daoAddress: string;
    /**
     * Defines if the Safe vetoes rather than approves.
     */
    isVeto?: boolean;
    /**
     * Connected account, promoted to the top of the list when present.
     */
    connectedAddress?: string;
    /**
     * Shows the list skeleton while Safe state is unavailable.
     */
    isLoading?: boolean;
}

export interface ISafeMultisigVoteListProps {
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
    isVeto?: boolean;
}
