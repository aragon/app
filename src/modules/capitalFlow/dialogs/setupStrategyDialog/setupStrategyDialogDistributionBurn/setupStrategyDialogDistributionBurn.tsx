import { useWatch } from 'react-hook-form';
import { AssetInput } from '@/modules/finance/components/assetInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { ISetupStrategyForm } from '../setupStrategyDialogDefinitions';

export interface ISetupStrategyDialogDistributionBurnProps {}

export const SetupStrategyDialogDistributionBurn: React.FC<
    ISetupStrategyDialogDistributionBurnProps
> = () => {
    const { t } = useTranslations();

    const daoId = useWatch<ISetupStrategyForm, 'sourceVault'>({
        name: 'sourceVault',
    });

    const fetchAssetsParams = { queryParams: { daoId } };

    return (
        <div className="flex w-full flex-col gap-6">
            <div className="flex flex-col gap-0.5 md:gap-1">
                <p className="font-normal text-base text-neutral-800 leading-tight md:text-lg">
                    {t(
                        'app.capitalFlow.setupStrategyDialog.distributionBurn.token.label',
                    )}
                </p>
                <p className="font-normal text-neutral-500 text-sm leading-normal md:text-base">
                    {t(
                        'app.capitalFlow.setupStrategyDialog.distributionBurn.token.helpText',
                    )}
                </p>
            </div>

            <AssetInput
                fetchAssetsParams={fetchAssetsParams}
                fieldPrefix="distributionBurn"
                hideAmount={true}
            />
        </div>
    );
};
