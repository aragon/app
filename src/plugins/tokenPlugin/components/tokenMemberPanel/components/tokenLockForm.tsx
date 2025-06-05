import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { AssetInput, type IAssetInputFormData } from '@/modules/finance/components/assetInput';
import { useTokenLocks } from '@/plugins/tokenPlugin/api/tokenService';
import { TokenPluginDialogId } from '@/plugins/tokenPlugin/constants/tokenPluginDialogId';
import type { ITokenApproveTokensDialogParams } from '@/plugins/tokenPlugin/dialogs/tokenApproveTokensDialog';
import type { ITokenLockUnlockDialogParams } from '@/plugins/tokenPlugin/dialogs/tokenLockUnlockDialog';
import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import { useDao, type IDaoPlugin } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { Button, invariant, Toggle, ToggleGroup } from '@aragon/gov-ui-kit';
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

export const TokenLockForm: React.FC<ITokenLockFormProps> = (props) => {
    const { plugin, daoId } = props;
    const { votingEscrow, token } = plugin.settings;

    invariant(votingEscrow != null && plugin.votingEscrow != null, 'Token lock form requires voting escrow settings');

    const { decimals } = token;
    const minDepositWei = BigInt(votingEscrow.minDeposit);

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
        address: token.underlying as Hex,
        args: [address!, plugin.votingEscrow.escrowAddress as Hex],
        query: { enabled: address != null },
        chainId,
    });

    const {
        data: unlockedBalance,
        queryKey: unlockedBalanceKey,
        status: unlockedBalanceStatus,
    } = useBalance({
        address,
        token: token.underlying as Hex,
        chainId,
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
                        minDeposit: votingEscrow.minDeposit,
                        symbol: token.symbol,
                    }),
                });
            } else {
                clearErrors('amount');
            }

            const parsedValue = formatUnits(processedValue, decimals);
            setValue('amount', parsedValue);
        },
        [
            unlockedBalance,
            decimals,
            setValue,
            setError,
            clearErrors,
            minDepositWei,
            t,
            token.symbol,
            votingEscrow.minDeposit,
        ],
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
        spender: plugin.votingEscrow?.escrowAddress as Hex,
        escrowContract: plugin.votingEscrow?.escrowAddress as Hex,
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
                    minDeposit: votingEscrow.minDeposit,
                    symbol: token.symbol,
                }),
            });
        } else {
            clearErrors('amount');
        }
    }, [lockAmountWei, minDepositWei, setError, clearErrors, t, token.symbol, votingEscrow.minDeposit]);

    const submitLabel = needsApproval ? 'approve' : 'lock';
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
