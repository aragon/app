'use client';

import { useEffect, useState } from 'react';
import { useConnection } from 'wagmi';
import { LockToVotePluginDialogId } from '@/plugins/lockToVotePlugin/constants/lockToVotePluginDialogId';
import type { ILockToVoteLockOnboardingIntroDialogParams } from '@/plugins/lockToVotePlugin/dialogs/lockToVoteLockOnboardingIntroDialog/lockToVoteLockOnboardingIntroDialog';
import { useLockToVoteLockOnboardingCheck } from '@/plugins/lockToVotePlugin/hooks/useLockToVoteLockOnboardingCheck';
import type { ILockToVotePlugin } from '@/plugins/lockToVotePlugin/types';
import { type IDao, PluginInterfaceType } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useWalletConnectionEvent } from '@/shared/hooks/useWalletConnectionEvent';
import { daoUtils } from '../../../../shared/utils/daoUtils';

export interface ILockToVoteLockOnboardingWatcherProps {
    /**
     * The DAO to watch for lock onboarding.
     */
    dao: IDao;
}

export const LockToVoteLockOnboardingWatcher: React.FC<
    ILockToVoteLockOnboardingWatcherProps
> = (props) => {
    const { dao } = props;

    const daoPlugins = daoUtils.getDaoPlugins(dao, {
        interfaceType: PluginInterfaceType.LOCK_TO_VOTE,
        includeLinkedAccounts: false,
    });

    const lockToVotePlugin = daoPlugins?.[0] as ILockToVotePlugin | undefined;

    const lockManagerAddress = lockToVotePlugin?.lockManagerAddress;
    const tokenAddress = lockToVotePlugin?.settings.token.address;

    const { address } = useConnection();
    const { open } = useDialogContext();

    const { shouldTrigger } = useLockToVoteLockOnboardingCheck({
        lockManagerAddress,
        tokenAddress,
        userAddress: address,
        network: dao.network,
        enabled: lockToVotePlugin != null && address != null,
    });

    const [hasPendingConnection, setHasPendingConnection] = useState(false);
    useWalletConnectionEvent({
        onConnected: () => setHasPendingConnection(true),
    });

    useEffect(() => {
        if (
            lockToVotePlugin == null ||
            !hasPendingConnection ||
            !shouldTrigger
        ) {
            return;
        }

        setHasPendingConnection(false);

        const params: ILockToVoteLockOnboardingIntroDialogParams = {
            plugin: lockToVotePlugin,
            daoId: dao.id,
        };
        open(LockToVotePluginDialogId.LOCK_ONBOARDING_INTRO_L2V, { params });
    }, [hasPendingConnection, shouldTrigger, lockToVotePlugin, dao.id, open]);

    return null;
};
