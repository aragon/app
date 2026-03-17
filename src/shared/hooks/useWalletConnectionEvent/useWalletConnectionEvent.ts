import { useConnectionEffect } from 'wagmi';

export interface IUseWalletConnectionEventParams {
    /**
     * Called once each time the user establishes a new wallet connection.
     * Does NOT fire on page-load auto-reconnect.
     * Re-fires if the user disconnects and reconnects.
     */
    onConnected: () => void;
}

/**
 * Fires a callback when the user actively connects a wallet.
 * Skips silent page-load reconnections (`isReconnected === true`).
 * Re-fires on each new manual connection after a disconnect.
 */
export const useWalletConnectionEvent = (
    params: IUseWalletConnectionEventParams,
) => {
    const { onConnected } = params;

    useConnectionEffect({
        onConnect(data) {
            if (!data.isReconnected) {
                onConnected();
            }
        },
    });
};
