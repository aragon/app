'use client';

import { useEffect, useState } from 'react';
import { useConnection } from 'wagmi';
import { useEnsName } from '@/modules/ens';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useWalletConnectionEvent } from '@/shared/hooks/useWalletConnectionEvent';
import { ApplicationDialogId } from '../../constants/applicationDialogId';
import type { IAragonProfileIntroDialogParams } from '../../dialogs/aragonProfileIntroDialog/aragonProfileIntroDialog';

export interface IAragonProfileOnboardingWatcherProps {
    /**
     * Called synchronously in the wallet-connection callback. Used by the
     * parent to pause sibling onboarding watchers in the same render, before
     * their effects can open their own dialogs.
     */
    onFlowStart: () => void;
}

const storageKey = (address: string) =>
    `aragon-profile-onboarding:${address.toLowerCase()}`;

/**
 * Watches for fresh wallet connections and opens the Aragon Profile intro
 * dialog once per address (create or edit mode depending on whether the
 * connected address already has a primary ENS name).
 */
export const AragonProfileOnboardingWatcher: React.FC<
    IAragonProfileOnboardingWatcherProps
> = (props) => {
    const { onFlowStart } = props;

    const { address } = useConnection();
    const { data: ensName, isLoading: ensIsLoading } = useEnsName(address);
    const { open } = useDialogContext();

    const [hasPendingConnection, setHasPendingConnection] = useState(false);

    useWalletConnectionEvent({
        onConnected: () => {
            setHasPendingConnection(true);
            onFlowStart();
        },
    });

    useEffect(() => {
        if (!hasPendingConnection || address == null || ensIsLoading) {
            return;
        }

        setHasPendingConnection(false);

        if (localStorage.getItem(storageKey(address)) === 'true') {
            return;
        }

        localStorage.setItem(storageKey(address), 'true');

        const params: IAragonProfileIntroDialogParams = {
            mode: ensName != null ? 'edit' : 'create',
        };

        open(ApplicationDialogId.ARAGON_PROFILE_INTRO, { params });
    }, [hasPendingConnection, address, ensIsLoading, ensName, open]);

    return null;
};
