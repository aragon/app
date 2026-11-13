'use client';

import { CardEmptyState, TransactionDetailSummary } from '@aragon/gov-ui-kit';
import type { ITransactionExecution } from '@/modules/finance/api/financeService';
import { TransactionExecutionActions } from '@/modules/finance/components/transactionExecutionActions';
import { transactionExecutionUtils } from '@/modules/finance/utils/transactionExecutionUtils';
import { useSafeTransactionActions } from '@/shared/api/safeService';
import { useTranslations } from '@/shared/components/translationsProvider';
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
    /**
     * Whether the Safe transaction is the onchain rejection of its nonce, which has no actions to show.
     */
    isRejection?: boolean;
}

const translationKey = 'app.safe.safeExecutionDetails';

/**
 * Summary and decoded actions of a Safe execution transaction, or only its decoded actions while the Safe transaction
 * is pending. An onchain rejection has no actions to read and says what it is instead. Like the DAO execution details,
 * it renders no layout of its own.
 */
export const SafeExecutionDetails: React.FC<ISafeExecutionDetailsProps> = (
    props,
) => {
    const { transaction, safeAddress, safeTxHash, isRejection } = props;

    const { t } = useTranslations();

    const {
        data: actionData,
        isLoading,
        isError,
    } = useSafeTransactionActions(
        {
            urlParams: {
                network: transaction.network,
                address: safeAddress,
                safeTxHash,
            },
        },
        {
            enabled: !isRejection,
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
    // The empty call of a rejection is not an action.
    const actionCount = isRejection
        ? 0
        : (actionData?.rawActions.length ?? transaction.actionCount);

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
            {isRejection ? (
                <CardEmptyState
                    className="border border-neutral-100"
                    description={t(`${translationKey}.rejection.description`)}
                    heading={t(`${translationKey}.rejection.heading`)}
                    isStacked={false}
                    objectIllustration={{ object: 'SMART_CONTRACT' }}
                />
            ) : (
                <TransactionExecutionActions
                    actionCount={actionCount}
                    actions={actions}
                    chainId={chainId}
                    // A failed poll keeps the actions already read, so only a read that never succeeded is reported.
                    isError={actionData == null && isError}
                    isLoading={isLoading}
                    transactionId={transaction.id}
                />
            )}
        </>
    );
};
