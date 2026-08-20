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

    /**
     * Transactions that can execute next: the live transactions sitting on the Safe's current
     * nonce. More than one means they compete — executing either one permanently kills the rest.
     */
    getExecutableTransactions = (
        params: ISafeTransactionListParams,
    ): ISafeMultisigTransaction[] => {
        const { transactions, currentNonce } = params;

        return transactions.filter(
            (transaction) =>
                !transaction.isExecuted &&
                BigInt(transaction.nonce) === BigInt(currentNonce),
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
}

export const safeMultisigProposalUtils = new SafeMultisigProposalUtils();
