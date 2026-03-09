'use client';

import { useEffect, useState } from 'react';
import { useConnection } from 'wagmi';
import { GaugeVoterPluginDialogId } from '@/plugins/gaugeVoterPlugin/constants/gaugeVoterPluginDialogId';
import type { IDao } from '@/shared/api/daoService';
import { PluginInterfaceType } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useWalletConnectionEvent } from '@/shared/hooks/useWalletConnectionEvent';
import { TokenPluginDialogId } from '../../constants/tokenPluginDialogId';
import { useTokenDelegationOnboardingCheck } from '../../hooks/useTokenDelegationOnboardingCheck';
import type { ITokenPluginSettings } from '../../types';

export interface ITokenDelegationOnboardingWatcherProps {
    /**
     * The DAO to watch for delegation onboarding.
     */
    dao: IDao;
}

export const TokenDelegationOnboardingWatcher: React.FC<
    ITokenDelegationOnboardingWatcherProps
> = (props) => {
    const { dao } = props;

    // TODO: extend to get the all "eligible" plugins?
    const delegationPlugin = dao.plugins.find(
        (plugin) =>
            (plugin.interfaceType === PluginInterfaceType.TOKEN_VOTING ||
                plugin.interfaceType === PluginInterfaceType.GAUGE_VOTER) &&
            (plugin.settings as ITokenPluginSettings).token?.hasDelegate ===
                true,
    );

    const { address } = useConnection();
    const { open } = useDialogContext();

    const token = delegationPlugin
        ? (delegationPlugin.settings as ITokenPluginSettings).token
        : undefined;
    const tokenAddress = token?.address;
    const tokenSymbol = token?.symbol;
    const network = dao.network;

    const { shouldTrigger } = useTokenDelegationOnboardingCheck({
        tokenAddress,
        userAddress: address,
        network,
        enabled: delegationPlugin != null && address != null,
    });

    const [hasPendingConnection, setHasPendingConnection] = useState(false);
    useWalletConnectionEvent({
        onConnected: () => setHasPendingConnection(true),
    });

    useEffect(() => {
        // TODO: remove — testing only
        open(GaugeVoterPluginDialogId.LOCK_ONBOARDING_INTRO, {
            params: { tokenAddress, tokenSymbol, daoId: dao.id },
        });

        if (
            !hasPendingConnection ||
            !shouldTrigger ||
            tokenAddress == null ||
            tokenSymbol == null
        ) {
            return;
        }

        setHasPendingConnection(false);

        open(TokenPluginDialogId.DELEGATION_ONBOARDING_INTRO, {
            params: { tokenAddress, tokenSymbol, daoId: dao.id },
        });
    }, [
        hasPendingConnection,
        tokenAddress,
        tokenSymbol,
        shouldTrigger,
        dao.id,
        open,
    ]);

    return null;
};
