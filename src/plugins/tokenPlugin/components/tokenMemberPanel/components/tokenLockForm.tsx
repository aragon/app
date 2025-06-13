import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { AssetInput, type IAssetInputFormData } from '@/modules/finance/components/assetInput';
import { TokenPluginDialogId } from '@/plugins/tokenPlugin/constants/tokenPluginDialogId';
import type { ITokenApproveTokensDialogParams } from '@/plugins/tokenPlugin/dialogs/tokenApproveTokensDialog';
import type { ITokenLockUnlockDialogParams } from '@/plugins/tokenPlugin/dialogs/tokenLockUnlockDialog';
import { useCheckAllowance } from '@/plugins/tokenPlugin/hooks/useCheckAllowance';
import { useTokenLockListData } from '@/plugins/tokenPlugin/hooks/useTokenLockListData';
import type { ITokenPlugin } from '@/plugins/tokenPlugin/types';
import { useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { Button, invariant, Toggle, ToggleGroup, useDebouncedValue } from '@aragon/gov-ui-kit';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { formatUnits, parseUnits, type Hex } from 'viem';
import { useAccount } from 'wagmi';
import type { ITokenLocksDialogParams } from '../../../dialogs/tokenLocksDialog';
import { TokenLockFormChart } from './tokenLockFormChart';

export interface ITokenLockFormProps {
    /**
     * DAO plugin for the token locking.
     */
    plugin: ITokenPlugin;
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export interface ITokenLockFormData extends IAssetInputFormData {}

const valuePercentages = ['0', '25', '50', '75', '100'];

export const TokenLockForm: React.FC<ITokenLockFormProps> = (props) => {
    const { plugin, daoId } = props;
    const { votingEscrow, token } = plugin.settings;

    invariant(
        votingEscrow != null && plugin.votingEscrow != null,
        'TokenLockForm: voting escrow settings are required',
    );

    const { decimals } = token;

    const { open } = useDialogContext();
    const { t } = useTranslations();
    const { address } = useAccount();
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const lockParams = {
        urlParams: { address: address! },
        queryParams: { network: dao!.network, pluginAddress: plugin.address },
    };
    const { itemsCount, refetch: refetchLocks } = useTokenLockListData(lockParams);
    const lockCount = itemsCount ?? 0;

    const [percentageValue, setPercentageValue] = useState<string>('100');

    const { result: isConnected, check: walletGuard } = useConnectedWalletGuard();

    const { id: chainId } = networkDefinitions[dao!.network];

    const {
        allowance,
        balance: unlockedBalance,
        status: unlockedBalanceStatus,
        invalidateQueries,
    } = useCheckAllowance({
        owner: address!,
        spender: plugin.votingEscrow.escrowAddress as Hex,
        tokenAddress: token.underlying as Hex,
        chainId,
        enabled: address != null,
    });

    const parsedUnlockedAmount = formatUnits(unlockedBalance?.value ?? BigInt(0), decimals);

    const userAsset = useMemo(() => ({ token, amount: parsedUnlockedAmount }), [token, parsedUnlockedAmount]);

    const formValues = useForm<ITokenLockFormData>({ mode: 'onChange', defaultValues: { asset: userAsset } });
    const { control, setValue, handleSubmit } = formValues;

    const lockAmount = useWatch<ITokenLockFormData, 'amount'>({ control, name: 'amount' });
    const lockAmountWei = parseUnits(lockAmount ?? '0', token.decimals);
    const [lockAmountDebounced] = useDebouncedValue(lockAmount, { delay: 1000 });

    const needsApproval = isConnected && (allowance == null || allowance < lockAmountWei);

    const handleFormSubmit = () => {
        const dialogType = needsApproval ? 'approve' : 'lock';
        const dialogProps = getDialogProps(lockAmountWei);

        if (dialogType === 'approve') {
            const params: ITokenApproveTokensDialogParams = {
                ...dialogProps,
                translationNamespace: 'LOCK',
                onApproveSuccess: () => handleApproveSuccess(dialogProps), // open lock dialog with the same params!
                transactionInfo: {
                    title: t('app.plugins.token.tokenLockForm.approveTransactionInfoTitle', { symbol: token.symbol }),
                    current: 1,
                    total: 2,
                },
            };
            open(TokenPluginDialogId.APPROVE_TOKENS, { params });
        } else {
            const params: ITokenLockUnlockDialogParams = { ...dialogProps, action: 'lock' };
            open(TokenPluginDialogId.LOCK_UNLOCK, { params });
        }
    };

    const minDepositWei = BigInt(votingEscrow.minDeposit);
    const formattedMinDeposit = formatUnits(minDepositWei, decimals);

    const updateAmountField = useCallback(
        (value?: string) => {
            if (unlockedBalance == null || value == null) {
                return;
            }

            const processedValue = (unlockedBalance.value * BigInt(value)) / BigInt(100);

            const parsedValue = formatUnits(processedValue, decimals);
            setValue('amount', parsedValue);
        },
        [unlockedBalance, decimals, setValue],
    );

    const handlePercentageChange = useCallback(
        (value = '') => {
            updateAmountField(value);
            setPercentageValue(value);
        },
        [updateAmountField],
    );

    const handleViewLocks = () => {
        const params: ITokenLocksDialogParams = { plugin, initialParams: lockParams };
        open(TokenPluginDialogId.VIEW_LOCKS, { params });
    };

    const handleApproveSuccess = (dialogProps: ReturnType<typeof getDialogProps>) => {
        const params: ITokenLockUnlockDialogParams = {
            ...dialogProps,
            action: 'lock',
        };
        open(TokenPluginDialogId.LOCK_UNLOCK, { params });
    };

    const handleTransactionSuccess = () => {
        invalidateQueries();
        void refetchLocks();
    };

    const getDialogProps = (confirmAmount: bigint) => ({
        token,
        underlyingToken: token,
        amount: confirmAmount,
        network: dao!.network,
        onSuccess: handleTransactionSuccess,
        onSuccessClick: handleViewLocks,
        spender: plugin.votingEscrow?.escrowAddress as Hex,
        escrowContract: plugin.votingEscrow?.escrowAddress as Hex,
        showTransactionInfo: needsApproval,
    });

    // Update amount field and percentage value to 100% of user unlocked balance on user balance change
    useEffect(() => handlePercentageChange('100'), [handlePercentageChange]);

    // Initialize asset field after fetching unlocked balance
    useEffect(() => {
        if (unlockedBalanceStatus === 'success') {
            setValue('asset', userAsset);
        }
    }, [setValue, unlockedBalanceStatus, userAsset]);

    const submitLabel = needsApproval ? 'approve' : 'lock';
    const disableSubmit = unlockedBalance?.value === BigInt(0);

    return (
        <FormProvider {...formValues}>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit(handleFormSubmit)}>
                <div className="flex flex-col gap-3">
                    <TokenLockFormChart
                        slope={BigInt(1653439153439)}
                        bias={BigInt(1000000000000000000)}
                        amount={Number(lockAmountDebounced)}
                        maxTime={86400 * 180}
                    />
                    <AssetInput
                        onAmountChange={() => setPercentageValue('')}
                        disableAssetField={true}
                        hideMax={true}
                        hideAmountLabel={true}
                        minAmount={parseFloat(formattedMinDeposit)}
                    />
                    <ToggleGroup
                        isMultiSelect={false}
                        value={percentageValue}
                        onChange={handlePercentageChange}
                        variant="space-between"
                    >
                        {valuePercentages.map((value) => (
                            <Toggle
                                key={value}
                                value={value}
                                label={t(`app.plugins.token.tokenLockForm.percentage.${value}`)}
                            />
                        ))}
                    </ToggleGroup>
                </div>
                <div className="flex flex-col gap-3">
                    <Button
                        type={isConnected ? 'submit' : undefined}
                        onClick={isConnected ? undefined : () => walletGuard()}
                        disabled={disableSubmit}
                        variant="primary"
                        size="lg"
                    >
                        {t(`app.plugins.token.tokenLockForm.submit.${submitLabel}`, {
                            symbol: token.symbol,
                        })}
                    </Button>

                    {lockCount > 0 && (
                        <Button variant="secondary" size="lg" onClick={handleViewLocks}>
                            {t('app.plugins.token.tokenLockForm.locks', {
                                count: lockCount,
                            })}
                        </Button>
                    )}

                    <p className="text-center text-sm leading-normal font-normal text-neutral-500">
                        {t('app.plugins.token.tokenLockForm.footerInfo')}
                    </p>
                </div>
            </form>
        </FormProvider>
    );
};
