import * as React from 'react';

/**
 * Wallet — from @aragon/gov-ui-kit@2.11.4.
 */
export interface WalletProps {
  /** The connected user details. */
  user?: ICompositeAddress;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  /** ID of the chain to use when making RPC requests. */
  chainId?: number;
  /** Custom Wagmi configurations to use instead of retrieving it from the closest WagmiProvider. */
  wagmiConfig?: unknown;
}

import type { ICompositeAddress } from '@aragon/gov-ui-kit';

export declare const Wallet: React.ComponentType<WalletProps>;
