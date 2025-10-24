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
import type { ILockToVoteWithdrawDialogParams } from '../../dialogs/lockToVoteWithdrawDialog';
import type { ILockToVotePlugin } from '../../types';
import { lockToVoteFeeUtils } from '../../utils/lockToVoteFeeUtils';
import { useLockToVoteFeeData } from '../useLockToVoteFeeData';
import { useLockToVoteTokenId } from '../useLockToVoteTokenId';
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
    const { lockManagerAddress, votingEscrow } = plugin;

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

    // Query fee settings from DynamicExitQueue contract
    const {
        data: feePercentFromContract,
        isLoading: isFeePercentLoading,
        error: feePercentError,
    } = useReadContract({
        abi: [
            {
                type: 'function',
                name: 'feePercent',
                inputs: [],
                outputs: [{ name: '', type: 'uint256' }],
                stateMutability: 'view',
            },
        ] as const,
        functionName: 'feePercent',
        address: lockManagerAddress as Hex,
        chainId,
    });

    const {
        data: minFeePercentFromContract,
        isLoading: isMinFeePercentLoading,
        error: minFeePercentError,
    } = useReadContract({
        abi: [
            {
                type: 'function',
                name: 'minFeePercent',
                inputs: [],
                outputs: [{ name: '', type: 'uint256' }],
                stateMutability: 'view',
            },
        ] as const,
        functionName: 'minFeePercent',
        address: lockManagerAddress as Hex,
        chainId,
    });

    console.log('📊 Contract fee queries:', {
        lockManagerAddress,
        feePercentFromContract,
        minFeePercentFromContract,
        isFeePercentLoading,
        isMinFeePercentLoading,
        feePercentError: feePercentError?.message,
        minFeePercentError: minFeePercentError?.message,
    });

    // Use contract values if available, otherwise fall back to plugin settings
    const feePercent =
        feePercentFromContract != null ? Number(feePercentFromContract) : (plugin.settings.feePercent ?? 0);
    const minFeePercent =
        minFeePercentFromContract != null ? Number(minFeePercentFromContract) : (plugin.settings.minFeePercent ?? 0);

    // TODO: Remove this test override once we have a DAO with fees configured
    // Temporarily treat all lock-to-vote plugins as having fees configured for testing
    const TEST_MODE = true;
    const hasFeesConfigured = TEST_MODE || feePercent > 0 || minFeePercent > 0;

    // Query escrow address from DynamicExitQueue contract if fees are configured
    const { data: escrowAddressFromContract } = useReadContract({
        abi: [
            {
                type: 'function',
                name: 'escrow',
                inputs: [],
                outputs: [{ name: '', type: 'address' }],
                stateMutability: 'view',
            },
        ] as const,
        functionName: 'escrow',
        address: lockManagerAddress as Hex,
        chainId,
        query: { enabled: hasFeesConfigured },
    });

    // Get tokenId if escrow address is available (for fee-based withdrawals)
    const escrowAddress = (escrowAddressFromContract ?? votingEscrow?.curveAddress) as Hex | undefined;
    const { tokenId, refetch: refetchTokenId } = useLockToVoteTokenId({
        escrowAddress: escrowAddress!,
        userAddress: address,
        chainId,
        enabled: hasFeesConfigured && escrowAddress != null && address != null,
    });

    // Get fee data if tokenId is available and fees are configured
    const {
        ticket,
        feeAmount,
        refetch: refetchFeeData,
    } = useLockToVoteFeeData({
        tokenId: tokenId!,
        lockManagerAddress: lockManagerAddress as Hex,
        chainId,
        enabled: hasFeesConfigured && tokenId != null,
    });

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
        void refetchTokenId();
        void refetchFeeData();
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

        open(LockToVotePluginDialogId.LOCK_UNLOCK_L2V, { params });
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

    const unlockTokens = () => {
        console.log('🔓 unlockTokens called', {
            hasFeesConfigured,
            feePercent,
            minFeePercent,
            escrowAddress,
            tokenId,
            ticket,
            feeAmount,
            dao: !!dao,
        });

        // If no fees configured, use existing unlock flow
        if (!hasFeesConfigured) {
            console.log('❌ No fees configured, using legacy unlock flow');
            unlockGuard.check();
            return;
        }

        // Check if we should bypass the fee dialog (both fees are 0)
        if (ticket && !lockToVoteFeeUtils.shouldShowFeeDialog(plugin.settings)) {
            console.log('❌ Should bypass fee dialog (both fees are 0)');
            unlockGuard.check();
            return;
        }

        // If we have all the required data, open the withdraw dialog with fee information
        if (tokenId != null && ticket != null && feeAmount != null && dao != null) {
            console.log('✅ Opening withdraw dialog with fee information');
            const params: ILockToVoteWithdrawDialogParams = {
                tokenId,
                token,
                lockManagerAddress: lockManagerAddress as Hex,
                ticket,
                lockedAmount,
                feeAmount,
                network: dao.network,
                onSuccess: refetchData,
            };

            open(LockToVotePluginDialogId.WITHDRAW_WITH_FEE, { params });
            return;
        }

        // Fall back to existing flow if data is not yet available
        console.log('❌ Missing required data, falling back to legacy unlock flow', {
            hasTokenId: tokenId != null,
            hasTicket: ticket != null,
            hasFeeAmount: feeAmount != null,
            hasDao: dao != null,
        });
        unlockGuard.check();
    };

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
