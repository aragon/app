import type { Network } from '@/shared/api/daoService';

export interface ISafeMultisigVoteListProps {
    /**
     * Network the Safe is deployed on.
     */
    network: Network;
    /**
     * Owners that have confirmed the queued report.
     */
    signers: string[];
    /**
     * Defines if the body vetoes rather than approves.
     */
    isVeto: boolean;
    /**
     * Whether the Safe reads are still loading.
     */
    isLoading: boolean;
    /**
     * Whether the Safe state could not be read.
     */
    isError: boolean;
}
