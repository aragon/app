import { useEffect, useRef } from 'react';
import type { Address } from 'viem';
import { useConnect, useDisconnect } from 'wagmi';
import { mock } from 'wagmi/connectors';
import { useDebugContext } from '@/shared/components/debugProvider';

const CONTROL_NAME = 'impersonateAddress';

export const useAddressImpersonation = () => {
    const { registerControl, unregisterControl } = useDebugContext();
    const { connectAsync } = useConnect();
    const { disconnectAsync } = useDisconnect();

    const connectRef = useRef(connectAsync);
    const disconnectRef = useRef(disconnectAsync);

    connectRef.current = connectAsync;
    disconnectRef.current = disconnectAsync;

    useEffect(() => {
        registerControl({
            name: CONTROL_NAME,
            type: 'address',
            label: 'Impersonate address',
            group: 'Wallet',
            onChange: async (value) => {
                const address = value as string | undefined;

                try {
                    if (address) {
                        await disconnectRef.current();
                        await connectRef.current({
                            connector: mock({
                                accounts: [address as Address],
                            }),
                        });
                    } else {
                        await disconnectRef.current();
                    }
                } catch {
                    // Ignore connect/disconnect errors (e.g. no wallet connected)
                }
            },
        });

        return () => unregisterControl(CONTROL_NAME);
    }, [registerControl, unregisterControl]);
};
