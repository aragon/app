'use client';

import {
    TransactionType as DataListTransactionType,
    type ITransactionDataListItemProps,
    TransactionDataListItem,
    TransactionStatus,
    type TransactionTransferType,
} from '@aragon/gov-ui-kit';
import type { IDao } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import type {
    ITransaction,
    ITransactionExecution,
    ITransactionTransfer,
    TransactionTransferSide,
} from '../../api/financeService';
import { transactionExecutionUtils } from '../../utils/transactionExecutionUtils';

export interface ITransactionListItemProps {
    /**
     * Transaction to render.
     */
    transaction: ITransaction;
    /**
     * Index of the transaction in the list.
     */
    index: number;
    /**
     * Callback called on execution transaction click.
     */
    onTransactionClick?: (transaction: ITransactionExecution) => void;
    /**
     * DAO the transaction belongs to.
     */
    dao?: IDao;
}

const transactionSideToDataListType: Record<
    TransactionTransferSide,
    TransactionTransferType
> = {
    withdraw: DataListTransactionType.WITHDRAW,
    deposit: DataListTransactionType.DEPOSIT,
};

type DataListTransferProps = Extract<
    ITransactionDataListItemProps,
    { tokenSymbol: string }
>;
type DataListExecutionProps = Extract<
    ITransactionDataListItemProps,
    { type: DataListTransactionType.EXECUTION }
>;
type DataListVariantProps =
    | Pick<DataListTransferProps, 'tokenAmount' | 'tokenSymbol' | 'type'>
    | Pick<DataListExecutionProps, 'actionCount' | 'label' | 'type'>;

const buildTransferProps = (
    transaction: ITransactionTransfer,
): DataListVariantProps => ({
    tokenAmount: transaction.value,
    tokenSymbol: transaction.token.symbol,
    type: transactionSideToDataListType[transaction.side],
});

const buildExecutionProps = (
    transaction: ITransactionExecution,
    dao?: IDao,
): DataListVariantProps => ({
    actionCount: transaction.actionCount,
    label: transactionExecutionUtils.getExecutionLabel(transaction, dao),
    type: DataListTransactionType.EXECUTION,
});

export const TransactionListItem: React.FC<ITransactionListItemProps> = (
    props,
) => {
    const { transaction, onTransactionClick, dao } = props;

    const isExecution = transactionExecutionUtils.isExecution(transaction);
    const handleClick =
        isExecution && onTransactionClick
            ? (e: React.MouseEvent) => {
                  e.preventDefault();
                  onTransactionClick(transaction);
              }
            : undefined;

    const chainId = networkDefinitions[transaction.network].id;
    const transactionProps = isExecution
        ? buildExecutionProps(transaction, dao)
        : buildTransferProps(transaction);

    return (
        <TransactionDataListItem.Structure
            chainId={chainId}
            date={transaction.blockTimestamp * 1000}
            hash={transaction.transactionHash}
            hideValue={true}
            onClick={handleClick}
            status={TransactionStatus.SUCCESS}
            target={handleClick ? undefined : '_blank'}
            {...transactionProps}
        />
    );
};
