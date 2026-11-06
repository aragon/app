import { addressUtils, ProposalStatus } from '@aragon/gov-ui-kit';
import type { ISafeMultisigTransaction } from '@/shared/api/safeService';
import { SafeTransactionState } from '../../types';

export interface ISafeTransactionLivenessParams {
    /**
     * Transaction to classify.
     */
    transaction: ISafeMultisigTransaction;
    /**
     * Current nonce of the Safe (`ISafeInfo.nonce`).
     */
    currentNonce: string;
}

export interface ISafeTransactionListParams {
    /**
     * Transactions read from the Safe queue.
     */
    transactions: ISafeMultisigTransaction[];
    /**
     * Current nonce of the Safe (`ISafeInfo.nonce`).
     */
    currentNonce: string;
}

export interface ISafeNonceCompetitorsParams {
    /**
     * Transactions read from the Safe queue.
     */
    transactions: ISafeMultisigTransaction[];
    /**
     * Transaction to find competitors for.
     */
    transaction: ISafeMultisigTransaction;
}

export interface ISafeConfirmedByParams {
    /**
     * Transaction to check the confirmations of.
     */
    transaction: ISafeMultisigTransaction;
    /**
     * Address to look for, or undefined when no wallet is connected.
     */
    address?: string;
}

/**
 * Executable lifecycle of a live Safe transaction, combining confirmation count against the live
 * threshold with nonce position. Distinct from `SafeTransactionState`, which only answers whether a
 * transaction can ever execute again; this answers what the owner should do next.
 */
export enum SafeApprovalReadiness {
    /** Fewer current-owner confirmations than the live threshold. */
    AWAITING_APPROVALS = 'awaitingApprovals',
    /** Threshold reached and the transaction sits on the Safe's current nonce. */
    READY_TO_EXECUTE = 'readyToExecute',
    /** Threshold reached but an earlier nonce must execute first. */
    WAITING_FOR_NONCE = 'waitingForNonce',
    /** The nonce was consumed by another transaction — permanently unexecutable. */
    SUPERSEDED = 'superseded',
    /** Executed onchain successfully. */
    EXECUTED_SUCCESS = 'executedSuccess',
    /** Executed onchain but reverted; the nonce is still consumed. */
    EXECUTED_FAILURE = 'executedFailure',
    /** Executed but the outcome is not yet reported. */
    EXECUTED_UNKNOWN = 'executedUnknown',
}

export interface ISafeApprovalReadinessParams {
    /**
     * Transaction to classify.
     */
    transaction: ISafeMultisigTransaction;
    /**
     * Current Safe owners (`ISafeInfo.owners`).
     */
    owners: string[];
    /**
     * Live confirmation threshold (`ISafeInfo.threshold`).
     */
    threshold: number;
    /**
     * Current nonce of the Safe (`ISafeInfo.nonce`).
     */
    currentNonce: string;
}

const transactionStateToProposalStatus: Record<
    SafeTransactionState,
    ProposalStatus
> = {
    [SafeTransactionState.LIVE]: ProposalStatus.ACTIVE,
    // A dead-but-confirmed transaction is Aragon's existing "reached its threshold but can no
    // longer execute" state, so it maps onto EXPIRED instead of inventing a status.
    [SafeTransactionState.SUPERSEDED]: ProposalStatus.EXPIRED,
    [SafeTransactionState.EXECUTED]: ProposalStatus.EXECUTED,
};

/**
 * Pure liveness rules for a Safe queue.
 *
 * Safe nonces are a single sequential queue, so liveness is derived from the nonce and never read
 * from `isExecuted`: transactions below the Safe's current nonce are permanently unexecutable no
 * matter how many confirmations they hold, and a reverted execution consumes its nonce just the
 * same. Deriving on every read is what makes the rule recoverable — no transition is tracked.
 */
class SafeMultisigProposalUtils {
    supportsEip1271Signatures = (version: string | null): boolean => {
        if (version == null) {
            return false;
        }

        const [major = 0, minor = 0, patch = 0] = version
            .split('+')[0]
            .split('.')
            .map(Number);

        if (![major, minor, patch].every(Number.isInteger)) {
            return false;
        }

        return (
            major > 1 ||
            (major === 1 && minor > 4) ||
            (major === 1 && minor === 4 && patch >= 1)
        );
    };

