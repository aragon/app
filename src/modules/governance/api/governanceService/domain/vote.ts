import type { IAddressInfo, Network } from '@/shared/api/daoService';
import type { IProposal } from './proposal';

export interface IVote {
    /**
     * Hash of the transaction including the user vote.
     */
    transactionHash: string;
    /**
     * Timestamp of the transaction block.
     */
    blockTimestamp: number;
    /**
     * Address of the member casting the vote.
     */
    member: IAddressInfo;
    /**
     * Network where the vote has been casted.
     */
    network: Network;
    /**
     * Extra information about the proposal if includeInfo is true on the query.
     */
    proposal?: IProposal;
}
