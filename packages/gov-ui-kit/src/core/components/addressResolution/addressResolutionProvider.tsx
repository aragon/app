import { createContext, type ReactNode, useLayoutEffect, useState } from 'react';
import type { IAddressEntry } from './addressLabelUtils';
import { AddressResolutionStore, type AddressResolver } from './addressResolutionStore';

export type { AddressResolver, IAddressEntry };

export const AddressResolutionContext = createContext<AddressResolutionStore | null>(null);

/**
 * Called by the edit button, to name an address. Its presence turns the edit button on.
 */
export type AddressEditHandler = (address: string, chainId?: number) => void;

export const AddressEditContext = createContext<AddressEditHandler | undefined>(undefined);

export interface IAddressResolutionProviderProps {
    /**
     * Known addresses, keyed by `addressEntryKey(address, chainId)`, with chain id `0` for all networks. They win over
     * what `resolve` returned.
     * One entry per key: when your own name and one of another workspace share a key, the app picks the winner (your
     * own) before it builds the map.
     */
    entries?: ReadonlyMap<string, IAddressEntry>;
    /**
     * Called once for each address that is not known. Keep the function stable: a new one clears what was resolved.
     * After 10 seconds without an answer the address stays unresolved.
     */
    resolve?: AddressResolver;
    /**
     * Turns the edit button on, in the widgets that show an address without a name.
     */
    onEdit?: AddressEditHandler;
    children: ReactNode;
}

/**
 * Gives the widgets below it the names of addresses. The nearest provider wins. The app owns the data, the kit renders it.
 */
export const AddressResolutionProvider: React.FC<IAddressResolutionProviderProps> = (props) => {
    const { entries, resolve, onEdit, children } = props;

    const [store] = useState(() => new AddressResolutionStore(entries, resolve));

    // Before paint, so a change of the app data never shows a frame of old names.
    useLayoutEffect(() => store.setEntries(entries), [store, entries]);
    useLayoutEffect(() => store.setResolver(resolve), [store, resolve]);

    return (
        <AddressResolutionContext.Provider value={store}>
            <AddressEditContext.Provider value={onEdit}>{children}</AddressEditContext.Provider>
        </AddressResolutionContext.Provider>
    );
};
