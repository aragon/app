'use client';

import { useAppKitAccount } from '@reown/appkit/react';
import { useEffect } from 'react';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';

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
        monitoringUtils.identifyUser(
            isConnected && address != null ? address : null,
        );
    }, [address, isConnected]);

    return null;
};
