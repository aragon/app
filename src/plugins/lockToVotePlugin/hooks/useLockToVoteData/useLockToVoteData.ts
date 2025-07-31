import { useMember } from '@/modules/governance/api/governanceService';
import { useCheckTokenAllowance } from '@/plugins/tokenPlugin/components/tokenMemberPanel/hooks/useCheckTokenAllowance';
import { TokenPluginDialogId } from '@/plugins/tokenPlugin/constants/tokenPluginDialogId';
import type { ITokenApproveTokensDialogParams } from '@/plugins/tokenPlugin/dialogs/tokenApproveTokensDialog';
import { useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { LockToVotePluginDialogId } from '../../constants/lockToVotePluginDialogId';
import type { ITokenLockUnlockDialogParams } from '../../dialogs/tokenLockUnlockDialog';
import type { ILockToVoteMember, ILockToVotePlugin } from '../../types';

export interface IUseLockToVoteDataParams {
    /**
     * lock-to-vote DAO plugin.
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
    balance?: { value: bigint };
    /**
     * Locked amount of tokens for the member.
     */
    lockedAmount: bigint;
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
     * Refetches member data and invalidates token queries.
     */
    refetchData: () => void;
}

export const useLockToVoteData = (params: IUseLockToVoteDataParams): IUseLockToVoteDataResult => {
    const { plugin, daoId, onBalanceUpdated } = params;
    const { token } = plugin.settings;
    const { lockManagerAddress } = plugin;

    const { open } = useDialogContext();
    const { t } = useTranslations();

    const { address } = useAccount();
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const { data: tokenMember, refetch: refetchMember } = useMember<ILockToVoteMember>(
        { urlParams: { address: address as string }, queryParams: { daoId, pluginAddress: plugin.address } },
        { enabled: address != null },
    );
    const lockedAmount = BigInt(tokenMember?.tokenBalance ?? '0');

    const {
        allowance = BigInt(0),
        balance,
        status: balanceStatus,
        invalidateQueries,
    } = useCheckTokenAllowance({ spender: lockManagerAddress, token });

    // Call onBalanceUpdated when balance changes.
    useEffect(() => {
        if (onBalanceUpdated && balanceStatus === 'success' && balance?.value != null) {
            onBalanceUpdated(balance.value);
        }
    }, [balanceStatus, balance?.value, token, onBalanceUpdated]);

    const handleApproveTokens = (amount: bigint, onSuccess: () => void) => {
        const { symbol } = token;
        const txInfoTitle = t('app.plugins.lockToVote.tokenLockForm.approveTransactionInfoTitle', { symbol });
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
        const params: ITokenLockUnlockDialogParams = {
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

    const onLockUnlockTokensSuccess = () => {
        invalidateQueries();
        void refetchMember();
    };

    const lockTokens = (amount: bigint) => {
        if (amount > allowance) {
            const onApproveSuccess = () => handleLockUnlockTokens('lock', amount, true);
            handleApproveTokens(amount, onApproveSuccess);
        } else {
            handleLockUnlockTokens('lock', amount);
        }
    };

    const unlockTokens = () => handleLockUnlockTokens('unlock', lockedAmount);

    const refetchData = () => {
        invalidateQueries();
        void refetchMember();
    };

    return {
        allowance,
        balance,
        lockedAmount,
        lockTokens,
        unlockTokens,
        refetchData,
    };
};
