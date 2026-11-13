import { addressUtils } from '@aragon/gov-ui-kit';
import { type Hex, hashTypedData, isHex, zeroAddress } from 'viem';
import type {
    ISafeConfirmation,
    ISafeMultisigTransaction,
} from '@/shared/api/safeService';
import { SafeApprovalReadiness } from '../../types/safeApprovalReadiness';
import { SafeTransactionState } from '../../types/safeTransactionState';
import { safeTxTypes } from '../safeTransactionEnvelopeUtils/safeTxTypes';

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

export interface ISafeCurrentOwnerConfirmationsParams {
    /**
     * Transaction to read the confirmations of.
     */
    transaction: ISafeMultisigTransaction;
    /**
     * Current Safe owners (`ISafeInfo.owners`).
     */
    owners: string[];
}

export interface ISafeRejectionParams {
    /**
     * Hash of the Safe transaction to check.
     */
    safeTxHash: string;
    /**
     * Nonce of the transaction.
     */
    nonce: string;
    /**
     * Address of the Safe the transaction belongs to.
     */
    safeAddress: string;
    /**
     * ID of the chain the Safe is deployed on.
     */
    chainId: number;
}

export interface ISafeApprovalReadinessParams
    extends ISafeCurrentOwnerConfirmationsParams {
    /**
     * Live confirmation threshold (`ISafeInfo.threshold`).
     */
    threshold: number;
    /**
     * Current nonce of the Safe (`ISafeInfo.nonce`).
     */
    currentNonce: string;
}

/**
 * Pure rules of a Safe transaction: its liveness in the Safe queue, its confirmations and what the owners can do next.
 * They know nothing about DAOs or proposals, so the Safe module, the Safe multisig plugin and the SPP plugin share them.
 *
 * Safe nonces are a single sequential queue, so liveness is derived from the nonce and never read
 * from `isExecuted`: transactions below the Safe's current nonce are permanently unexecutable no
 * matter how many confirmations they hold, and a reverted execution consumes its nonce just the
 * same. Deriving on every read is what makes the rule recoverable — no transition is tracked.
 */
export interface ISafeOwnerThresholdParams {
    /**
     * Number of confirmations the Safe requires.
     */
    threshold: number;
    /**
     * Current owners of the Safe.
     */
    owners: string[];
}

class SafeTransactionUtils {
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
     * Whether a Safe transaction is the onchain rejection of its nonce: an empty call from the Safe to itself that
     * refunds no gas, so executing it only uses up the nonce. Every field of that transaction is fixed, so a nonce has
     * one rejection, the one the protocol kit and the Safe app build, and its hash identifies it.
     *
     * The hash covers the whole transaction, gas refund included. A refund is paid out of the Safe whatever the call
     * does, so an empty call that drains the Safe through its refund has another hash and never passes for a rejection.
     *
     * A Safe signs under a domain that names its chain from v1.3.0 on, and only its address before. Both are
     * checked, so the version of the Safe is not needed.
     */
    isRejection = (params: ISafeRejectionParams): boolean => {
        const { safeTxHash, nonce, chainId } = params;

        // Anything unreadable is not a rejection.
        if (
            !addressUtils.isAddress(params.safeAddress) ||
            !/^\d+$/.test(nonce)
        ) {
            return false;
        }

        // Lowercased, as the hash does not depend on the casing and a miscased checksum would be refused.
        const safeAddress = params.safeAddress.toLowerCase() as Hex;
        const domains = [
            { chainId, verifyingContract: safeAddress },
            { verifyingContract: safeAddress },
        ];

        return domains.some(
            (domain) =>
                hashTypedData({
                    domain,
                    types: safeTxTypes,
                    primaryType: 'SafeTx',
                    message: {
                        to: safeAddress,
                        value: BigInt(0),
                        data: '0x',
                        operation: 0,
                        safeTxGas: BigInt(0),
                        baseGas: BigInt(0),
                        gasPrice: BigInt(0),
                        gasToken: zeroAddress,
                        refundReceiver: zeroAddress,
                        nonce: BigInt(nonce),
                    },
                }) === safeTxHash.toLowerCase(),
        );
    };

    /**
     * Whether the threshold read from the Safe is one its owners can reach. Anything else is a misread or a broken
     * Safe, and no signature should be asked for against it.
     */
    hasValidThreshold = (params: ISafeOwnerThresholdParams): boolean => {
        const { threshold, owners } = params;

        return threshold >= 1 && threshold <= owners.length;
    };

    /**
     * Confirmations that count towards the live threshold: one per distinct current owner, carrying a well-formed
     * signature. A confirmation from an address that is no longer an owner, a duplicate from the same owner and a
     * malformed signature are dropped, so the approvals shown, the readiness derived from them and the signatures
     * handed to an execution all agree.
     */
    getCurrentOwnerConfirmations = (
        params: ISafeCurrentOwnerConfirmationsParams,
    ): ISafeConfirmation[] => {
        const { transaction, owners } = params;
        const confirmations: ISafeConfirmation[] = [];

        for (const confirmation of transaction.confirmations) {
            const isCurrentOwner = owners.some((owner) =>
                addressUtils.isAddressEqual(owner, confirmation.owner),
            );
            const isDuplicate = confirmations.some(({ owner }) =>
                addressUtils.isAddressEqual(owner, confirmation.owner),
            );

            if (
                isCurrentOwner &&
                !isDuplicate &&
                this.hasWellFormedSignature(confirmation)
            ) {
                confirmations.push(confirmation);
            }
        }

        return confirmations;
    };

    /**
     * Number of confirmations that count towards the live threshold, see `getCurrentOwnerConfirmations`.
     */
    countCurrentOwnerApprovals = (
        params: ISafeCurrentOwnerConfirmationsParams,
    ): number => this.getCurrentOwnerConfirmations(params).length;

    /**
     * What the owners can do next with a Safe transaction, from its execution state, its current-owner confirmations
     * against the live threshold and its nonce position.
     */
    getApprovalReadiness = (
        params: ISafeApprovalReadinessParams,
    ): SafeApprovalReadiness => {
        const { transaction, owners, threshold, currentNonce } = params;

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

        const approvalCount = this.countCurrentOwnerApprovals({
            transaction,
            owners,
        });

        if (approvalCount < threshold) {
            return SafeApprovalReadiness.AWAITING_APPROVALS;
        }

        return BigInt(transaction.nonce) === BigInt(currentNonce)
            ? SafeApprovalReadiness.READY_TO_EXECUTE
            : SafeApprovalReadiness.WAITING_FOR_NONCE;
    };

    // A 65-byte ECDSA signature, or a contract signature whose dynamic part makes it longer.
    private hasWellFormedSignature = (
        confirmation: ISafeConfirmation,
    ): boolean =>
        isHex(confirmation.signature) &&
        (confirmation.signatureType === 'CONTRACT_SIGNATURE' ||
            confirmation.signature.length === 132);
}

export const safeTransactionUtils = new SafeTransactionUtils();
