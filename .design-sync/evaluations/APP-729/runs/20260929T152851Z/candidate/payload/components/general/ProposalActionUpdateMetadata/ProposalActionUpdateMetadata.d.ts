import * as React from 'react';

/**
 * ProposalActionUpdateMetadata — from @aragon/gov-ui-kit@2.11.4.
 */
export interface ProposalActionUpdateMetadataProps {
  /** Action to be rendered. */
  action: IProposalActionUpdateMetadata;
  /** Index of the action. */
  index: number;
  /** ID of the chain to use when making RPC requests. */
  chainId?: number;
  /** Custom Wagmi configurations to use instead of retrieving it from the closest WagmiProvider. */
  wagmiConfig?: unknown;
}

import type { IProposalActionUpdateMetadata } from '@aragon/gov-ui-kit';

export declare const ProposalActionUpdateMetadata: React.ComponentType<ProposalActionUpdateMetadataProps>;
