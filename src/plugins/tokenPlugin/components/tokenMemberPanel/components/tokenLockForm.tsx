import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { AssetInput, type IAssetInputFormData } from '@/modules/finance/components/assetInput';
import { generateToken } from '@/modules/finance/testUtils';
import { useTokenLocks } from '@/plugins/tokenPlugin/api/tokenService';
import { TokenPluginDialogId } from '@/plugins/tokenPlugin/constants/tokenPluginDialogId';
import type { ITokenApproveTokensDialogParams } from '@/plugins/tokenPlugin/dialogs/tokenApproveTokensDialog';
import type { ITokenLockUnlockDialogParams } from '@/plugins/tokenPlugin/dialogs/tokenLockUnlockDialog';
import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import { useDao, type IDaoPlugin } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { Button, Toggle, ToggleGroup } from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { erc20Abi, formatUnits, parseUnits, type Hex } from 'viem';
import { useAccount, useBalance, useReadContract } from 'wagmi';

export interface ITokenLockFormProps {
    /**
     * DAO plugin for the token locking.
     */
    plugin: IDaoPlugin<ITokenPluginSettings>;
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export interface ITokenLockFormData extends IAssetInputFormData {}

const valuePercentages = ['0', '25', '50', '75', '100'];

const dummyToken = generateToken({
    symbol: 'DUMMY',
    totalSupply: '10000',
    address: '0xEDc278C1DFAD001e875bb75064fC68099Ab65f88',
});

const dummyVeSettings = {
    minDeposit: '1000',
    minLockTime: 7 * 24 * 60 * 60,
    cooldown: 7 * 24 * 60 * 60,
    warmupPeriod: 3 * 24 * 60 * 60,
    maxTime: 365 * 24 * 60 * 60,
    slope: 0.1,
};

export const TokenLockForm: React.FC<ITokenLockFormProps> = (props) => {
    const { plugin, daoId } = props;

    const token = useMemo(
        () => ({ ...dummyToken, underlying: '0xEDc278C1DFAD001e875bb75064fC68099Ab65f88', hasDelegate: true }),
        [],
    );
    const { decimals } = token;
    const minDepositWei = useMemo(() => parseUnits(dummyVeSettings.minDeposit, decimals), [decimals]);

    const { open } = useDialogContext();
    const { t } = useTranslations();
    const { address } = useAccount();
    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const queryClient = useQueryClient();

    const lockParams = { urlParams: { address: address! }, queryParams: { pluginAddress: plugin.address } };
    const { data: lockData } = useTokenLocks(lockParams, { enabled: !!address });

    const lockCount = lockData?.pages[0]?.metadata.totalRecords ?? 0;

    const [percentageValue, setPercentageValue] = useState<string>('100');

    const { result: isConnected, check: walletGuard } = useConnectedWalletGuard();

    const { id: chainId } = networkDefinitions[dao!.network];

    const { data: tokenAllowance, queryKey: allowanceQueryKey } = useReadContract({
        abi: erc20Abi,
        functionName: 'allowance',
        address: token.address as Hex,
        args: [address!, token.address as Hex],
        query: { enabled: address != null },
        chainId,
    });

    console.log('tokenAllowance', tokenAllowance);

    const {
        data: unlockedBalance,
        queryKey: unlockedBalanceKey,
        status: unlockedBalanceStatus,
    } = useBalance({
        address,
        token: token.address as Hex,
        chainId,
        // TODO: Remove when data is coming from the backend
        query: {
            initialData: { value: BigInt(5000), decimals: token.decimals, symbol: token.symbol, formatted: '5,000' },
            enabled: false,
        },
    });

    const parsedUnlockedAmount = formatUnits(unlockedBalance?.value ?? BigInt(0), decimals);

    const userAsset = useMemo(() => ({ token, amount: parsedUnlockedAmount }), [token, parsedUnlockedAmount]);

    const formValues = useForm<ITokenLockFormData>({ mode: 'onSubmit', defaultValues: { asset: userAsset } });
    const { control, setValue, handleSubmit, setError, clearErrors } = formValues;

    const lockAmount = useWatch<ITokenLockFormData, 'amount'>({ control, name: 'amount' });
    const lockAmountWei = parseUnits(lockAmount ?? '0', token.decimals);

    const needsApproval = isConnected && (tokenAllowance == null || tokenAllowance < lockAmountWei);

    const handleTransactionSuccess = () => {
        void queryClient.invalidateQueries({ queryKey: allowanceQueryKey });
        void queryClient.invalidateQueries({ queryKey: unlockedBalanceKey });
    };

    const handleFormSubmit = () => {
        const dialogType = needsApproval ? 'approve' : 'lock';
        const dialogProps = getDialogProps(lockAmountWei);

        if (dialogType === 'approve') {
            const params: ITokenApproveTokensDialogParams = {
                ...dialogProps,
                translationNamespace: 'LOCK',
                onApproveSuccess: () => handleApproveSuccess(dialogProps), // open lock dialog with the same params!
            };
            open(TokenPluginDialogId.APPROVE_TOKENS, { params });
        } else {
            const params: ITokenLockUnlockDialogParams = { ...dialogProps, action: 'lock' };
            open(TokenPluginDialogId.LOCK_UNLOCK, { params });
        }
    };

    const updateAmountField = useCallback(
        (value?: string) => {
            if (unlockedBalance == null || value == null) {
                return;
            }

            const processedValue = (unlockedBalance.value * BigInt(value)) / BigInt(100);

            if (processedValue < minDepositWei) {
                setError('amount', {
                    type: 'validate',
                    message: t('app.plugins.token.tokenLockForm.minDepositError', {
                        minDeposit: dummyVeSettings.minDeposit,
                        symbol: token.symbol,
                    }),
                });
            } else {
                clearErrors('amount');
            }

            const parsedValue = formatUnits(processedValue, decimals);
            setValue('amount', parsedValue);
        },
        [unlockedBalance, decimals, setValue, setError, clearErrors, minDepositWei, t, token.symbol],
    );

    const handlePercentageChange = useCallback(
        (value = '') => {
            updateAmountField(value);
            setPercentageValue(value);
        },
        [updateAmountField],
    );

    const handleViewLocks = () => {
        // TODO: Handle view locks
    };

    const handleApproveSuccess = (dialogProps: ReturnType<typeof getDialogProps>) => {
        const params: ITokenLockUnlockDialogParams = { ...dialogProps, action: 'lock' };
        open(TokenPluginDialogId.LOCK_UNLOCK, { params });
    };

    const getDialogProps = (confirmAmount: bigint) => ({
        token,
        underlyingToken: token,
        amount: confirmAmount,
        network: dao!.network,
        onSuccess: handleTransactionSuccess,
        // spender: token.address as Hex
        spender: '0xe398B1b8863345Ce681E0f9246EeF168b538C8f6' as Hex,
    });

    // Update amount field and percentage value to 100% of user unlocked balance on user balance change
    useEffect(() => handlePercentageChange('100'), [handlePercentageChange]);

    // Initialize asset field after fetching unlocked balance
    useEffect(() => {
        if (unlockedBalanceStatus === 'success') {
            setValue('asset', userAsset);
        }
    }, [setValue, unlockedBalanceStatus, userAsset]);

    // Trigger validation if user manually enters amount in input
    useEffect(() => {
        if (lockAmountWei < minDepositWei) {
            setError('amount', {
                type: 'minDeposit',
                message: t('app.plugins.token.tokenLockForm.minDepositError', {
                    minDeposit: dummyVeSettings.minDeposit,
                    symbol: token.symbol,
                }),
            });
        } else {
            clearErrors('amount');
        }
    }, [lockAmountWei, minDepositWei, setError, clearErrors, t, token.symbol]);

    const submitLabel = needsApproval ? 'approve' : 'wrap';
    const disableSubmit = unlockedBalance?.value === BigInt(0);

    return (
        <FormProvider {...formValues}>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit(handleFormSubmit)}>
                <div className="flex flex-col gap-3">
                    <AssetInput
                        onAmountChange={() => setPercentageValue('')}
                        disableAssetField={true}
                        hideMax={true}
                        hideAmountLabel={true}
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

                    <p className="text-center text-sm font-normal leading-normal text-neutral-500">
                        {t('app.plugins.token.tokenLockForm.footerInfo')}
                    </p>
                </div>
            </form>
        </FormProvider>
    );
};
