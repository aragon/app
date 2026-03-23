import { useEffect, useRef } from 'react';
import type { Address } from 'viem';
import { type UseConnectReturnType, useConnect, useDisconnect } from 'wagmi';
import { mock } from 'wagmi/connectors';
import { useDebugContext } from '@/shared/components/debugProvider';

const ADDRESS_CONTROL = 'impersonateAddress';
const PERSIST_CONTROL = 'impersonatePersist';
const STORAGE_KEY_ADDRESS = 'debug:impersonateAddress';
const STORAGE_KEY_PERSIST = 'debug:impersonatePersist';

const connectMock = async (
    disconnectAsync: () => Promise<void>,
    connectAsync: UseConnectReturnType['connectAsync'],
    address: string,
) => {
    await disconnectAsync();
    await connectAsync({
        connector: mock({ accounts: [address as Address] }),
    });
};

export const useAddressImpersonation = () => {
    const { registerControl, unregisterControl } = useDebugContext();
    const { connectAsync } = useConnect();
    const { disconnectAsync } = useDisconnect();

    const connectRef = useRef(connectAsync);
    const disconnectRef = useRef(disconnectAsync);
    const persistRef = useRef(
        localStorage.getItem(STORAGE_KEY_PERSIST) === 'true',
    );
    const addressRef = useRef<string | undefined>(undefined);

    connectRef.current = connectAsync;
    disconnectRef.current = disconnectAsync;

    useEffect(() => {
        const savedPersist =
            localStorage.getItem(STORAGE_KEY_PERSIST) === 'true';
        const savedAddress = savedPersist
            ? localStorage.getItem(STORAGE_KEY_ADDRESS)
            : null;

        registerControl({
            name: ADDRESS_CONTROL,
            type: 'address',
            label: 'Impersonate address',
            group: 'Simulation',
            value: savedAddress ?? undefined,
            onChange: async (value) => {
                const address = value as string | undefined;
                addressRef.current = address;

                try {
                    if (address) {
                        if (persistRef.current) {
                            localStorage.setItem(STORAGE_KEY_ADDRESS, address);
                        }
                        await connectMock(
                            disconnectRef.current,
                            connectRef.current,
                            address,
                        );
                    } else {
                        localStorage.removeItem(STORAGE_KEY_ADDRESS);
                        await disconnectRef.current();
                    }
                } catch {
                    // Ignore connect/disconnect errors (e.g. no wallet connected)
                }
            },
        });

        registerControl({
            name: PERSIST_CONTROL,
            type: 'boolean',
            label: 'Persist across reloads',
            group: 'Simulation',
            value: savedPersist,
            onChange: (value) => {
                const persist = value as boolean;
                persistRef.current = persist;

                if (persist) {
                    localStorage.setItem(STORAGE_KEY_PERSIST, 'true');
                    if (addressRef.current) {
                        localStorage.setItem(
                            STORAGE_KEY_ADDRESS,
                            addressRef.current,
                        );
                    }
                } else {
                    localStorage.removeItem(STORAGE_KEY_PERSIST);
                    localStorage.removeItem(STORAGE_KEY_ADDRESS);
                }
            },
        });

        if (savedAddress) {
            connectMock(
                disconnectRef.current,
                connectRef.current,
                savedAddress,
            ).catch(() => undefined);
        }

        return () => {
            unregisterControl(ADDRESS_CONTROL);
            unregisterControl(PERSIST_CONTROL);
        };
    }, [registerControl, unregisterControl]);
};
