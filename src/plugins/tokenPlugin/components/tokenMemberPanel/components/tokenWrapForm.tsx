import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import type { IToken } from '@/modules/finance/api/financeService';
import { AssetInput, type IAssetInputFormData } from '@/modules/finance/components/assetInput';
import { useMember } from '@/modules/governance/api/governanceService';
import { TokenPluginDialogId } from '@/plugins/tokenPlugin/constants/tokenPluginDialogId';
import type { ITokenApproveTokensDialogParams } from '@/plugins/tokenPlugin/dialogs/tokenApproveTokensDialog';
import type { ITokenWrapUnwrapDialogParams } from '@/plugins/tokenPlugin/dialogs/tokenWrapUnwrapDialog';
import type { ITokenMember, ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import { useDao, type IDaoPlugin } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { Button, formatterUtils, NumberFormat, Toggle, ToggleGroup } from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { erc20Abi, formatUnits, parseUnits, type Hex } from 'viem';
import { useAccount, useBalance, useReadContract } from 'wagmi';

export interface ITokenWrapFormProps {
    /**
     * DAO plugin for the token delegation.
     */
    plugin: IDaoPlugin<ITokenPluginSettings>;
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Underlying token of the wrapper governance token.
     */
    underlyingToken: IToken;
}

export interface ITokenWrapFormData extends IAssetInputFormData {}

const valuePercentages = ['0', '25', '50', '75', '100'];

export const TokenWrapForm: React.FC<ITokenWrapFormProps> = (props) => {
    const { plugin, daoId, underlyingToken } = props;

    const { token } = plugin.settings;
    const { symbol, decimals } = token;
    const underlyingAddress = underlyingToken.address as Hex;

    const { open } = useDialogContext();
    const { t } = useTranslations();
    const { address } = useAccount();
    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const queryClient = useQueryClient();

    const [percentageValue, setPercentageValue] = useState<string>('100');

    const { result: isConnected, check: walletGuard } = useConnectedWalletGuard();

    const { data: tokenMember, refetch: refetchMember } = useMember<ITokenMember>(
        { urlParams: { address: address as string }, queryParams: { daoId, pluginAddress: plugin.address } },
        { enabled: address != null },
    );

    const { id: chainId } = networkDefinitions[dao!.network];
    const { data: tokenAllowance, queryKey: allowanceQueryKey } = useReadContract({
        abi: erc20Abi,
        functionName: 'allowance',
        address: underlyingAddress,
        args: [address!, token.address as Hex],
        query: { enabled: address != null },
        chainId,
    });

    const {
        data: unwrappedBalance,
        queryKey: unwrappedBalanceKey,
        status: unwrappedBalanceStatus,
    } = useBalance({ address, token: underlyingAddress, chainId });

    const parsedUnwrappedAmount = formatUnits(unwrappedBalance?.value ?? BigInt(0), decimals);

    const userAsset = useMemo(
        () => ({ token: underlyingToken, amount: parsedUnwrappedAmount }),
        [underlyingToken, parsedUnwrappedAmount],
    );

    const formValues = useForm<ITokenWrapFormData>({ mode: 'onSubmit', defaultValues: { asset: userAsset } });
    const { control, setValue, handleSubmit } = formValues;

    const wrapAmount = useWatch<ITokenWrapFormData, 'amount'>({ control, name: 'amount' });
    const wrapAmountWei = parseUnits(wrapAmount ?? '0', token.decimals);

    const needsApproval = isConnected && (tokenAllowance == null || tokenAllowance < wrapAmountWei);

    const handleTransactionSuccess = () => {
        void queryClient.invalidateQueries({ queryKey: allowanceQueryKey });
        void queryClient.invalidateQueries({ queryKey: unwrappedBalanceKey });
        void refetchMember();
    };

    const handleFormSubmit = () => {
        const dialogType = needsApproval ? 'approve' : 'wrap';
        const dialogProps = getDialogProps(wrapAmountWei);

        if (dialogType === 'approve') {
            const params: ITokenApproveTokensDialogParams = {
                ...dialogProps,
                onApproveSuccess: () => handleApproveSuccess(dialogProps), // open wrap dialog with the same params!
            };
            open(TokenPluginDialogId.APPROVE_TOKENS, { params });
        } else {
            const params: ITokenWrapUnwrapDialogParams = { ...dialogProps, action: 'wrap' };
            open(TokenPluginDialogId.WRAP_UNWRAP, { params });
        }
    };

    const updateAmountField = useCallback(
        (value?: string) => {
            if (unwrappedBalance == null || value == null) {
                return;
            }

            const processedValue = (unwrappedBalance.value * BigInt(value)) / BigInt(100);
            const parsedValue = formatUnits(processedValue, decimals);
            setValue('amount', parsedValue);
        },
        [unwrappedBalance, decimals, setValue],
    );

    const handlePercentageChange = useCallback(
        (value = '') => {
            updateAmountField(value);
            setPercentageValue(value);
        },
        [updateAmountField],
    );

    const handleUnwrapToken = () => {
        const params: ITokenWrapUnwrapDialogParams = { ...getDialogProps(wrappedAmount), action: 'unwrap' };
        open(TokenPluginDialogId.WRAP_UNWRAP, { params });
    };

    const handleApproveSuccess = (dialogProps: ReturnType<typeof getDialogProps>) => {
        const params: ITokenWrapUnwrapDialogParams = { ...dialogProps, action: 'wrap' };
        open(TokenPluginDialogId.WRAP_UNWRAP, { params });
    };

    const getDialogProps = (confirmAmount: bigint) => ({
        token,
        underlyingToken,
        amount: confirmAmount,
        network: dao!.network,
        onSuccess: handleTransactionSuccess,
    });

    // Update amount field and percentage value to 100% of user unwrapped balance on user balance change
    useEffect(() => handlePercentageChange('100'), [handlePercentageChange]);

    // Initialize asset field after fetching unwrapped balance
    useEffect(() => {
        if (unwrappedBalanceStatus === 'success') {
            setValue('asset', userAsset);
        }
    }, [setValue, unwrappedBalanceStatus, userAsset]);

    const wrappedAmount = BigInt(tokenMember?.tokenBalance ?? '0');
    const parsedWrappedAmount = formatUnits(wrappedAmount, decimals);

    const formattedWrappedAmount = formatterUtils.formatNumber(parsedWrappedAmount, {
        format: NumberFormat.TOKEN_AMOUNT_SHORT,
    });

    const submitLabel = needsApproval ? 'approve' : 'wrap';
    const disableSubmit = unwrappedBalance?.value === BigInt(0);

    return (
        <FormProvider {...formValues}>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit(handleFormSubmit)}>
                <p className="text-base leading-normal font-normal text-neutral-500">
                    {t('app.plugins.token.tokenWrapForm.info', { underlyingSymbol: underlyingToken.symbol })}
                </p>
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
                                label={t(`app.plugins.token.tokenWrapForm.percentage.${value}`)}
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
                        {t(`app.plugins.token.tokenWrapForm.submit.${submitLabel}`, {
                            underlyingSymbol: underlyingToken.symbol,
                        })}
                    </Button>
                    {wrappedAmount > 0 && (
                        <Button variant="secondary" size="lg" onClick={handleUnwrapToken}>
                            {t('app.plugins.token.tokenWrapForm.submit.unwrap', {
                                amount: formattedWrappedAmount,
                                symbol,
                            })}
                        </Button>
                    )}
                    <p className="text-center text-sm leading-normal font-normal text-neutral-500">
                        {t('app.plugins.token.tokenWrapForm.footerInfo')}
                    </p>
                </div>
            </form>
        </FormProvider>
    );
};
