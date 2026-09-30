import * as React from 'react';

/**
 * AssetDataListItem — from @aragon/gov-ui-kit@2.11.4.
 */
export interface AssetDataListItemProps {
  [key: string]: unknown;
}

export interface AssetDataListItemStructureProps {
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  /** Visual variant of the item. */
  variant?: "select" | "primary";
  /** The name of the asset. */
  name: string;
  /** The symbol of the asset. */
  symbol: string;
  /** The amount of the asset. */
  amount: string | number;
  /** The logo source of the asset */
  logoSrc?: string;
  /** The fiat price of the asset. */
  fiatPrice?: string | number;
  /** Hides the asset value when set to true. */
  hideValue?: boolean;
}

export interface AssetDataListItemSkeletonProps {
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  /** Visual variant of the item. */
  variant?: "select" | "primary";
}

export declare const AssetDataListItem: React.ComponentType<AssetDataListItemProps> & {
  Structure: React.ComponentType<AssetDataListItemStructureProps>;
  Skeleton: React.ComponentType<AssetDataListItemSkeletonProps>;
};

