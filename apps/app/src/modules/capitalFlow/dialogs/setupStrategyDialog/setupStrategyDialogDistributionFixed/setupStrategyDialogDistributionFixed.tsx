import { useWatch } from 'react-hook-form';
import { AssetInput } from '@/modules/finance/components/assetInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { ISetupStrategyForm } from '../setupStrategyDialogDefinitions';
import { SetupStrategyDialogDistributionRecipients } from '../setupStrategyDialogDistributionRecipients';

export interface ISetupStrategyDialogDistributionFixedProps {}

export const SetupStrategyDialogDistributionFixed: React.FC<
    ISetupStrategyDialogDistributionFixedProps
> = () => {
    const { t } = useTranslations();

    const daoId = useWatch<ISetupStrategyForm, 'sourceVault'>({
        name: 'sourceVault',
    });

    const fetchAssetsParams = { queryParams: { daoId } };

    return (
        <div className="flex w-full flex-col gap-section">
            <div className="flex flex-col gap-tight--2-4">
                <p className="text-base leading-tight font-normal text-neutral-800 md:text-lg">
                    {t(
                        'app.capitalFlow.setupStrategyDialog.distributionFixed.token.label',
                    )}
                </p>
                <p className="text-sm leading-normal font-normal text-neutral-500 md:text-base">
                    {t(
                        'app.capitalFlow.setupStrategyDialog.distributionFixed.token.helpText',
                    )}
                </p>
            </div>

            <AssetInput
                disableMaxValidation={true}
                fetchAssetsParams={fetchAssetsParams}
                fieldPrefix="distributionFixed"
                hideAmount={true}
            />

            <SetupStrategyDialogDistributionRecipients
                daoId={daoId}
                recipientsFieldName="distributionFixed.recipients"
            />
        </div>
    );
};
