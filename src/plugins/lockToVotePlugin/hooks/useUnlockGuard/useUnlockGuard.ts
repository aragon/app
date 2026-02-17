import { useCallback } from 'react';
import type { Hex } from 'viem';
import { useConnection, useSimulateContract } from 'wagmi';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { LockToVotePluginDialogId } from '../../constants/lockToVotePluginDialogId';
import type { ILockToVotePlugin } from '../../types';

export interface IUseUnlockGuardParams {
    /**
     * Lock to vote plugin instance.
     */
    plugin: ILockToVotePlugin;
    /**
     * Callback fired when unlock simulation succeeds and user should proceed.
     */
    onSuccess?: () => void;
    /**
     * Callback fired when there's an error.
     */
    onError?: () => void;
}

const lockManagerAbi = [
    {
        type: 'function',
        name: 'unlock',
        inputs: [],
        outputs: [],
    },
] as const;

export const useUnlockGuard = (params: IUseUnlockGuardParams) => {
    const { plugin, onSuccess, onError } = params;
    const { token } = plugin.settings;
    const { lockManagerAddress } = plugin;

    const { open } = useDialogContext();
    const { address } = useConnection();

    const { id: chainId } = networkDefinitions[token.network];

    const {
        data: simulationData,
        error: simulationError,
        isLoading,
    } = useSimulateContract({
        abi: lockManagerAbi,
        functionName: 'unlock',
        address: lockManagerAddress as Hex,
        args: [],
        chainId,
        account: address,
        query: {
            enabled: address != null,
            retry: false, // Don't retry failed simulations
        },
    });

    const checkUnlock = useCallback(() => {
        if (isLoading) {
            return;
        }

        if (simulationError) {
            open(LockToVotePluginDialogId.UNLOCK_BLOCKED_INFO);
            onError?.();
            return;
        }

        onSuccess?.();
    }, [isLoading, onError, onSuccess, open, simulationError]);

    return {
        check: checkUnlock,
        result: !simulationError && simulationData != null,
        isLoading,
    };
};
