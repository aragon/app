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

export interface ISafeDaoProposal {
    transaction: ISafeMultisigTransaction;
    actions: ITransactionRequest[];
    state: SafeTransactionState;
    status: ProposalStatus;
}

export interface ISafeDaoProposalsMeta {
    /**
     * At least one Safe read was served from the backend's stale window.
     */
    stale: boolean;
    /**
     * Pagination ended before the response count was exhausted or returned an unusable next page.
     * The rows are usable but must not be presented as a complete feed.
     */
    partial: boolean;
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
}
