'use client';

import { useEffect, useState } from 'react';
import { useConnection } from 'wagmi';
import type { IDao } from '@/shared/api/daoService';
import { PluginInterfaceType } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useWalletConnectionEvent } from '@/shared/hooks/useWalletConnectionEvent';
import { daoUtils } from '../../../../shared/utils/daoUtils';
import { TokenPluginDialogId } from '../../constants/tokenPluginDialogId';
import type { ITokenDelegationOnboardingDialogParams } from '../../dialogs/tokenDelegationOnboardingFormDialog';
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

    const daoPlugins =
        daoUtils.getDaoPlugins(dao, {
            includeSubPlugins: true,
            includeLinkedAccounts: false,
        }) ?? [];

    // TODO: extend to get the all "eligible" plugins?
    const delegationPlugin = daoPlugins.find(
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
        if (
            !hasPendingConnection ||
            !shouldTrigger ||
            tokenAddress == null ||
            tokenSymbol == null
        ) {
            return;
        }

        setHasPendingConnection(false);

        const delegationOnboardingIntroParams: ITokenDelegationOnboardingDialogParams =
            { tokenAddress, tokenSymbol, daoId: dao.id };

        open(TokenPluginDialogId.DELEGATION_ONBOARDING_INTRO, {
            params: delegationOnboardingIntroParams,
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
