'use client';

import { useEffect, useState } from 'react';
import { match } from 'ts-pattern';
import { useConnection } from 'wagmi';
import { GaugeVoterPluginDialogId } from '@/plugins/gaugeVoterPlugin/constants/gaugeVoterPluginDialogId';
import type { IGaugeVoterLockOnboardingIntroDialogParams } from '@/plugins/gaugeVoterPlugin/dialogs/gaugeVoterLockOnboardingIntroDialog/gaugeVoterLockOnboardingIntroDialog';
import type { IGaugeVoterPlugin } from '@/plugins/gaugeVoterPlugin/types';
import type { IGaugeVoterPluginSettings } from '@/plugins/gaugeVoterPlugin/types/gaugeVoterPlugin';
import { LockToVotePluginDialogId } from '@/plugins/lockToVotePlugin/constants/lockToVotePluginDialogId';
import type { ILockToVoteLockOnboardingIntroDialogParams } from '@/plugins/lockToVotePlugin/dialogs/lockToVoteLockOnboardingIntroDialog/lockToVoteLockOnboardingIntroDialog';
import type {
    ILockToVotePlugin,
    ILockToVotePluginSettings,
} from '@/plugins/lockToVotePlugin/types';
import { type IDao, PluginInterfaceType } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useWalletConnectionEvent } from '@/shared/hooks/useWalletConnectionEvent';
import { TokenPluginDialogId } from '../../constants/tokenPluginDialogId';
import type { ITokenWrapOnboardingIntroDialogParams } from '../../dialogs/tokenWrapOnboardingIntroDialog/tokenWrapOnboardingIntroDialog';
import { useTokenLockAndWrapOnboardingCheck } from '../../hooks/useTokenLockAndWrapOnboardingCheck';
import type { ITokenPlugin, ITokenPluginSettings } from '../../types';

export interface ITokenLockAndWrapOnboardingWatcherProps {
    /**
     * The DAO to watch for lock/wrap onboarding.
     */
    dao: IDao;
}

export const TokenLockAndWrapOnboardingWatcher: React.FC<
    ITokenLockAndWrapOnboardingWatcherProps
> = (props) => {
    const { dao } = props;

    const eligiblePlugin = dao.plugins.find((plugin) =>
        match(plugin.interfaceType)
            .with(PluginInterfaceType.GAUGE_VOTER, () => true)
            .with(PluginInterfaceType.LOCK_TO_VOTE, () => true)
            .with(
                PluginInterfaceType.TOKEN_VOTING,
                // TOKEN_VOTING only matches if token.underlying != null (wrapping/non-gov case or VE token adapter case).
                () =>
                    (plugin.settings as ITokenPluginSettings).token
                        ?.underlying != null,
            )
            .otherwise(() => false),
    );

    const [governanceTokenAddress, underlyingTokenAddress] = match(
        eligiblePlugin?.interfaceType,
    )
        .with(PluginInterfaceType.GAUGE_VOTER, () => {
            const settings = eligiblePlugin!
                .settings as IGaugeVoterPluginSettings;
            return [settings.token.address, settings.token.underlying];
        })
        .with(PluginInterfaceType.LOCK_TO_VOTE, () => {
            const settings = eligiblePlugin!
                .settings as ILockToVotePluginSettings;
            return [settings.token.address, settings.token.address];
        })
        .with(PluginInterfaceType.TOKEN_VOTING, () => {
            const settings = eligiblePlugin!.settings as ITokenPluginSettings;
            return [
                settings.token.address,
                settings.token.underlying ?? undefined,
            ];
        })
        .otherwise(() => [undefined, undefined]);

    const { address } = useConnection();
    const { open } = useDialogContext();
    const network = dao.network;

    const { shouldTrigger } = useTokenLockAndWrapOnboardingCheck({
        governanceTokenAddress,
        underlyingTokenAddress,
        userAddress: address,
        network,
        enabled: eligiblePlugin != null && address != null,
    });

    const [hasPendingConnection, setHasPendingConnection] = useState(false);
    useWalletConnectionEvent({
        onConnected: () => setHasPendingConnection(true),
    });

    useEffect(() => {
        if (eligiblePlugin == null || !hasPendingConnection || !shouldTrigger) {
            return;
        }

        setHasPendingConnection(false);

        if (
            // Either GaugeVoter or TokenVoting with a votingEscrow token adapter.
            eligiblePlugin.interfaceType === PluginInterfaceType.GAUGE_VOTER ||
            (eligiblePlugin.interfaceType ===
                PluginInterfaceType.TOKEN_VOTING &&
                (eligiblePlugin as ITokenPlugin).votingEscrow != null)
        ) {
            const params: IGaugeVoterLockOnboardingIntroDialogParams = {
                plugin: eligiblePlugin as IGaugeVoterPlugin,
                daoId: dao.id,
            };
            open(GaugeVoterPluginDialogId.LOCK_ONBOARDING_INTRO, { params });
        } else if (
            eligiblePlugin.interfaceType === PluginInterfaceType.LOCK_TO_VOTE
        ) {
            const params: ILockToVoteLockOnboardingIntroDialogParams = {
                plugin: eligiblePlugin as ILockToVotePlugin,
                daoId: dao.id,
            };
            open(LockToVotePluginDialogId.LOCK_ONBOARDING_INTRO, { params });
        } else if (
            eligiblePlugin.interfaceType === PluginInterfaceType.TOKEN_VOTING
        ) {
            const params: ITokenWrapOnboardingIntroDialogParams = {
                token: (eligiblePlugin as ITokenPlugin).settings.token,
                daoId: dao.id,
            };
            open(TokenPluginDialogId.WRAP_ONBOARDING_INTRO, { params });
        }
    }, [hasPendingConnection, shouldTrigger, eligiblePlugin, dao.id, open]);

    return null;
};
