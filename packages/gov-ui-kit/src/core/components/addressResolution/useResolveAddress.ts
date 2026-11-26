import { useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from 'react';
import { addressUtils } from '../../utils';
import { AddressNetworkContext } from './addressNetworkProvider';
import { AddressResolutionContext } from './addressResolutionProvider';
import type { IResolvedAddress } from './addressResolutionStore';

const NOT_RESOLVED: IResolvedAddress = { warnings: [], isLoading: false, isResolved: true };
const noop = () => () => undefined;

/**
 * Name of an address, from the nearest `AddressResolutionProvider`. A known address answers at once; an unknown one
 * asks the resolver of the app once for all components. Without a provider nothing resolves.
 * @param address The address, or any other value, which resolves to nothing.
 * @param chainId The network of the address. Defaults to the one of the nearest `AddressNetworkProvider`.
 */
export const useResolveAddress = (address: string | undefined, chainId?: number): IResolvedAddress => {
    const store = useContext(AddressResolutionContext);
    const contextChainId = useContext(AddressNetworkContext);
    const network = chainId ?? contextChainId;

    const key = address != null && addressUtils.isAddress(address) ? address.toLowerCase() : undefined;

    const subscribe = useCallback(
        (listener: () => void) => (store != null && key != null ? store.subscribe(key, listener) : noop()),
        [store, key],
    );
    const version = useSyncExternalStore(
        subscribe,
        () => (store != null && key != null ? store.getVersion(key) : 0),
        () => 0,
    );

    // The version is the signal that the store changed for this address.
    // biome-ignore lint/correctness/useExhaustiveDependencies: see above.
    const result = useMemo(() => store?.get(key, network) ?? NOT_RESOLVED, [store, key, network, version]);

    const shouldResolve = result.isLoading;
    // The version makes an address ask again after the resolver was replaced.
    // biome-ignore lint/correctness/useExhaustiveDependencies: see above.
    useEffect(() => {
        if (shouldResolve && key != null) {
            store?.request(key);
        }
    }, [shouldResolve, store, key, version]);

    return result;
};
