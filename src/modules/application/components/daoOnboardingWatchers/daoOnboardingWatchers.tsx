'use client';

import { useEffect, useState } from 'react';
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
 * watchers. Plugin watchers are paused while the profile flow is active so
 * that onboarding checks only activate once the user has closed or completed
 * the profile dialogs.
 */
export const DaoOnboardingWatchers: React.FC<IDaoOnboardingWatchersProps> = (
    props,
) => {
    const { dao } = props;

    const { locations } = useDialogContext();
    const [isProfileFlowActive, setIsProfileFlowActive] = useState(false);

    // Clear the flag whenever no profile dialog is in the stack. Covers the
    // full-flow completion, cancellation mid-flow, and the optimistic-start
    // case where the profile dialog never actually opened (already shown).
    useEffect(() => {
        if (!isProfileFlowActive) {
            return;
        }

        const anyProfileDialogOpen = locations.some((location) =>
            profileDialogIds.has(location.id),
        );

        if (!anyProfileDialogOpen) {
            setIsProfileFlowActive(false);
        }
    }, [isProfileFlowActive, locations]);

    return (
        <>
            <AragonProfileOnboardingWatcher
                onFlowStart={() => setIsProfileFlowActive(true)}
            />
            <TokenDelegationOnboardingWatcher
                dao={dao}
                isPaused={isProfileFlowActive}
            />
            <TokenLockAndWrapOnboardingWatcher
                dao={dao}
                isPaused={isProfileFlowActive}
            />
            <LockToVoteLockOnboardingWatcher
                dao={dao}
                isPaused={isProfileFlowActive}
            />
        </>
    );
};
