'use client';

import { useState } from 'react';
import { LockToVoteLockOnboardingWatcher } from '@/plugins/lockToVotePlugin/components/lockToVoteLockOnboardingWatcher';
import { TokenDelegationOnboardingWatcher } from '@/plugins/tokenPlugin/components/tokenDelegationOnboardingWatcher';
import { TokenLockAndWrapOnboardingWatcher } from '@/plugins/tokenPlugin/components/tokenLockAndWrapOnboardingWatcher';
import type { IDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { ApplicationDialogId } from '../../constants/applicationDialogId';
import { AragonProfileOnboardingWatcher } from '../aragonProfileOnboardingWatcher';

const profileDialogIds: ReadonlySet<string> = new Set([
    ApplicationDialogId.ARAGON_PROFILE_INTRO,
    ApplicationDialogId.ARAGON_PROFILE_CLAIM_SUBDOMAIN,
    ApplicationDialogId.ARAGON_PROFILE_SUBDOMAIN_REGISTER_TRANSACTION,
    ApplicationDialogId.ARAGON_PROFILE_SET_PRIMARY_ENS_TRANSACTION,
    ApplicationDialogId.ARAGON_PROFILE,
    ApplicationDialogId.ARAGON_PROFILE_UPDATE,
]);

export interface IDaoOnboardingWatchersProps {
    /**
     * The DAO whose onboarding watchers should be rendered.
     */
    dao: IDao;
}

/**
 * Wraps the Aragon Profile onboarding watcher and the per-plugin onboarding
 * watchers. Plugin watchers are paused while the profile check is in flight
 * or while a profile dialog is open, so onboarding checks only activate once
 * the user has closed or completed the profile dialogs.
 */
export const DaoOnboardingWatchers: React.FC<IDaoOnboardingWatchersProps> = (
    props,
) => {
    const { dao } = props;

    const { locations } = useDialogContext();
    const [isCheckPending, setIsCheckPending] = useState(false);

    const isProfileDialogOpen = locations.some((location) =>
        profileDialogIds.has(location.id),
    );
    const isPaused = isCheckPending || isProfileDialogOpen;

    return (
        <>
            <AragonProfileOnboardingWatcher
                onCheckPendingChange={setIsCheckPending}
            />
            <TokenDelegationOnboardingWatcher dao={dao} isPaused={isPaused} />
            <TokenLockAndWrapOnboardingWatcher dao={dao} isPaused={isPaused} />
            <LockToVoteLockOnboardingWatcher dao={dao} isPaused={isPaused} />
        </>
    );
};
