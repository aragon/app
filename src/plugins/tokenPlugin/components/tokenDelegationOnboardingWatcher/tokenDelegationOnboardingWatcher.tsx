'use client';

import { useEffect, useRef } from 'react';
import { useConnection } from 'wagmi';

import type { IDao } from '@/shared/api/daoService';
import { PluginInterfaceType } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
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

    const delegationPlugin = dao.plugins.find(
        (plugin) =>
            (plugin.interfaceType === PluginInterfaceType.TOKEN_VOTING ||
                plugin.interfaceType === PluginInterfaceType.GAUGE_VOTER) &&
            (plugin.settings as ITokenPluginSettings).token?.hasDelegate ===
                true,
    );

    const { address, status } = useConnection();
    const { open } = useDialogContext();

    const tokenAddress = delegationPlugin
        ? (delegationPlugin.settings as ITokenPluginSettings).token.address
        : undefined;
    const tokenSymbol = delegationPlugin
        ? (delegationPlugin.settings as ITokenPluginSettings).token.symbol
        : undefined;
    const network = dao.network;

    const { shouldTrigger, isLoading } = useTokenDelegationOnboardingCheck({
        tokenAddress,
        userAddress: address,
        network,
        enabled: delegationPlugin != null && address != null,
    });

    const hadDisconnectedRef = useRef(status === 'disconnected');

    useEffect(() => {
        if (status === 'disconnected') {
            hadDisconnectedRef.current = true;
        }
    }, [status]);

    useEffect(() => {
        open(TokenPluginDialogId.DELEGATION_ONBOARDING_INTRO, {
            params: {
                token: tokenAddress,
                tokenSymbol,
                daoId: dao.id,
            },
        });

        if (!hadDisconnectedRef.current) return;
        if (status !== 'connected') return;
        if (isLoading || !shouldTrigger) return;
        if (
            delegationPlugin == null ||
            tokenAddress == null ||
            tokenSymbol == null
        )
            return;

        hadDisconnectedRef.current = false;
        open(TokenPluginDialogId.DELEGATION_ONBOARDING_INTRO, {
            params: {
                token: tokenAddress,
                tokenSymbol,
                daoId: dao.id,
            },
        });
    }, [
        status,
        shouldTrigger,
        isLoading,
        delegationPlugin,
        tokenAddress,
        tokenSymbol,
        network,
        dao.id,
        open,
    ]);

    return null;
};
