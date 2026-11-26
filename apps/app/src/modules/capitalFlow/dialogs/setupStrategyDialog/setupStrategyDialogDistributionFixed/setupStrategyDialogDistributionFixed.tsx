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
                <p className="type-title-item text-surface-primary">
                    {t(
                        'app.capitalFlow.setupStrategyDialog.distributionFixed.token.label',
                    )}
                </p>
                <p className="type-body-compact text-surface-secondary">
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
