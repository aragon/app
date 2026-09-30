import * as React from 'react';

/**
 * NetworkSwitchAlert — from @aragon/app@1.39.1 (apps/app/src/shared/components/networkSwitchAlert/networkSwitchAlert.tsx).
 */
export interface NetworkSwitchAlertProps {
  /** Whether the wallet's current chain differs from the required chain. */
  isCrossNetworkTransaction: boolean;
  /** Human-readable name of the required network. */
  networkName?: string;
}

export declare const NetworkSwitchAlert: React.ComponentType<NetworkSwitchAlertProps>;
