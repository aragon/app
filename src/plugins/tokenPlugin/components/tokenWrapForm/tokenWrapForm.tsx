import { AssetInput, type IAssetInputFormData } from '@/modules/finance/components/assetInput';
import { useMember } from '@/modules/governance/api/governanceService';
import { useDao, type IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, formatterUtils, NumberFormat, Toggle, ToggleGroup } from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { formatUnits, type Hex } from 'viem';
import { useAccount, useBalance } from 'wagmi';
import type { ITokenMember, ITokenPluginSettings } from '../../types';
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

    const [percentageValue, setPercentageValue] = useState<string | undefined>('100');
    const [activeDialog, setActiveDialog] = useState<string | undefined>();

    const { data: tokenMember, refetch: refetchMember } = useMember<ITokenMember>(
        { urlParams: { address: address as string }, queryParams: { daoId, pluginAddress: plugin.address } },
        { enabled: address != null },
    );

    const underlyingAddress = (token.underlying ?? undefined) as Hex | undefined;
    const { data: unwrappedBalance, queryKey: unwrappedBalanceKey } = useBalance({ address, token: underlyingAddress });

    const parsedUnwrappedAmount = formatUnits(unwrappedBalance?.value ?? BigInt(0), decimals);

    const userAsset = { token, amount: parsedUnwrappedAmount };
    const { control, setValue, handleSubmit, ...formValues } = useForm<ITokenWrapFormData>({
        mode: 'onTouched',
        values: { asset: userAsset },
    });

    const wrapAmount = useWatch<ITokenWrapFormData, 'amount'>({ control, name: 'amount' });

    const handleTransactionSuccess = () => {
        void queryClient.invalidateQueries({ queryKey: [unwrappedBalanceKey] });
        void refetchMember();
    };

    // Update the amount field when the percentage value or the unwrapped balance of the user change
    useEffect(() => {
        if (unwrappedBalance == null || !percentageValue) {
            return;
        }

        const processedValue = (unwrappedBalance.value * BigInt(percentageValue)) / BigInt(100);
        const parsedValue = formatUnits(processedValue, decimals);
        setValue('amount', parsedValue);
    }, [percentageValue, unwrappedBalance, setValue, decimals]);

    const wrappedAmount = BigInt(tokenMember?.tokenBalance ?? '0');
    const parsedWrappedAmount = formatUnits(wrappedAmount, decimals);

    const formattedWrappedAmount = formatterUtils.formatNumber(parsedWrappedAmount, {
        format: NumberFormat.TOKEN_AMOUNT_SHORT,
    });

    const disableWrapButton = !unwrappedBalance || unwrappedBalance.value === BigInt(0);

    return (
        <FormProvider control={control} setValue={setValue} handleSubmit={handleSubmit} {...formValues}>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit(() => setActiveDialog('wrap'))}>
                <p className="text-base font-normal leading-normal text-neutral-500">
                    {t('app.plugins.token.tokenWrapForm.info', { underlyingSymbol })}
                </p>
                <div className="flex flex-col gap-3">
                    <AssetInput disableAssetField={true} hideMax={true} hideAmountLabel={true} />
                    <ToggleGroup
                        isMultiSelect={false}
                        value={percentageValue}
                        onChange={setPercentageValue}
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
                    <Button type="submit" variant="primary" size="lg" disabled={disableWrapButton}>
                        {t('app.plugins.token.tokenWrapForm.submit.wrap', { underlyingSymbol })}
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
            {/* Only render the wrap dialog when active to avoid running its allowance logic when not open and reset
            the transaction stepper mutations after a successful approve transaction */}
            {activeDialog === 'wrap' && (
                <TokenWrapFormDialogWrap
                    open={true}
                    onOpenChange={() => setActiveDialog(undefined)}
                    onApproveSuccess={() => setActiveDialog('wrap')}
                    token={token}
                    amount={wrapAmount ?? '0'}
                    network={dao!.network}
                    onSuccess={handleTransactionSuccess}
                />
            )}
            <TokenWrapFormDialogUnwrap
                open={activeDialog == 'unwrap'}
                onOpenChange={() => setActiveDialog(undefined)}
                token={token}
                amount={wrappedAmount}
                network={dao!.network}
                onSuccess={handleTransactionSuccess}
            />
        </FormProvider>
    );
};
