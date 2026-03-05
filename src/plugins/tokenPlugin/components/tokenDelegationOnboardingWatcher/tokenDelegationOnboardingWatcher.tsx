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

    // TODO: extend to get the all "eligible" plugins?
    const delegationPlugin = dao.plugins.find(
        (plugin) =>
            (plugin.interfaceType === PluginInterfaceType.TOKEN_VOTING ||
                plugin.interfaceType === PluginInterfaceType.GAUGE_VOTER) &&
            (plugin.settings as ITokenPluginSettings).token?.hasDelegate ===
                true,
    );

    const { address, status } = useConnection();
    const { open } = useDialogContext();

    const token = delegationPlugin
        ? (delegationPlugin.settings as ITokenPluginSettings).token
        : undefined;
    const tokenAddress = token?.address;
    const tokenSymbol = token?.symbol;
    const network = dao.network;

    const { shouldTrigger, isLoading } = useTokenDelegationOnboardingCheck({
        tokenAddress,
        userAddress: address,
        network,
        enabled: delegationPlugin != null && address != null,
    });

    const hasFiredRef = useRef(false);
    const hasSeenDisconnectedRef = useRef(false);
    const shouldOpenAfterConnectRef = useRef(false);

    useEffect(() => {
        if (status === 'disconnected') {
            hasFiredRef.current = false;
            hasSeenDisconnectedRef.current = true;
            shouldOpenAfterConnectRef.current = false;
        }

        if (hasSeenDisconnectedRef.current && status === 'connected') {
            hasFiredRef.current = false;
            shouldOpenAfterConnectRef.current = true;
            hasSeenDisconnectedRef.current = false;
        }
    }, [status]);

    useEffect(() => {
        if (
            status !== 'connected' ||
            !shouldOpenAfterConnectRef.current ||
            hasFiredRef.current
        ) {
            return;
        }

        if (isLoading || !shouldTrigger) {
            return;
        }

        if (tokenAddress == null || tokenSymbol == null) {
            return;
        }

        hasFiredRef.current = true;
        shouldOpenAfterConnectRef.current = false;
        open(TokenPluginDialogId.DELEGATION_ONBOARDING_INTRO, {
            params: {
                tokenAddress,
                tokenSymbol,
                daoId: dao.id,
            },
        });
    }, [
        status,
        shouldTrigger,
        isLoading,
        tokenAddress,
        tokenSymbol,
        dao.id,
        open,
    ]);

    return null;
};
