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
     * Indexed SPP result for this body. A result does not close the queue: while the stage is still
     * current a queued report can execute and overwrite it, so both are read together.
     */
    settledResultType?: SppProposalType;
    /**
     * Whether a report executing now would still affect the outcome - true only while this stage is
     * the proposal's current stage and the proposal has not executed.
     *
     * `reportProposalResult` carries no deadline: it reverts only for a stage that has not started
     * yet, and records unconditionally otherwise. So the elapsed voting window does not decide
     * this, and a report landing after the window still counts. Past the stage it still succeeds
     * onchain but changes nothing.
     */
    isStageCurrent: boolean;
    /**
     * Whether executing could still change the outcome. `maxAdvance` is an onchain bound: once
     * `lastStageTransition + maxAdvance` has passed, SPP reports `Expired` and the stage can never
     * advance, so a Safe transaction still executes but the proposal stays where it is.
     */
    canStillAffectOutcome: boolean;
    /**
     * Whether the queued transaction can execute against the Safe right now: its nonce is the
     * Safe's current nonce. A Safe binds each confirmation to one exact nonce, so a fully-confirmed
     * transaction one place further back is not executable - it is waiting.
     */
    isExecutableNow: boolean;
    /**
     * Whether the Safe's current nonce is unoccupied, so a report proposed now would land on it and
     * be executable as soon as it reaches threshold. Distinct from `isExecutableNow`, which
     * describes a report that already exists.
     */
    isCurrentNonceFree: boolean;
    /**
     * Safe transactions that must clear before the queued report can execute.
     *
     * Their contents are deliberately not interpreted: a Safe is a universal account, so what sits
     * ahead may be any transaction from any application, proposed at any time, and is very possibly
     * nothing to do with Aragon.
     */
    transactionsAhead: number;
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
