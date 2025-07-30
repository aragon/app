import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { AssetInput, type IAssetInputFormData } from '@/modules/finance/components/assetInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { formatUnits, parseUnits } from 'viem';
import { useTokenLock } from '../../../hooks/useTokenLock';
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

    const { t } = useTranslations();

    const { result: isConnected, check: walletGuard } = useConnectedWalletGuard();

    const { balance, balanceStatus, lockedAmount, needsApproval, handleApproveAndLock, handleUnlockTokens } =
        useTokenLock({ plugin, daoId });

    const parsedBalance = formatUnits(balance?.value ?? BigInt(0), decimals);
    const userAsset = useMemo(() => ({ token, amount: parsedBalance }), [token, parsedBalance]);

    const formValues = useForm<ITokenLockFormData>({ mode: 'onSubmit', defaultValues: { asset: userAsset } });
    const { control, setValue, handleSubmit } = formValues;

    const lockAmount = useWatch<ITokenLockFormData, 'amount'>({ control, name: 'amount' });
    const lockAmountWei = parseUnits(lockAmount ?? '0', token.decimals);

    const needsApprovalForAmount = isConnected && needsApproval(lockAmountWei);

    const handleFormSubmit = () => {
        handleApproveAndLock(lockAmountWei);
    };

    useEffect(() => {
        if (balanceStatus === 'success') {
            setValue('asset', userAsset);
        }
    }, [setValue, balanceStatus, userAsset]);

    const parsedLockedAmount = formatUnits(lockedAmount, decimals);
    const formattedLockedAmount = formatterUtils.formatNumber(parsedLockedAmount, {
        format: NumberFormat.TOKEN_AMOUNT_SHORT,
    });

    const submitLabel = needsApprovalForAmount ? 'approve' : 'lock';
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
                        <Button variant="secondary" size="lg" onClick={() => handleUnlockTokens(lockedAmount)}>
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
