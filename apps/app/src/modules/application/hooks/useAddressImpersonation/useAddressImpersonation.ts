import { useEffect, useRef } from 'react';
import type { Address } from 'viem';
import {
    type UseConnectReturnType,
    useConfig,
    useConnect,
    useDisconnect,
} from 'wagmi';
import { getConnection } from 'wagmi/actions';
import { mock } from 'wagmi/connectors';
import { useDebugContext } from '@/shared/components/debugProvider';

const ADDRESS_CONTROL = 'impersonateAddress';

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
    const config = useConfig();
    const { connectAsync } = useConnect();
    const { disconnectAsync } = useDisconnect();

    const connectRef = useRef(connectAsync);
    const disconnectRef = useRef(disconnectAsync);

    connectRef.current = connectAsync;
    disconnectRef.current = disconnectAsync;

    useEffect(() => {
        registerControl({
            name: ADDRESS_CONTROL,
            type: 'address',
            label: 'Impersonate address',
            group: 'Simulation',
            onChange: async (value) => {
                const address = value as string | undefined;

                try {
                    if (address) {
                        await connectMock(
                            disconnectRef.current,
                            connectRef.current,
                            address,
                        );
                    } else if (
                        getConnection(config).connector?.type === mock.type
                    ) {
                        // The input reports an empty value on mount, so only the mock is dropped, never a real
                        // wallet. Read on clear, so a failed switch or a disconnect from the wallet UI counts too.
                        await disconnectRef.current();
                    }
                } catch {
                    // Ignore connect/disconnect errors (e.g. no wallet connected)
                }
            },
        });

        return () => {
            unregisterControl(ADDRESS_CONTROL);
        };
    }, [registerControl, unregisterControl, config]);
};
