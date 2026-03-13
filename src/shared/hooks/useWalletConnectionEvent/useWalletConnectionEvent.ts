import { useConnectionEffect } from 'wagmi';

export interface IUseWalletConnectionEventParams {
    /**
     * Called once each time the user establishes a new wallet connection.
     * Does NOT fire on page-load auto-reconnect.
     * Re-fires if the user disconnects and reconnects.
     */
    onConnected: () => void;
}

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
