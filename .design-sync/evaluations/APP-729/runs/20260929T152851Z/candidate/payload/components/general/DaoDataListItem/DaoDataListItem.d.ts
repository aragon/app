import * as React from 'react';

/**
 * DaoDataListItem — from @aragon/gov-ui-kit@2.11.4.
 */
export interface DaoDataListItemProps {
  [key: string]: unknown;
}

export interface DaoDataListItemStructureProps {
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  /** Visual variant of the item. */
  variant?: "select" | "primary";
  /** The name of the DAO. */
  name?: string;
  /** The source of the logo for the DAO. */
  logoSrc?: string;
  /** The description of the DAO. */
  description?: string;
  /** The address of the DAO. */
  address?: string;
  /** The ENS (Ethereum Name Service) address of the DAO. */
  ens?: string;
  /** The network on which the DAO operates. */
  network?: string;
  /** Displays an external link icon and updates the information shown when set to true. */
  isExternal?: boolean;
}

export interface DaoDataListItemSkeletonProps {
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  /** Visual variant of the item. */
  variant?: "select" | "primary";
}

export declare const DaoDataListItem: React.ComponentType<DaoDataListItemProps> & {
  Structure: React.ComponentType<DaoDataListItemStructureProps>;
  Skeleton: React.ComponentType<DaoDataListItemSkeletonProps>;
};

