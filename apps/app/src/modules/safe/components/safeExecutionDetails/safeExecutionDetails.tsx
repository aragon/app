'use client';

import { TransactionDetailSummary } from '@aragon/gov-ui-kit';
import type { ITransactionExecution } from '@/modules/finance/api/financeService';
import { TransactionExecutionActions } from '@/modules/finance/components/transactionExecutionActions';
import { transactionExecutionUtils } from '@/modules/finance/utils/transactionExecutionUtils';
import { useSafeTransactionActions } from '@/shared/api/safeService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';

/**
 * Execution behind a Safe transaction. A Safe transaction still waiting to be executed has no onchain hash nor block.
 */
export type SafeExecutionDetailsTransaction = Pick<
    ITransactionExecution,
    'id' | 'network' | 'fromAddress' | 'actionCount'
> & {
    /**
     * Hash of the execution transaction, null while the Safe transaction is pending.
     */
    transactionHash: ITransactionExecution['transactionHash'] | null;
    /**
     * Timestamp of the block the execution was included in, null while the Safe transaction is pending.
     */
    blockTimestamp: ITransactionExecution['blockTimestamp'] | null;
};

export interface ISafeExecutionDetailsProps {
    /**
     * Execution transaction to display.
     */
    transaction: SafeExecutionDetailsTransaction;
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
 * Summary and decoded actions of a Safe execution transaction, or only its decoded actions while the Safe transaction
 * is pending. Like the DAO execution details, it renders no layout of its own.
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

    const { transactionHash, blockTimestamp } = transaction;

    return (
        <>
            {/* The summary describes the onchain execution, which a pending Safe transaction does not have yet. */}
            {transactionHash != null && blockTimestamp != null && (
                <TransactionDetailSummary
                    chainId={chainId}
                    date={blockTimestamp * 1000}
                    executedBy={{ address: transaction.fromAddress }}
                    totalActions={actionCount}
                    transactionHash={transactionHash}
                />
            )}
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
