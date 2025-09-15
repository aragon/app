import { useCheckTokenAllowance } from '@/plugins/tokenPlugin/components/tokenMemberPanel/hooks/useCheckTokenAllowance';
import { TokenPluginDialogId } from '@/plugins/tokenPlugin/constants/tokenPluginDialogId';
import type { ITokenApproveTokensDialogParams } from '@/plugins/tokenPlugin/dialogs/tokenApproveTokensDialog';
import { useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useEffect } from 'react';
import { type Hex } from 'viem';
import { useAccount, useReadContract } from 'wagmi';
import { networkDefinitions } from '../../../../shared/constants/networkDefinitions';
import { LockToVotePluginDialogId } from '../../constants/lockToVotePluginDialogId';
import type { ILockToVoteLockUnlockDialogParams } from '../../dialogs/lockToVoteLockUnlockDialog';
import type { ILockToVotePlugin } from '../../types';
import { useUnlockGuard } from '../useUnlockGuard';

export interface IUseLockToVoteDataParams {
    /**
     * Lock to vote DAO plugin.
     */
    plugin: ILockToVotePlugin;
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Callback fired when balance is updated.
     */
    onBalanceUpdated?: (balance: bigint) => void;
}

export interface IUseLockToVoteDataResult {
    /**
     * Approved token allowance for the lock manager address.
     */
    allowance: bigint;
    /**
     * Current (available) token balance of the member.
     */
    balance?: bigint;
    /**
     * Locked amount of tokens for the member.
     */
    lockedAmount: bigint;
    /**
     * Defines if the hook is loading the data or not.
     */
    isLoading: boolean;
    /**
     * Handles the lock flow for a given amount. Triggers approval if needed.
     * @param amount - Amount of tokens to lock, in wei.
     */
    lockTokens: (amount: bigint) => void;
    /**
     * Handles unlocking tokens, all at once.
     */
    unlockTokens: () => void;
    /**
     * Handles the approve tokens flow.
     */
    approveTokens: (amount: bigint, onSuccess: () => void) => void;
    /**
     * Refetches member data and invalidates token queries.
     */
    refetchData: () => void;
}

const lockManagerAbi = [
    {
        type: 'function',
        name: 'getLockedBalance',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view',
    },
] as const;

export const useLockToVoteData = (params: IUseLockToVoteDataParams): IUseLockToVoteDataResult => {
    const { plugin, daoId, onBalanceUpdated } = params;
    const { token } = plugin.settings;
    const { lockManagerAddress } = plugin;

    const { open } = useDialogContext();
    const { t } = useTranslations();

    const { address } = useAccount();
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const { id: chainId } = networkDefinitions[token.network];
    const {
        data: lockedBalance,
        refetch: refetchLockedAmount,
        isLoading: isLockedBalanceLoading,
    } = useReadContract({
        abi: lockManagerAbi,
        functionName: 'getLockedBalance',
        address: lockManagerAddress as Hex,
        args: [address as Hex],
        query: { enabled: address != null },
        chainId,
    });

    const lockedAmount = lockedBalance ?? BigInt(0);

    const {
        allowance = BigInt(0),
        balance,
        status: balanceStatus,
        invalidateQueries,
        isLoading: isAllowanceCheckLoading,
    } = useCheckTokenAllowance({ spender: lockManagerAddress, token });

    // Call onBalanceUpdated when balance changes.
    useEffect(() => {
        if (onBalanceUpdated && balanceStatus === 'success' && balance?.value != null) {
            onBalanceUpdated(balance.value);
        }
    }, [balanceStatus, balance?.value, token, onBalanceUpdated]);

    const refetchData = () => {
        invalidateQueries();
        void refetchLockedAmount();
    };

    const approveTokens = (amount: bigint, onSuccess: () => void) => {
        const { symbol } = token;
        const txInfoTitle = t('app.plugins.lockToVote.lockToVoteLockForm.approveTransactionInfoTitle', { symbol });
        const transactionInfo = { title: txInfoTitle, current: 1, total: 2 };

        const params: ITokenApproveTokensDialogParams = {
            token,
            amount,
            network: dao!.network,
            translationNamespace: 'LOCK',
            onSuccess,
            spender: lockManagerAddress,
            transactionInfo,
        };

        open(TokenPluginDialogId.APPROVE_TOKENS, { params });
    };

    const handleLockUnlockTokens = (action: 'lock' | 'unlock', amount: bigint, showTransactionInfo = false) => {
        const params: ILockToVoteLockUnlockDialogParams = {
            action,
            token,
            lockManagerAddress,
            amount,
            network: dao!.network,
            onSuccess: onLockUnlockTokensSuccess,
            showTransactionInfo,
        };

        open(LockToVotePluginDialogId.LOCK_UNLOCK, { params });
    };

    const onLockUnlockTokensSuccess = () => refetchData();

    const unlockGuard = useUnlockGuard({
        plugin,
        onSuccess: () => handleLockUnlockTokens('unlock', lockedAmount),
    });

    const lockTokens = (amount: bigint) => {
        if (amount > allowance) {
            const onApproveSuccess = () => {
                // Refetch data after approval to ensure the allowance is updated in the case followup lock is cancelled
                refetchData();
                handleLockUnlockTokens('lock', amount, true);
            };
            approveTokens(amount, onApproveSuccess);
        } else {
            handleLockUnlockTokens('lock', amount);
        }
    };

    const unlockTokens = () => unlockGuard.check();

    const isLoading = isLockedBalanceLoading || isAllowanceCheckLoading || unlockGuard.isLoading;

    return {
        allowance,
        balance: balance?.value,
        lockedAmount,
        isLoading,
        lockTokens,
        unlockTokens,
        approveTokens,
        refetchData,
    };
};
