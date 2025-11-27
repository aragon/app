'use client';

import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import {
    TransactionType as DataListTransactionType,
    TransactionDataListItem,
    TransactionStatus,
} from '@aragon/gov-ui-kit';
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
            key={`${transaction.transactionHash}-${index.toString()}`}
            chainId={networkDefinitions[transaction.network].id}
            hash={transaction.transactionHash}
            target={onTransactionClick ? undefined : '_blank'}
            date={transaction.blockTimestamp * 1000}
            type={transactionSideToDataListType[transaction.side]}
            status={TransactionStatus.SUCCESS}
            tokenSymbol={transaction.token.symbol}
            tokenAmount={transaction.value}
            hideValue={true}
            onClick={handleClick}
        />
    );
};
