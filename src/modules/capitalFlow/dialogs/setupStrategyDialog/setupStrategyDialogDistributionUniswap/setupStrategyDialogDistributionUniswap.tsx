import { addressUtils, InputText } from '@aragon/gov-ui-kit';
import { useWatch } from 'react-hook-form';
import { AssetInput } from '@/modules/finance/components/assetInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import type { ISetupStrategyForm } from '../setupStrategyDialogDefinitions';

export const SetupStrategyDialogDistributionUniswap: React.FC = () => {
    const { t } = useTranslations();

    const daoId = useWatch<ISetupStrategyForm, 'sourceVault'>({
        name: 'sourceVault',
    });

    const fetchAssetsParams = { queryParams: { daoId } };

    const targetTokenAddressField = useFormField<ISetupStrategyForm, 'distributionUniswap.targetTokenAddress'>(
        'distributionUniswap.targetTokenAddress',
        {
            label: t('app.capitalFlow.setupStrategyDialog.distributionUniswap.targetTokenAddress.label'),
            rules: {
                required: true,
                validate: (value) => addressUtils.isAddress(value),
            },
        }
    );

    const uniswapRouterAddressField = useFormField<ISetupStrategyForm, 'distributionUniswap.uniswapRouterAddress'>(
        'distributionUniswap.uniswapRouterAddress',
        {
            label: t('app.capitalFlow.setupStrategyDialog.distributionUniswap.uniswapRouterAddress.label'),
            rules: {
                required: true,
                validate: (value) => addressUtils.isAddress(value),
            },
        }
    );

    return (
        <div className="flex w-full flex-col gap-6">
            <div className="flex flex-col gap-0.5 md:gap-1">
                <p className="font-normal text-base text-neutral-800 leading-tight md:text-lg">
                    {t('app.capitalFlow.setupStrategyDialog.distributionUniswap.token.label')}
                </p>
                <p className="font-normal text-neutral-500 text-sm leading-normal md:text-base">
                    {t('app.capitalFlow.setupStrategyDialog.distributionUniswap.token.helpText')}
                </p>
            </div>

            <AssetInput fetchAssetsParams={fetchAssetsParams} fieldPrefix="distributionUniswap" hideAmount={true} />

            <InputText
                helpText={t('app.capitalFlow.setupStrategyDialog.distributionUniswap.targetTokenAddress.helpText')}
                placeholder={t('app.capitalFlow.setupStrategyDialog.distributionUniswap.targetTokenAddress.placeholder')}
                {...targetTokenAddressField}
            />

            <InputText
                helpText={t('app.capitalFlow.setupStrategyDialog.distributionUniswap.uniswapRouterAddress.helpText')}
                placeholder={t('app.capitalFlow.setupStrategyDialog.distributionUniswap.uniswapRouterAddress.placeholder')}
                {...uniswapRouterAddressField}
            />
        </div>
    );
};
