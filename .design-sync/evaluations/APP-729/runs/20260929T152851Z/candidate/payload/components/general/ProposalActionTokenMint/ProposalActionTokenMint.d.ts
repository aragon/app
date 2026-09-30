import * as React from 'react';

/**
 * ProposalActionTokenMint — from @aragon/gov-ui-kit@2.11.4.
 */
export interface ProposalActionTokenMintProps {
  /** Action to be rendered. */
  action: IProposalActionTokenMint;
  /** Index of the action. */
  index: number;
  /** ID of the chain to use when making RPC requests. */
  chainId?: number;
  /** Custom Wagmi configurations to use instead of retrieving it from the closest WagmiProvider. */
  wagmiConfig?: unknown;
}

import type { IProposalActionTokenMint } from '@aragon/gov-ui-kit';

export declare const ProposalActionTokenMint: React.ComponentType<ProposalActionTokenMintProps>;
