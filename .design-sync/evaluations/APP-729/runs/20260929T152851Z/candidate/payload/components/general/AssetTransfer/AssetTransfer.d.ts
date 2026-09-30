import * as React from 'react';

/**
 * AssetTransfer — from @aragon/gov-ui-kit@2.11.4.
 */
export interface AssetTransferProps {
  /** Sender of the transaction. */
  sender: ICompositeAddress;
  /** Recipient of the transaction. */
  recipient: ICompositeAddress;
  /** Name of the asset transferred. */
  assetName: string;
  /** Address of the asset transferred. */
  assetAddress?: string;
  /** Icon URL of the transferred asset. */
  assetIconSrc?: string;
  /** Asset amount that was transferred. */
  assetAmount: string | number;
  /** Symbol of the asset transferred. Example: ETH, DAI, etc. */
  assetSymbol: string;
  /** Price per asset in fiat. */
  assetFiatPrice?: string | number;
  /** ID of the chain to use when making RPC requests. */
  chainId?: number;
  /** Custom Wagmi configurations to use instead of retrieving it from the closest WagmiProvider. */
  wagmiConfig?: unknown;
}

import type { ICompositeAddress } from '@aragon/gov-ui-kit';

export declare const AssetTransfer: React.ComponentType<AssetTransferProps>;
