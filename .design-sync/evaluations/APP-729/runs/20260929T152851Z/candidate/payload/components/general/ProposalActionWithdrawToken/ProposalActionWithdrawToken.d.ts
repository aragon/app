import * as React from 'react';

/**
 * ProposalActionWithdrawToken — from @aragon/gov-ui-kit@2.11.4.
 */
export interface ProposalActionWithdrawTokenProps {
  /** Action to be rendered. */
  action: IProposalActionWithdrawToken;
  /** Index of the action. */
  index: number;
  /** ID of the chain to use when making RPC requests. */
  chainId?: number;
  /** Custom Wagmi configurations to use instead of retrieving it from the closest WagmiProvider. */
  wagmiConfig?: unknown;
}

import type { IProposalActionWithdrawToken } from '@aragon/gov-ui-kit';

export declare const ProposalActionWithdrawToken: React.ComponentType<ProposalActionWithdrawTokenProps>;
