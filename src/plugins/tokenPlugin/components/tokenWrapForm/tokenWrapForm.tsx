import { AssetInput } from '@/modules/finance/components/assetInput';
import { useMember } from '@/modules/governance/api/governanceService';
import { type IDaoPlugin, Network } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, formatterUtils, NumberFormat, Toggle, ToggleGroup } from '@aragon/gov-ui-kit';
import { FormProvider, useForm } from 'react-hook-form';
import { formatUnits } from 'viem';
import { useAccount } from 'wagmi';
import type { ITokenMember, ITokenPluginSettings } from '../../types';

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

export interface ITokenWrapFormData {}

const valuePercentages = [
    { value: '0', label: 'None' },
    { value: '0.25', label: '25%' },
    { value: '0.50', label: '50%' },
    { value: '0.75', label: '75%' },
    { value: '1', label: '100%' },
];

export const TokenWrapForm: React.FC<ITokenWrapFormProps> = (props) => {
    const { plugin, daoId } = props;

    const { token } = plugin.settings;
    const { symbol, decimals } = token;
    const underlyingSymbol = symbol.substring(1);

    const { t } = useTranslations();
    const { address } = useAccount();
    const formValues = useForm<ITokenWrapFormData>({ mode: 'onTouched' });

    const { data: tokenMember } = useMember<ITokenMember>(
        { urlParams: { address: address as string }, queryParams: { daoId, pluginAddress: plugin.address } },
        { enabled: address != null },
    );

    const wrappedAmount = BigInt(tokenMember?.tokenBalance ?? '0');
    const parsedWrappedAmount = formatUnits(wrappedAmount, decimals);
    const formattedWrappedAmount = formatterUtils.formatNumber(parsedWrappedAmount, {
        format: NumberFormat.TOKEN_AMOUNT_SHORT,
    });

    return (
        <FormProvider {...formValues}>
            <div className="flex flex-col gap-4">
                <p className="text-base font-normal leading-normal text-neutral-500">
                    {t('app.plugins.token.tokenWrapForm.info', { underlyingSymbol })}
                </p>
                <div className="flex flex-col gap-3">
                    <AssetInput sender="0x123" network={Network.ETHEREUM_MAINNET} />
                    <ToggleGroup isMultiSelect={false} className="justify-between !gap-x-0 gap-y-1">
                        {valuePercentages.map(({ value, label }) => (
                            <Toggle key={value} value={value} label={label} />
                        ))}
                    </ToggleGroup>
                </div>
                <div className="flex flex-col gap-3">
                    <Button type="submit" variant="primary" size="lg">
                        {t('app.plugins.token.tokenWrapForm.submit.wrap', { underlyingSymbol })}
                    </Button>
                    {wrappedAmount > 0 && (
                        <Button variant="secondary" size="lg">
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
            </div>
        </FormProvider>
    );
};
