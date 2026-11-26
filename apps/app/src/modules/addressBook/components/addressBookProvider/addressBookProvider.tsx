'use client';

import {
    AddressNetworkProvider,
    AddressResolutionProvider,
} from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';
import { wagmiConfig } from '@/modules/application/constants/wagmi';
import {
    workspaceServiceKeys,
    workspaceStorageKey,
} from '@/modules/workspace/api/workspaceService';
import { useAddressBookEntries } from '../../hooks/useAddressBookEntries';
import { addressBookUtils } from '../../utils/addressBookUtils';
import { createAddressResolver } from '../../utils/resolveAddress';

// One resolver for the app: the kit clears what it resolved when the function changes.
const resolve = createAddressResolver(wagmiConfig);

export interface IAddressBookProviderProps {
    children?: ReactNode;
}

/**
 * Feeds the kit with the names of the workspaces, so every widget that shows an address
 * shows its name. ENS names resolve on mainnet for the addresses with no saved name. `onEdit` is not set, so no edit
 * button shows. The network of the page (a DAO, or one workspace account) is the default network of every address
 * below, so its widgets and hooks need no chain id; a screen that lists accounts of several networks passes one per
 * account.
 */
export const AddressBookProvider: React.FC<IAddressBookProviderProps> = (
    props,
) => {
    const { children } = props;

    const entries = useAddressBookEntries();
    // Null outside the App Router, e.g. in tests that do not mock the route.
    const params = useParams<{ network?: string; accountId?: string }>();
    const chainId = addressBookUtils.getRouteChainId(params ?? {});
    const queryClient = useQueryClient();

    // The registry changed in another tab: reload the lists, the entries follow.
    useEffect(() => {
        const handleStorage = (event: StorageEvent) => {
            // A null key means the storage was cleared.
            if (event.key === workspaceStorageKey || event.key === null) {
                void queryClient.invalidateQueries({
                    queryKey: workspaceServiceKeys.workspaceList(),
                });
            }
        };

        window.addEventListener('storage', handleStorage);

        return () => window.removeEventListener('storage', handleStorage);
    }, [queryClient]);

    return (
        <AddressResolutionProvider entries={entries} resolve={resolve}>
            <AddressNetworkProvider chainId={chainId}>
                {children}
            </AddressNetworkProvider>
        </AddressResolutionProvider>
    );
};
