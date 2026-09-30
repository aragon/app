import * as React from 'react';

/**
 * ProposalActionTokenMint — from @aragon/gov-ui-kit@2.10.0.
 */
export interface ProposalActionTokenMintProps {
  /** Action to be rendered. */
  action: IProposalActionTokenMint;
  /** Index of the action. */
  index: number;
  /** ID of the chain to use when making RPC requests. */
  chainId?: number;
  /** Custom Wagmi configurations to use instead of retrieving it from the closest WagmiProvider. */
  wagmiConfig?: Config;
}

export declare const ProposalActionTokenMint: React.ComponentType<ProposalActionTokenMintProps>;
