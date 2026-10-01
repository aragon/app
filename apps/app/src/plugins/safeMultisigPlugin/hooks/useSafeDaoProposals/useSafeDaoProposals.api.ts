import type { ProposalStatus } from '@aragon/gov-ui-kit';
import type { Network } from '@/shared/api/daoService';
import type {
    ISafeInfoResponse,
    ISafeMultisigTransaction,
} from '@/shared/api/safeService';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import type { SafeTransactionState } from '../../types';

export interface IUseSafeDaoProposalsParams {
    network: Network;
    safeAddress: string;
    daoAddress: string;
    enabled?: boolean;
}

export interface IUseSafeDaoProposalParams extends IUseSafeDaoProposalsParams {
    safeTxHash: string;
}

export interface ISafeDaoProposal {
    transaction: ISafeMultisigTransaction;
    actions: ITransactionRequest[];
    state: SafeTransactionState;
    status: ProposalStatus;
}

export interface ISafeDaoProposalsMeta {
    /**
     * At least one stored Safe read was served from the backend's stale window.
     */
    stale: boolean;
    /**
     * The store reports that its refresh did not cover the complete upstream feed.
     */
    partial: boolean;
    /**
     * Last store refresh timestamp. Null means the store has never completed a pull.
     */
    fetchedAt: string | null;
}

export interface ISafeDaoProposalsData {
    safeInfo: ISafeInfoResponse;
    proposals: ISafeDaoProposal[];
    meta: ISafeDaoProposalsMeta;
}

export interface IUseSafeDaoProposalsReturn {
    data: ISafeDaoProposalsData | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    isStale: boolean;
    isPartial: boolean;
    isIndexing: boolean;
    fetchNextPage: () => Promise<unknown>;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    isFetchNextPageError: boolean;
}

export interface IUseSafeDaoProposalReturn
    extends Omit<
        IUseSafeDaoProposalsReturn,
        | 'fetchNextPage'
        | 'hasNextPage'
        | 'isFetchingNextPage'
        | 'isFetchNextPageError'
    > {
    isNotFound: boolean;
}
