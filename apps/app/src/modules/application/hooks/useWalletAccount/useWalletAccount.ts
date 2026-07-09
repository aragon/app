// biome-ignore lint/style/noRestrictedImports: authorised wrapper over wagmi's useConnection (omits isConnected so callers can't bypass useWalletConnected)
import { useConnection } from 'wagmi';

/**
 * Returns the wagmi-sourced account fields the app actually needs:
 * `address`, `chainId`, `isReconnecting`. Intentionally omits `isConnected` —
 * use `useWalletConnected` (AppKit-sourced) for any UI gate that must agree
 * with the connect modal. `DesyncWatcher` is the only sanctioned consumer of
 * wagmi's raw `useConnection`.
 */
export const useWalletAccount = () => {
    const { address, chainId, isReconnecting } = useConnection();

    return { address, chainId, isReconnecting };
};
