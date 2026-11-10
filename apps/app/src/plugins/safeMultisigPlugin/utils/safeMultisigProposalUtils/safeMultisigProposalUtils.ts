import { ProposalStatus } from '@aragon/gov-ui-kit';
import { SafeTransactionState } from '@/modules/safe/types';
import {
    type ISafeTransactionLivenessParams,
    safeTransactionUtils,
} from '@/modules/safe/utils/safeTransactionUtils';

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
 * Presents a Safe transaction as a proposal of the Safe multisig plugin. The Safe rules it builds on live in
 * `safeTransactionUtils`.
 */
class SafeMultisigProposalUtils {
    /**
     * Proposal status of a Safe transaction, derived from its liveness in the Safe queue.
     */
    getTransactionStatus = (
        params: ISafeTransactionLivenessParams,
    ): ProposalStatus =>
        transactionStateToProposalStatus[
            safeTransactionUtils.getTransactionState(params)
        ];
}

export const safeMultisigProposalUtils = new SafeMultisigProposalUtils();
