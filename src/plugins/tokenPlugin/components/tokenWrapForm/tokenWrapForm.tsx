import { AssetInput, type IAssetInputFormData } from '@/modules/finance/components/assetInput';
import { useMember } from '@/modules/governance/api/governanceService';
import { useDao, type IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, formatterUtils, NumberFormat, Toggle, ToggleGroup } from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { erc20Abi, formatUnits, parseUnits, type Hex } from 'viem';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import type { ITokenMember, ITokenPluginSettings } from '../../types';
import { TokenWrapFormDialogApprove } from './tokenWrapFormDialogApprove';
import { TokenWrapFormDialogUnwrap } from './tokenWrapFormDialogUnwrap';
import { TokenWrapFormDialogWrap } from './tokenWrapFormDialogWrap';

export interface ITokenWrapFormProps {
    /**
     * DAO plugin for the token delegation.
     */
    plugin: IDaoPlugin<ITokenPluginSettings>;
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export interface ITokenWrapFormData extends IAssetInputFormData {}

const valuePercentages = ['0', '25', '50', '75', '100'];

export const TokenWrapForm: React.FC<ITokenWrapFormProps> = (props) => {
    const { plugin, daoId } = props;

    const { token } = plugin.settings;
    const { symbol, decimals } = token;
    const underlyingSymbol = symbol.substring(1);

    const { t } = useTranslations();
    const { address } = useAccount();
    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const queryClient = useQueryClient();

    const [percentageValue, setPercentageValue] = useState<string>('100');
    const [activeDialog, setActiveDialog] = useState<string | undefined>();

    const { data: tokenMember, refetch: refetchMember } = useMember<ITokenMember>(
        { urlParams: { address: address as string }, queryParams: { daoId, pluginAddress: plugin.address } },
        { enabled: address != null },
    );

    const { data: tokenAllowance, queryKey: allowanceQueryKey } = useReadContract({
        abi: erc20Abi,
        functionName: 'allowance',
        address: token.underlying as Hex,
        args: [address!, token.address as Hex],
        query: { enabled: address != null },
    });

    const underlyingAddress = (token.underlying ?? undefined) as Hex | undefined;
    const {
        data: unwrappedBalance,
        queryKey: unwrappedBalanceKey,
        status: unwrappedBalanceStatus,
    } = useBalance({ address, token: underlyingAddress });

    const parsedUnwrappedAmount = formatUnits(unwrappedBalance?.value ?? BigInt(0), decimals);

    const userAsset = useMemo(() => ({ token, amount: parsedUnwrappedAmount }), [token, parsedUnwrappedAmount]);
    const formValues = useForm<ITokenWrapFormData>({ mode: 'onSubmit', defaultValues: { asset: userAsset } });
    const { control, setValue, formState, handleSubmit } = formValues;

    const wrapAmount = useWatch<ITokenWrapFormData, 'amount'>({ control, name: 'amount' });
    const wrapAmountWei = parseUnits(wrapAmount ?? '0', token.decimals);

    const needsApproval = tokenAllowance == null || tokenAllowance < wrapAmountWei;

    const handleTransactionSuccess = () => {
        void queryClient.invalidateQueries({ queryKey: allowanceQueryKey });
        void queryClient.invalidateQueries({ queryKey: unwrappedBalanceKey });
        void refetchMember();
    };

    const handleFormSubmit = () => setActiveDialog(needsApproval ? 'approve' : 'wrap');

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

    const handlePercentageChange = (value = '') => {
        updateAmountField(value);
        setPercentageValue(value);
    };

    // Initialize amount field with 100% value
    useEffect(() => {
        if (wrapAmount == null && !formState.dirtyFields.amount) {
            updateAmountField('100');
        }
    }, [wrapAmount, formState, updateAmountField]);

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
    const disableSubmit = !unwrappedBalance || unwrappedBalance.value === BigInt(0);

    const dialogProps = {
        token,
        onOpenChange: () => setActiveDialog(undefined),
        network: dao!.network,
        onSuccess: handleTransactionSuccess,
    };

    return (
        <FormProvider {...formValues}>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit(handleFormSubmit)}>
                <p className="text-base font-normal leading-normal text-neutral-500">
                    {t('app.plugins.token.tokenWrapForm.info', { underlyingSymbol })}
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
                        className="justify-between !gap-x-0 gap-y-1"
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
                    <Button type="submit" variant="primary" size="lg" disabled={disableSubmit}>
                        {t(`app.plugins.token.tokenWrapForm.submit.${submitLabel}`, { underlyingSymbol })}
                    </Button>
                    {wrappedAmount > 0 && (
                        <Button variant="secondary" size="lg" onClick={() => setActiveDialog('unwrap')}>
                            {t('app.plugins.token.tokenWrapForm.submit.unwrap', {
                                amount: formattedWrappedAmount,
                                symbol,
                            })}
                        </Button>
                    )}
                    <p className="text-center text-sm font-normal leading-normal text-neutral-500">
                        {t('app.plugins.token.tokenWrapForm.footerInfo')}
                    </p>
                </div>
            </form>
            <TokenWrapFormDialogApprove
                open={activeDialog === 'approve'}
                onApproveSuccess={() => setActiveDialog('wrap')}
                amount={wrapAmount ?? '0'}
                {...dialogProps}
            />
            <TokenWrapFormDialogWrap open={activeDialog == 'wrap'} amount={wrapAmount ?? '0'} {...dialogProps} />
            <TokenWrapFormDialogUnwrap open={activeDialog == 'unwrap'} amount={wrappedAmount} {...dialogProps} />
        </FormProvider>
    );
};
