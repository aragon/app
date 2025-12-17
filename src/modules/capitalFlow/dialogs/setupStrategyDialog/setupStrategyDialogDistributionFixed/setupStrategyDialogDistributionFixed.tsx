import { useWatch } from 'react-hook-form';
import { AssetInput } from '@/modules/finance/components/assetInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { ISetupStrategyForm } from '../setupStrategyDialogDefinitions';
import { SetupStrategyDialogDistributionRecipients } from '../setupStrategyDialogDistributionRecipients';

export const SetupStrategyDialogDistributionFixed: React.FC = () => {
    const { t } = useTranslations();

    const daoId = useWatch<ISetupStrategyForm, 'sourceVault'>({
        name: 'sourceVault',
    });

    const fetchAssetsParams = { queryParams: { daoId } };

    return (
        <div className="flex w-full flex-col gap-6">
            <div className="flex flex-col gap-0.5 md:gap-1">
                <p className="font-normal text-base text-neutral-800 leading-tight md:text-lg">
                    {t('app.capitalFlow.setupStrategyDialog.distributionFixed.token.label')}
                </p>
                <p className="font-normal text-neutral-500 text-sm leading-normal md:text-base">
                    {t('app.capitalFlow.setupStrategyDialog.distributionFixed.token.helpText')}
                </p>
            </div>

            <AssetInput fetchAssetsParams={fetchAssetsParams} fieldPrefix="distributionFixed" hideAmount={true} />

            <SetupStrategyDialogDistributionRecipients daoId={daoId} recipientsFieldName="distributionFixed.recipients" />
        </div>
    );
};
