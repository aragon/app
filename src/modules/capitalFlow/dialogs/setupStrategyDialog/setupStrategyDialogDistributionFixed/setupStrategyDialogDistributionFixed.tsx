import { AssetInput } from '@/modules/finance/components/assetInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { useWatch } from 'react-hook-form';
import type { ISetupStrategyForm } from '../setupStrategyDialogDefinitions';
import { SetupStrategyDialogDistributionRecipients } from '../setupStrategyDialogDistributionRecipients';

export interface ISetupStrategyDialogDistributionFixedProps {}

export const SetupStrategyDialogDistributionFixed: React.FC<ISetupStrategyDialogDistributionFixedProps> = (props) => {
    const { t } = useTranslations();

    const daoId = useWatch<ISetupStrategyForm, 'sourceVault'>({ name: 'sourceVault' });
    const { network, address } = daoUtils.parseDaoId(daoId);

    const fetchAssetsParams = { queryParams: { address, network } };

    return (
        <div className="flex w-full flex-col gap-6">
            <div className="flex flex-col gap-0.5 md:gap-1">
                <p className="text-base leading-tight font-normal text-neutral-800 md:text-lg">
                    {t('app.capitalFlow.setupStrategyDialog.distributionFixed.token.label')}
                </p>
                <p className="text-sm leading-normal font-normal text-neutral-500 md:text-base">
                    {t('app.capitalFlow.setupStrategyDialog.distributionFixed.token.helpText')}
                </p>
            </div>

            <AssetInput fetchAssetsParams={fetchAssetsParams} fieldPrefix="distributionFixed" hideAmount={true} />

            <SetupStrategyDialogDistributionRecipients
                recipientsFieldName="distributionFixed.recipients"
                daoId={daoId}
            />
        </div>
    );
};
