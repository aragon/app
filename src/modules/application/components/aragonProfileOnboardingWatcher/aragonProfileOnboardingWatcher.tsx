'use client';

import { useEffect, useState } from 'react';
import { useConnection } from 'wagmi';
import { useEnsName } from '@/modules/ens';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useWalletConnectionEvent } from '@/shared/hooks/useWalletConnectionEvent';
import { ApplicationDialogId } from '../../constants/applicationDialogId';
import type { IAragonProfileIntroDialogParams } from '../../dialogs/aragonProfileIntroDialog';

export interface IAragonProfileOnboardingWatcherProps {
    /**
     * Called with `true` on fresh wallet connection and with `false` once the
     * ENS check settles (either a profile dialog has been opened or the
     * address has already gone through onboarding). The parent combines this
     * with the dialog stack to pause sibling onboarding watchers.
     */
    onCheckPendingChange: (isPending: boolean) => void;
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
    const { onCheckPendingChange } = props;

    const { address } = useConnection();
    const {
        data: ensName,
        isLoading: ensIsLoading,
        isError: ensIsError,
    } = useEnsName(address);
    const { open } = useDialogContext();

    const [hasPendingConnection, setHasPendingConnection] = useState(false);

    useWalletConnectionEvent({
        onConnected: () => {
            setHasPendingConnection(true);
            onCheckPendingChange(true);
        },
    });

    useEffect(() => {
        if (!hasPendingConnection || address == null || ensIsLoading) {
            return;
        }

        // Skip and retry on next connection if ENS lookup failed — avoid
        // misclassifying existing-profile users as new and suppressing future onboarding.
        if (ensIsError) {
            setHasPendingConnection(false);
            onCheckPendingChange(false);
            return;
        }

        setHasPendingConnection(false);

        if (localStorage.getItem(storageKey(address)) !== 'true') {
            localStorage.setItem(storageKey(address), 'true');

            const params: IAragonProfileIntroDialogParams = {
                mode: ensName != null ? 'edit' : 'create',
            };

            open(ApplicationDialogId.ARAGON_PROFILE_INTRO, { params });
        }

        onCheckPendingChange(false);
    }, [
        hasPendingConnection,
        address,
        ensIsLoading,
        ensName,
        open,
        onCheckPendingChange,
        ensIsError,
    ]);

    return null;
};
