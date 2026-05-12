'use client';

import { useAppKitAccount, useDisconnect } from '@reown/appkit/react';
import { useEffect } from 'react';
import { useConnection } from 'wagmi';

/**
 * Detects divergence between AppKit's and wagmi's connection state and forces
 * a full disconnect via AppKit (which tears down both stores plus the
 * WalletConnect session). Stays inert while wagmi is reconnecting on mount.
 */
export const DesyncWatcher: React.FC = () => {
    const { isConnected: appKitConnected } = useAppKitAccount({
        namespace: 'eip155',
    });
    const { isConnected: wagmiConnected, isReconnecting } = useConnection();
    const { disconnect } = useDisconnect();

    useEffect(() => {
        if (isReconnecting) {
            return;
        }
        if (appKitConnected !== wagmiConnected) {
            void disconnect();
        }
    }, [appKitConnected, wagmiConnected, isReconnecting, disconnect]);

    return null;
};
