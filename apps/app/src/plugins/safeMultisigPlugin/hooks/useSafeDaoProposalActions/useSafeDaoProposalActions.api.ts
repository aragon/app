import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { Network } from '@/shared/api/daoService';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';

export interface IUseSafeDaoProposalActionsParams {
    /**
     * Network the Safe is deployed on.
     */
    network: Network;
    /**
     * Address of the Safe account that stores the transaction.
     */
    safeAddress: string;
    /**
     * Address of the DAO the proposal's `execute` call targets.
     */
    daoAddress: string;
    /**
     * Hash of the stored Safe transaction whose decoded actions are read.
     */
    safeTxHash: string;
    /**
     * Locally verified DAO `execute` actions decoded from the Safe envelope. These remain the
     * authoritative calls: backend decoding is only shown when it describes exactly these same
     * calls, otherwise raw-calldata stubs built from them are displayed.
     */
    localActions: ITransactionRequest[];
    /**
     * Whether the backend decoded-actions query is enabled.
     */
    enabled?: boolean;
}

export interface IUseSafeDaoProposalActionsReturn {
    /**
     * Actions to display: backend-decoded nested DAO actions when they match the authoritative local
     * calls, otherwise raw-calldata stubs built from those local calls.
     */
    actions: IProposalAction[];
    /**
     * The backend is still decoding the stored transaction, so display falls back to raw stubs.
     */
    isDecoding: boolean;
    /**
     * The displayed actions came from the backend decoding (true) or the raw fallback (false).
     */
    usingDecoded: boolean;
}
