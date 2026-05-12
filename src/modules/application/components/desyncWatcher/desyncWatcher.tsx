'use client';

import { useAppKitAccount, useDisconnect } from '@reown/appkit/react';
import { useEffect } from 'react';
import { useConnection } from 'wagmi';

// AppKit's account controller initializes with the status 'disconnected' and only
// transitions to 'connecting'/'reconnecting' after it reads storage on mount,
// while wagmi restores from cookieStorage synchronously. That ~0.1–1s gap can
// look like a real divergence. Wait this long for both stores to settle before
// forcing a disconnect — any state change during the window cancels the action.
const settleWindowMs = 1500;

/**
 * Detects divergence between AppKit's and wagmi's connection state and forces
 * a full disconnect via AppKit (which tears down both stores plus the
 * WalletConnect session). Stays inert while either store reports a transient
 * connecting/reconnecting state, and debounces by {@link settleWindowMs} to
 * absorb the cold-load lifecycle gap.
 */
export const DesyncWatcher: React.FC = () => {
    const { isConnected: appKitConnected, status } = useAppKitAccount({
        namespace: 'eip155',
    });
    const { isConnected: wagmiConnected, isReconnecting } = useConnection();
    const { disconnect } = useDisconnect();

    useEffect(() => {
        if (
            isReconnecting ||
            status === 'connecting' ||
            status === 'reconnecting'
        ) {
            return;
        }
        if (appKitConnected === wagmiConnected) {
            return;
        }

        const timeoutId = setTimeout(() => {
            void disconnect();
        }, settleWindowMs);

        return () => clearTimeout(timeoutId);
    }, [appKitConnected, wagmiConnected, isReconnecting, status, disconnect]);

    return null;
};
