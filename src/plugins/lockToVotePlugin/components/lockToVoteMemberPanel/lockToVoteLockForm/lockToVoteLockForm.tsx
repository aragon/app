import { Button, formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import { useCallback } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { formatUnits, parseUnits } from 'viem';
import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { AssetInput, type IAssetInputFormData } from '@/modules/finance/components/assetInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useLockToVoteData } from '../../../hooks/useLockToVoteData';
import type { ILockToVoteMemberPanelProps } from '../lockToVoteMemberPanel';

export interface ILockToVoteLockFormProps extends ILockToVoteMemberPanelProps {}

export interface ILockToVoteLockFormData extends IAssetInputFormData {}

export const LockToVoteLockForm: React.FC<ILockToVoteLockFormProps> = (props) => {
    const { plugin, daoId } = props;
    const { token } = plugin.settings;
    const { symbol, decimals } = token;

    const { t } = useTranslations();

    const { result: isConnected, check: walletGuard } = useConnectedWalletGuard();

    const formValues = useForm<ILockToVoteLockFormData>({
        mode: 'onSubmit',
        defaultValues: { asset: { token, amount: '0' } },
    });
    const { control, setValue, handleSubmit } = formValues;

    const handleBalanceUpdated = useCallback(
        (balance: bigint) => {
            const parsedBalance = formatUnits(balance, decimals);
            setValue('asset', { token, amount: parsedBalance });
        },
        [decimals, setValue, token]
    );

    const { balance, allowance, lockedAmount, lockTokens, unlockTokens, isLoading } = useLockToVoteData({
        plugin,
        daoId,
        onBalanceUpdated: handleBalanceUpdated,
    });

    const lockAmount = useWatch<ILockToVoteLockFormData, 'amount'>({
        control,
        name: 'amount',
    });
    const lockAmountWei = parseUnits(lockAmount ?? '0', decimals);

    const needsApprovalForAmount = isConnected && lockAmountWei > allowance;

    const handleFormSubmit = () => lockTokens(lockAmountWei);

    const parsedLockedAmount = formatUnits(lockedAmount, decimals);
    const formattedLockedAmount = formatterUtils.formatNumber(parsedLockedAmount, {
        format: NumberFormat.TOKEN_AMOUNT_SHORT,
    });

    const submitLabel = needsApprovalForAmount ? 'approve' : 'lock';
    const disableSubmit = isLoading || balance === BigInt(0);

    return (
        <FormProvider {...formValues}>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit(handleFormSubmit)}>
                <p className="font-normal text-base text-neutral-500 leading-normal">
                    {t('app.plugins.lockToVote.lockToVoteLockForm.info', {
                        symbol: token.symbol,
                    })}
                </p>
                <AssetInput
                    disableAssetField={true}
                    hideAmountLabel={true}
                    hideMax={true}
                    percentageSelection={{
                        totalBalance: balance,
                        tokenDecimals: decimals,
                    }}
                />
                <div className="flex flex-col gap-3">
                    <Button
                        disabled={disableSubmit}
                        onClick={isConnected ? undefined : () => walletGuard()}
                        size="lg"
                        type={isConnected ? 'submit' : undefined}
                        variant="primary"
                    >
                        {t(`app.plugins.lockToVote.lockToVoteLockForm.submit.${submitLabel}`, {
                            symbol: token.symbol,
                        })}
                    </Button>
                    {lockedAmount > 0 && (
                        <Button disabled={isLoading} onClick={unlockTokens} size="lg" variant="secondary">
                            {t('app.plugins.lockToVote.lockToVoteLockForm.submit.unlock', {
                                amount: formattedLockedAmount,
                                symbol,
                            })}
                        </Button>
                    )}
                    <p className="text-center font-normal text-neutral-500 text-sm leading-normal">
                        {t('app.plugins.lockToVote.lockToVoteLockForm.footerInfo')}
                    </p>
                </div>
            </form>
        </FormProvider>
    );
};