    getTransactionState = (
        params: ISafeTransactionLivenessParams,
    ): SafeTransactionState => {
        const { transaction, currentNonce } = params;

        if (transaction.isExecuted) {
            return SafeTransactionState.EXECUTED;
        }

        return BigInt(transaction.nonce) >= BigInt(currentNonce)
            ? SafeTransactionState.LIVE
            : SafeTransactionState.SUPERSEDED;
    };

    isTransactionLive = (params: ISafeTransactionLivenessParams): boolean =>
        this.getTransactionState(params) === SafeTransactionState.LIVE;

    getTransactionStatus = (
        params: ISafeTransactionLivenessParams,
    ): ProposalStatus =>
        transactionStateToProposalStatus[this.getTransactionState(params)];

    filterLiveTransactions = (
        params: ISafeTransactionListParams,
    ): ISafeMultisigTransaction[] => {
        const { transactions, currentNonce } = params;

        return transactions.filter((transaction) =>
            this.isTransactionLive({ transaction, currentNonce }),
        );
    };

    getNonceCompetitors = (
        params: ISafeNonceCompetitorsParams,
    ): ISafeMultisigTransaction[] => {
        const { transactions, transaction } = params;

        return transactions.filter(
            (candidate) =>
                candidate.safeTxHash !== transaction.safeTxHash &&
                BigInt(candidate.nonce) === BigInt(transaction.nonce),
        );
    };

    hasNonceCompetition = (params: ISafeNonceCompetitorsParams): boolean =>
        this.getNonceCompetitors(params).length > 0;

    hasAddressConfirmed = (params: ISafeConfirmedByParams): boolean => {
        const { transaction, address } = params;

        if (address == null) {
            return false;
        }

        return transaction.confirmations.some((confirmation) =>
            addressUtils.isAddressEqual(confirmation.owner, address),
        );
    };

    isThresholdReached = (transaction: ISafeMultisigTransaction): boolean =>
        transaction.confirmations.length >= transaction.confirmationsRequired;

    /**
     * Number of distinct current owners that have confirmed the transaction. A confirmation from an
     * address that is no longer an owner is dropped, and a duplicate confirmation from the same
     * owner is counted once, so a removed or double-listed signer can never inflate the approvals
     * shown against the live threshold.
     */
    countCurrentOwnerApprovals = (
        transaction: ISafeMultisigTransaction,
        owners: string[],
    ): number => {
        const ownerSet = new Set(owners.map((owner) => owner.toLowerCase()));
        const approvingOwners = new Set<string>();

        for (const { owner } of transaction.confirmations) {
            const normalizedOwner = owner.toLowerCase();

            if (ownerSet.has(normalizedOwner)) {
                approvingOwners.add(normalizedOwner);
            }
        }

        return approvingOwners.size;
    };

    getApprovalReadiness = ({
        transaction,
        owners,
        threshold,
        currentNonce,
    }: ISafeApprovalReadinessParams): SafeApprovalReadiness => {
        if (transaction.isExecuted) {
            if (transaction.isSuccessful === true) {
                return SafeApprovalReadiness.EXECUTED_SUCCESS;
            }

            if (transaction.isSuccessful === false) {
                return SafeApprovalReadiness.EXECUTED_FAILURE;
            }

            return SafeApprovalReadiness.EXECUTED_UNKNOWN;
        }

        if (
            this.getTransactionState({ transaction, currentNonce }) ===
            SafeTransactionState.SUPERSEDED
        ) {
            return SafeApprovalReadiness.SUPERSEDED;
        }

        const approvalCount = this.countCurrentOwnerApprovals(
            transaction,
            owners,
        );

        if (approvalCount < threshold) {
            return SafeApprovalReadiness.AWAITING_APPROVALS;
        }

        return BigInt(transaction.nonce) === BigInt(currentNonce)
            ? SafeApprovalReadiness.READY_TO_EXECUTE
            : SafeApprovalReadiness.WAITING_FOR_NONCE;
    };
}

export const safeMultisigProposalUtils = new SafeMultisigProposalUtils();
