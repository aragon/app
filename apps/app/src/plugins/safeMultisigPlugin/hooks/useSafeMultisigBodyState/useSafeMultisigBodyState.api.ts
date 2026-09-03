import type { ProposalStatus } from '@aragon/gov-ui-kit';
import type {
    ISppProposal,
    ISppStage,
    SppProposalType,
} from '@/plugins/sppPlugin/types';
import type { Network } from '@/shared/api/daoService';
import type {
    ISafeInfo,
    ISafeMultisigTransaction,
} from '@/shared/api/safeService';
import type {
    ISafeProposalResultReport,
    SafeTransactionState,
} from '../../types';

export interface IUseSafeMultisigBodyStateParams {
    /**
     * Network the Safe is deployed on.
     */
    network: Network;
    /**
     * Address of the Safe acting as the process body.
     */
    address: string;
    /**
     * Proposal the body has to report a result for.
     */
    proposal: ISppProposal;
    /**
     * Stage the body is set up on.
     */
    stage: ISppStage;
}

export interface ISafeMultisigBodyReport {
    /**
     * Safe transaction carrying the report, directly or inside a MultiSend batch.
     */
    transaction: ISafeMultisigTransaction;
    /**
     * Decoded report, including the governance effect it would produce.
     */
    report: ISafeProposalResultReport;
    /**
     * Whether the transaction can still execute.
     */
    state: SafeTransactionState;
    /**
     * Proposal status the state maps onto, so a dead-but-confirmed report reads as expired.
     */
    status: ProposalStatus;
    /**
     * Whether another queued transaction competes for the same nonce.
     */
    hasNonceCompetition: boolean;
}

export interface IUseSafeMultisigBodyStateReturn {
    /**
     * Live Safe state: owners, threshold, version and nonce.
     */
    safeInfo?: ISafeInfo;
    /**
     * Whether the Safe reads are still loading.
     */
    isLoading: boolean;
    /**
     * Whether the Safe state could not be read.
     */
    isError: boolean;
    /**
     * Whether the read failed because the shared Safe API quota is exhausted. A degraded state
     * rather than a bug: the poll backs off and recovers on its own, so it is rendered separately
     * from a generic error.
     */
    isRateLimited: boolean;
    /**
     * Seconds to wait, forwarded from the upstream `Retry-After`. Absent when upstream did not say.
     */
    rateLimitedRetryAfter?: number;
    /**
     * Whether the backend served this from its stale window because its fresh window had lapsed.
     * The data is usable and must be rendered, but a confirmation count may lag reality.
     */
    isStale: boolean;
    /**
     * Report queued for this proposal and stage, live or superseded.
     */
    pendingReport?: ISafeMultisigBodyReport;
    /**
     * Indexed SPP result for this body. Once present, it is the only settled-state trigger and the
     * pending Safe queue is no longer consulted.
     */
    settledResultType?: SppProposalType;
    /**
     * Owners that have confirmed the queued report.
     */
    signers: string[];
    /**
     * Whether the connected wallet has already confirmed the queued report.
     */
    hasConnectedWalletSigned: boolean;
    /**
     * Confirmations collected by the queued report.
     */
    approvalsAmount: number;
    /**
     * Confirmations the queued report requires. Captured per transaction, since the Safe threshold
     * can change while a transaction is queued.
     */
    minApprovals: number;
    /**
     * Number of current Safe owners.
     */
    membersCount: number;
}
