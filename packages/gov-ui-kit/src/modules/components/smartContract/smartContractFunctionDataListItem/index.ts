import { SmartContractFunctionDataListItemSkeleton } from './smartContractFunctionDataListItemSkeleton';
import { SmartContractFunctionDataListItemStructure } from './smartContractFunctionDataListItemStructure';

/**
 * `DataList.Item` row for a smart-contract function: `SmartContractFunctionDataListItem.Structure` renders the data,
 * `SmartContractFunctionDataListItem.Skeleton` its loading placeholder.
 */
export const SmartContractFunctionDataListItem = {
    Skeleton: SmartContractFunctionDataListItemSkeleton,
    Structure: SmartContractFunctionDataListItemStructure,
};

export * from './smartContractFunctionDataListItemSkeleton';
export * from './smartContractFunctionDataListItemStructure';
