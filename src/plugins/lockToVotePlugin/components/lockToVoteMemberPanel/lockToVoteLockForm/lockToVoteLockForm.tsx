import {
    Button,
    formatterUtils,
    IconType,
    NumberFormat,
} from '@aragon/gov-ui-kit';
import { useCallback } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { formatUnits, parseUnits } from 'viem';
import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import {
    AssetInput,
    type IAssetInputFormData,
} from '@/modules/finance/components/assetInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useLockToVoteData } from '../../../hooks/useLockToVoteData';
import type { ILockToVoteMemberPanelProps } from '../lockToVoteMemberPanel';

export interface ILockToVoteLockFormProps extends ILockToVoteMemberPanelProps {
    mode?: 'panel' | 'dialog';
    onCancel?: () => void;
}

export interface ILockToVoteLockFormData extends IAssetInputFormData {}

export const LockToVoteLockForm: React.FC<ILockToVoteLockFormProps> = (
    props,
) => {
    const { plugin, daoId, mode = 'panel', onCancel } = props;
    const { token } = plugin.settings;
    const { symbol, decimals } = token;

    const { t } = useTranslations();

    const { result: isConnected, check: walletGuard } =
        useConnectedWalletGuard();

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
        [decimals, setValue, token],
    );

    const {
        balance,
        allowance,
        lockedAmount,
        lockTokens,
        unlockTokens,
        isLoading,
    } = useLockToVoteData({
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
    const formattedLockedAmount = formatterUtils.formatNumber(
        parsedLockedAmount,
        {
            format: NumberFormat.TOKEN_AMOUNT_SHORT,
        },
    );

    const submitLabel = needsApprovalForAmount ? 'approve' : 'lock';
    const disableSubmit = isLoading || balance === BigInt(0);

    const renderSubmitButton = ({ size }: { size: 'md' | 'lg' }) => (
        <Button
            disabled={disableSubmit}
            iconRight={mode === 'dialog' ? IconType.CHEVRON_RIGHT : undefined}
            onClick={isConnected ? undefined : () => walletGuard()}
            size={size}
            type={isConnected ? 'submit' : undefined}
            variant="primary"
        >
            {t(
                `app.plugins.lockToVote.lockToVoteLockForm.submit.${submitLabel}`,
                {
                    symbol: token.symbol,
                },
            )}
        </Button>
    );

    const footerInfo = (
        <p className="text-center font-normal text-neutral-500 text-sm leading-normal">
            {t('app.plugins.lockToVote.lockToVoteLockForm.footerInfo')}
        </p>
    );

    return (
        <FormProvider {...formValues}>
            <form
                className="flex flex-col gap-4"
                onSubmit={handleSubmit(handleFormSubmit)}
            >
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
                {mode === 'dialog' ? (
                    <div className="flex flex-col gap-9">
                        {footerInfo}
                        <div className="flex justify-between gap-3">
                            {onCancel != null && (
                                <Button
                                    onClick={onCancel}
                                    size="md"
                                    variant="tertiary"
                                >
                                    {t(
                                        'app.plugins.lockToVote.lockToVoteLockForm.cancel',
                                    )}
                                </Button>
                            )}
                            {renderSubmitButton({ size: 'md' })}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {renderSubmitButton({ size: 'lg' })}
                        {lockedAmount > 0 && (
                            <Button
                                disabled={isLoading}
                                onClick={unlockTokens}
                                size="lg"
                                variant="secondary"
                            >
                                {t(
                                    'app.plugins.lockToVote.lockToVoteLockForm.submit.unlock',
                                    {
                                        amount: formattedLockedAmount,
                                        symbol,
                                    },
                                )}
                            </Button>
                        )}
                        {footerInfo}
                    </div>
                )}
            </form>
        </FormProvider>
    );
};
