import { useAppKitAccount } from '@reown/appkit/react';

/**
 * Returns whether the wallet is currently connected, sourced from AppKit's
 * account store. Use for any UI gate (CTA, guard, dialog auto-close) that needs
 * to agree with the AppKit modal — AppKit's store is the same one the modal
 * renders against, so the two cannot drift apart.
 *
 * Address and chainId reads should stay on wagmi (`useWalletAccount`),
 * since web3 operations need the wagmi connector identity.
 */
export const useWalletConnected = (): boolean => {
    const { isConnected } = useAppKitAccount({ namespace: 'eip155' });

    return isConnected;
};
