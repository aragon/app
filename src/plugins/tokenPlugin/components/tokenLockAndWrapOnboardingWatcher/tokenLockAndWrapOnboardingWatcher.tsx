'use client';

import { useEffect, useState } from 'react';
import { match } from 'ts-pattern';
import { useConnection } from 'wagmi';
import { GaugeVoterPluginDialogId } from '@/plugins/gaugeVoterPlugin/constants/gaugeVoterPluginDialogId';
import type { IGaugeVoterLockOnboardingIntroDialogParams } from '@/plugins/gaugeVoterPlugin/dialogs/gaugeVoterLockOnboardingIntroDialog/gaugeVoterLockOnboardingIntroDialog';
import type { IGaugeVoterPlugin } from '@/plugins/gaugeVoterPlugin/types';
import { type IDao, PluginInterfaceType } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useWalletConnectionEvent } from '@/shared/hooks/useWalletConnectionEvent';
import { daoUtils } from '../../../../shared/utils/daoUtils';
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

    const daoPlugins =
        daoUtils.getDaoPlugins(dao, {
            includeLinkedAccounts: false,
        }) ?? [];

    const eligiblePlugin = daoPlugins.find((plugin) =>
        match(plugin.interfaceType)
            .with(PluginInterfaceType.GAUGE_VOTER, () => true)
            .with(
                PluginInterfaceType.TOKEN_VOTING,
                // TOKEN_VOTING only matches if token.underlying != null (wrapping/non-gov case or VE token adapter case).
                () =>
                    (plugin.settings as ITokenPluginSettings).token
                        ?.underlying != null,
            )
            .otherwise(() => false),
    ) as IGaugeVoterPlugin | ITokenPlugin | undefined;

    const { address } = useConnection();
    const { open } = useDialogContext();
    const network = dao.network;

    const { shouldTrigger } = useTokenLockAndWrapOnboardingCheck({
        governanceTokenAddress: eligiblePlugin?.settings.token.address,
        underlyingTokenAddress:
            eligiblePlugin?.settings.token.underlying ?? undefined,
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
