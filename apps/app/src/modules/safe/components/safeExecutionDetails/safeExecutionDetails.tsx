'use client';

import { TransactionDetailSummary } from '@aragon/gov-ui-kit';
import type { ITransactionExecution } from '@/modules/finance/api/financeService';
import { TransactionExecutionActions } from '@/modules/finance/components/transactionExecutionActions';
import { transactionExecutionUtils } from '@/modules/finance/utils/transactionExecutionUtils';
import { useSafeTransactionActions } from '@/shared/api/safeService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';

export interface ISafeExecutionDetailsProps {
    /**
     * Execution transaction to display.
     */
    transaction: ITransactionExecution;
    /**
     * Address of the Safe that executed the transaction.
     */
    safeAddress: string;
    /**
     * Hash of the Safe transaction behind the execution.
     */
    safeTxHash: string;
}

/**
 * Summary and decoded actions of a Safe execution transaction. Like the DAO execution details, it renders no layout
 * of its own.
 */
export const SafeExecutionDetails: React.FC<ISafeExecutionDetailsProps> = (
    props,
) => {
    const { transaction, safeAddress, safeTxHash } = props;

    const { data: actionData, isLoading } = useSafeTransactionActions(
        {
            urlParams: {
                network: transaction.network,
                address: safeAddress,
                safeTxHash,
            },
        },
        {
            refetchInterval:
                transactionExecutionUtils.getActionsRefetchInterval,
        },
    );

    // The Safe performs the calls, so the raw-calldata fallback is attributed to it.
    const actions = transactionExecutionUtils.resolveActions(
        actionData,
        safeAddress,
    );

    const chainId = networkDefinitions[transaction.network].id;
    const actionCount =
        actionData?.rawActions.length ?? transaction.actionCount;

    return (
        <>
            <TransactionDetailSummary
                chainId={chainId}
                date={transaction.blockTimestamp * 1000}
                executedBy={{ address: transaction.fromAddress }}
                totalActions={actionCount}
                transactionHash={transaction.transactionHash}
            />
            <TransactionExecutionActions
                actionCount={actionCount}
                actions={actions}
                chainId={chainId}
                isLoading={isLoading}
                transactionId={transaction.id}
            />
        </>
    );
};
