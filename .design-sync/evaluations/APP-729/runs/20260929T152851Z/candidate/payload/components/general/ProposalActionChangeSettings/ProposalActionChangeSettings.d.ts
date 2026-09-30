import * as React from 'react';

/**
 * ProposalActionChangeSettings — from @aragon/gov-ui-kit@2.11.4.
 */
export interface ProposalActionChangeSettingsProps {
  /** Action to be rendered. */
  action: IProposalActionChangeSettings;
  /** Index of the action. */
  index: number;
  /** ID of the chain to use when making RPC requests. */
  chainId?: number;
  /** Custom Wagmi configurations to use instead of retrieving it from the closest WagmiProvider. */
  wagmiConfig?: unknown;
}

import type { IProposalActionChangeSettings } from '@aragon/gov-ui-kit';

export declare const ProposalActionChangeSettings: React.ComponentType<ProposalActionChangeSettingsProps>;
