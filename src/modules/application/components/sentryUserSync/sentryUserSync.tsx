'use client';

import { useAppKitAccount } from '@reown/appkit/react';
import { setUser } from '@sentry/nextjs';
import { useEffect } from 'react';

/**
 * Attaches the connected wallet address as the Sentry user id so that errors stop
 * reporting "Users: 0" and a specific person's session (events + Session Replay) can
 * be looked up by `user.id:0x...` when triaging a complaint. The address is public
 * on-chain data used here purely as a pseudonymous identifier. Clears the user on
 * disconnect so anonymous traffic is not misattributed.
 */
export const SentryUserSync: React.FC = () => {
    const { address, isConnected } = useAppKitAccount({ namespace: 'eip155' });

    useEffect(() => {
        if (isConnected && address != null) {
            setUser({ id: address });
        } else {
            setUser(null);
        }
    }, [address, isConnected]);

    return null;
};
