import { TransactionDataListItemSkeleton } from './transactionDataListItemSkeleton';
import { TransactionDataListItemStructure } from './transactionDataListItemStructure';

/**
 * `DataList.Item` row for a transaction: `TransactionDataListItem.Structure` renders the data,
 * `TransactionDataListItem.Skeleton` its loading placeholder.
 */
export const TransactionDataListItem = {
    Structure: TransactionDataListItemStructure,
    Skeleton: TransactionDataListItemSkeleton,
};

export * from './transactionDataListItemSkeleton';
export * from './transactionDataListItemStructure';
