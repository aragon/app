import * as React from 'react';

/**
 * SmartContractFunctionDataListItem — from @aragon/gov-ui-kit@2.11.4.
 */
export interface SmartContractFunctionDataListItemProps {
  [key: string]: unknown;
}

export interface SmartContractFunctionDataListItemSkeletonProps {
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  /** Visual variant of the item. */
  variant?: "select" | "primary";
  /** Flag to determine whether or not the item is a child of another component so we can apply the correct styles and remove  */
  asChild?: boolean;
}

export interface SmartContractFunctionDataListItemStructureProps {
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  /** Visual variant of the item. */
  variant?: "select" | "primary";
  /** The name of the smart contract function. */
  functionName?: string;
  /** The name of the smart contract. */
  contractName?: string;
  /** The address of the smart contract. */
  contractAddress: string;
  /** Function selector of the given smart contract function. */
  functionSelector?: string;
  /** Callback when function is removed. */
  onRemove?: () => void;
  /** The chain ID of the smart contract. */
  chainId?: number;
  /** Flag to determine whether or not the item is a child of another component so we can apply the correct styles. */
  asChild?: boolean;
  /** Flag to determine whether or not to display warning icon. */
  displayWarning?: boolean;
}

export declare const SmartContractFunctionDataListItem: React.ComponentType<SmartContractFunctionDataListItemProps> & {
  Skeleton: React.ComponentType<SmartContractFunctionDataListItemSkeletonProps>;
  Structure: React.ComponentType<SmartContractFunctionDataListItemStructureProps>;
};

