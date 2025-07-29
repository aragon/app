import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { AssetInput, type IAssetInputFormData } from '@/modules/finance/components/assetInput';
import { useMember } from '@/modules/governance/api/governanceService';
import { useCheckTokenAllowance } from '@/plugins/tokenPlugin/components/tokenMemberPanel/hooks/useCheckTokenAllowance';
import { TokenPluginDialogId } from '@/plugins/tokenPlugin/constants/tokenPluginDialogId';
import type { ITokenApproveTokensDialogParams } from '@/plugins/tokenPlugin/dialogs/tokenApproveTokensDialog';
import type { ITokenMember } from '@/plugins/tokenPlugin/types';
import { useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { formatUnits, parseUnits } from 'viem';
import { useAccount } from 'wagmi';
import { LockToVotePluginDialogId } from '../../../constants/lockToVotePluginDialogId';
import type { ITokenLockUnlockDialogParams } from '../../../dialogs/tokenLockUnlockDialog';
import type { ILockToVotePlugin } from '../../../types';

export interface ITokenLockFormProps {
    /**
     * DAO plugin for the token locking.
     */
    plugin: ILockToVotePlugin;
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export interface ITokenLockFormData extends IAssetInputFormData {}

export const TokenLockForm: React.FC<ITokenLockFormProps> = (props) => {
    const { plugin, daoId } = props;

    const { token } = plugin.settings;
    const { symbol, decimals } = token;
    const { lockManagerAddress } = plugin;

    const { open } = useDialogContext();
    const { t } = useTranslations();

    const { address } = useAccount();
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const { result: isConnected, check: walletGuard } = useConnectedWalletGuard();

    const { data: tokenMember, refetch: refetchMember } = useMember<ITokenMember>(
        { urlParams: { address: address as string }, queryParams: { daoId, pluginAddress: plugin.address } },
        { enabled: address != null },
    );

    const {
        allowance,
        balance,
        status: balanceStatus,
        invalidateQueries,
    } = useCheckTokenAllowance({ spender: lockManagerAddress, token });

    const parsedBalance = formatUnits(balance?.value ?? BigInt(0), decimals);
    const userAsset = useMemo(() => ({ token, amount: parsedBalance }), [token, parsedBalance]);

    const formValues = useForm<ITokenLockFormData>({ mode: 'onSubmit', defaultValues: { asset: userAsset } });
    const { control, setValue, handleSubmit } = formValues;

    const lockAmount = useWatch<ITokenLockFormData, 'amount'>({ control, name: 'amount' });
    const lockAmountWei = parseUnits(lockAmount ?? '0', token.decimals);

    const needsApproval = isConnected && (allowance == null || allowance < lockAmountWei);

    const handleFormSubmit = () => {
        if (needsApproval) {
            handleApproveTokens();
        } else {
            handleLockUnlockTokens('lock', lockAmountWei);
        }
    };

    const handleApproveTokens = () => {
        const { symbol } = token;
        const txInfoTitle = t('app.plugins.lockToVote.tokenLockForm.approveTransactionInfoTitle', { symbol });
        const transactionInfo = { title: txInfoTitle, current: 1, total: 2 };

        const params: ITokenApproveTokensDialogParams = {
            token,
            amount: lockAmountWei,
            network: dao!.network,
            translationNamespace: 'LOCK',
            onSuccess: () => onApproveTokensSuccess(lockAmountWei),
            spender: lockManagerAddress,
            transactionInfo,
        };

        open(TokenPluginDialogId.APPROVE_TOKENS, { params });
    };

    const handleLockUnlockTokens = (action: 'lock' | 'unlock', amount: bigint) => {
        const params: ITokenLockUnlockDialogParams = {
            action,
            token,
            lockManagerAddress,
            amount,
            network: dao!.network,
            onSuccess: onLockUnlockTokensSuccess,
            showTransactionInfo: action === 'lock' && needsApproval,
        };

        open(LockToVotePluginDialogId.LOCK_UNLOCK, { params });
    };

    const onApproveTokensSuccess = (tokenAmount: bigint) => {
        invalidateQueries();
        handleLockUnlockTokens('lock', tokenAmount);
    };

    const onLockUnlockTokensSuccess = () => {
        invalidateQueries();
        void refetchMember();
    };

    // Initialize asset field after fetching balance
    useEffect(() => {
        if (balanceStatus === 'success') {
            setValue('asset', userAsset);
        }
    }, [setValue, balanceStatus, userAsset]);

    const lockedAmount = BigInt(tokenMember?.tokenBalance ?? '0');
    const parsedLockedAmount = formatUnits(lockedAmount, decimals);

    const formattedLockedAmount = formatterUtils.formatNumber(parsedLockedAmount, {
        format: NumberFormat.TOKEN_AMOUNT_SHORT,
    });

    const submitLabel = needsApproval ? 'approve' : 'lock';
    const disableSubmit = balance?.value === BigInt(0);

    return (
        <FormProvider {...formValues}>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit(handleFormSubmit)}>
                <p className="text-base leading-normal font-normal text-neutral-500">
                    {t('app.plugins.lockToVote.tokenLockForm.info', { symbol: token.symbol })}
                </p>
                <div className="flex flex-col gap-3">
                    <AssetInput
                        disableAssetField={true}
                        hideMax={true}
                        hideAmountLabel={true}
                        percentageSelection={{
                            totalBalance: balance?.value,
                            tokenDecimals: decimals,
                        }}
                    />
                </div>
                <div className="flex flex-col gap-3">
                    <Button
                        type={isConnected ? 'submit' : undefined}
                        onClick={isConnected ? undefined : () => walletGuard()}
                        disabled={disableSubmit}
                        variant="primary"
                        size="lg"
                    >
                        {t(`app.plugins.lockToVote.tokenLockForm.submit.${submitLabel}`, {
                            symbol: token.symbol,
                        })}
                    </Button>
                    {lockedAmount > 0 && (
                        <Button
                            variant="secondary"
                            size="lg"
                            onClick={() => handleLockUnlockTokens('unlock', lockedAmount)}
                        >
                            {t('app.plugins.lockToVote.tokenLockForm.submit.unlock', {
                                amount: formattedLockedAmount,
                                symbol,
                            })}
                        </Button>
                    )}
                    <p className="text-center text-sm leading-normal font-normal text-neutral-500">
                        {t('app.plugins.lockToVote.tokenLockForm.footerInfo')}
                    </p>
                </div>
            </form>
        </FormProvider>
    );
};
