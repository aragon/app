import { addressUtils, InputText } from '@aragon/gov-ui-kit';
import { useWatch } from 'react-hook-form';
import { AssetInput } from '@/modules/finance/components/assetInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import type { ISetupStrategyForm } from '../setupStrategyDialogDefinitions';

export interface ISetupStrategyDialogDistributionDexSwapProps {}

export const SetupStrategyDialogDistributionDexSwap: React.FC<ISetupStrategyDialogDistributionDexSwapProps> = () => {
    const { t } = useTranslations();

    const daoId = useWatch<ISetupStrategyForm, 'sourceVault'>({ name: 'sourceVault' });

    const fetchAssetsParams = { queryParams: { daoId } };

    const targetTokenAddressField = useFormField<ISetupStrategyForm, 'distributionDexSwap.targetTokenAddress'>(
        'distributionDexSwap.targetTokenAddress',
        {
            label: t('app.capitalFlow.setupStrategyDialog.distributionDexSwap.targetTokenAddress.label'),
            rules: { required: true, validate: (value) => addressUtils.isAddress(value) },
        }
    );

    const cowSwapSettlementAddressField = useFormField<ISetupStrategyForm, 'distributionDexSwap.cowSwapSettlementAddress'>(
        'distributionDexSwap.cowSwapSettlementAddress',
        {
            label: t('app.capitalFlow.setupStrategyDialog.distributionDexSwap.cowSwapSettlementAddress.label'),
            rules: { required: true, validate: (value) => addressUtils.isAddress(value) },
        }
    );

    return (
        <div className="flex w-full flex-col gap-6">
            <div className="flex flex-col gap-0.5 md:gap-1">
                <p className="font-normal text-base text-neutral-800 leading-tight md:text-lg">
                    {t('app.capitalFlow.setupStrategyDialog.distributionDexSwap.token.label')}
                </p>
                <p className="font-normal text-neutral-500 text-sm leading-normal md:text-base">
                    {t('app.capitalFlow.setupStrategyDialog.distributionDexSwap.token.helpText')}
                </p>
            </div>

            <AssetInput fetchAssetsParams={fetchAssetsParams} fieldPrefix="distributionDexSwap" hideAmount={true} />

            <InputText
                helpText={t('app.capitalFlow.setupStrategyDialog.distributionDexSwap.targetTokenAddress.helpText')}
                placeholder={t('app.capitalFlow.setupStrategyDialog.distributionDexSwap.targetTokenAddress.placeholder')}
                {...targetTokenAddressField}
            />

            <InputText
                helpText={t('app.capitalFlow.setupStrategyDialog.distributionDexSwap.cowSwapSettlementAddress.helpText')}
                placeholder={t('app.capitalFlow.setupStrategyDialog.distributionDexSwap.cowSwapSettlementAddress.placeholder')}
                {...cowSwapSettlementAddressField}
            />
        </div>
    );
};
