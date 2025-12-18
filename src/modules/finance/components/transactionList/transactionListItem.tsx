'use client';

import { TransactionType as DataListTransactionType, TransactionDataListItem, TransactionStatus } from '@aragon/gov-ui-kit';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import type { ITransaction, TransactionSide } from '../../api/financeService';

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
     * Callback called on transaction click.
     */
    onTransactionClick?: (transaction: ITransaction) => void;
}

const transactionSideToDataListType: Record<TransactionSide, DataListTransactionType> = {
    withdraw: DataListTransactionType.WITHDRAW,
    deposit: DataListTransactionType.DEPOSIT,
};

export const TransactionListItem: React.FC<ITransactionListItemProps> = (props) => {
    const { transaction, index, onTransactionClick } = props;

    const handleClick = onTransactionClick
        ? (e: React.MouseEvent) => {
              e.preventDefault();
              onTransactionClick(transaction);
          }
        : undefined;

    return (
        <TransactionDataListItem.Structure
            // Multiple transactions can have the same transaction hash
            // (e.g. one deposit and one withdraw on the same proposal)
            chainId={networkDefinitions[transaction.network].id}
            date={transaction.blockTimestamp * 1000}
            hash={transaction.transactionHash}
            hideValue={true}
            key={`${transaction.transactionHash}-${index.toString()}`}
            onClick={handleClick}
            status={TransactionStatus.SUCCESS}
            target={onTransactionClick ? undefined : '_blank'}
            tokenAmount={transaction.value}
            tokenSymbol={transaction.token.symbol}
            type={transactionSideToDataListType[transaction.side]}
        />
    );
};
