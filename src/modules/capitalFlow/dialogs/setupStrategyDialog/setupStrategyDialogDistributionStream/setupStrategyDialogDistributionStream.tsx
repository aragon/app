import { AssetInput } from '@/modules/finance/components/assetInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { daoUtils } from '@/shared/utils/daoUtils';
import { RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { useWatch } from 'react-hook-form';
import type { ISetupStrategyForm, ISetupStrategyFormRouter } from '../setupStrategyDialogDefinitions';
import { StreamingEpochPeriod } from '../setupStrategyDialogDefinitions';
import { SetupStrategyDialogDistributionRecipients } from '../setupStrategyDialogDistributionRecipients';

export interface ISetupStrategyDialogDistributionStreamProps {}

export const SetupStrategyDialogDistributionStream: React.FC<ISetupStrategyDialogDistributionStreamProps> = (props) => {
    const { t } = useTranslations();

    const daoId = useWatch<ISetupStrategyForm, 'sourceVault'>({ name: 'sourceVault' });
    const { network, address } = daoUtils.parseDaoId(daoId);

    const epochPeriodField = useFormField<ISetupStrategyFormRouter, 'distributionStream.epochPeriod'>(
        'distributionStream.epochPeriod',
        {
            label: t('app.capitalFlow.setupStrategyDialog.distributionStream.epochPeriod.label'),
            defaultValue: StreamingEpochPeriod.HOUR,
        },
    );

    const fetchAssetsParams = { queryParams: { address, network } };

    return (
        <div className="flex w-full flex-col gap-6">
            <div className="flex flex-col gap-0.5 md:gap-1">
                <p className="text-base leading-tight font-normal text-neutral-800 md:text-lg">
                    {t('app.capitalFlow.setupStrategyDialog.distributionStream.token.label')}
                </p>
                <p className="text-sm leading-normal font-normal text-neutral-500 md:text-base">
                    {t('app.capitalFlow.setupStrategyDialog.distributionStream.token.helpText')}
                </p>
            </div>

            <AssetInput fetchAssetsParams={fetchAssetsParams} fieldPrefix="distributionStream" hideAmount={true} />

            <RadioGroup
                label={t('app.capitalFlow.setupStrategyDialog.distributionStream.epochPeriod.label')}
                helpText={t('app.capitalFlow.setupStrategyDialog.distributionStream.epochPeriod.helpText')}
                className="flex flex-col gap-3"
                onValueChange={epochPeriodField.onChange}
                {...epochPeriodField}
            >
                <RadioCard
                    className="w-full"
                    label={t('app.capitalFlow.setupStrategyDialog.distributionStream.epochPeriod.hour')}
                    description=""
                    value={StreamingEpochPeriod.HOUR}
                />
                <RadioCard
                    className="w-full"
                    label={t('app.capitalFlow.setupStrategyDialog.distributionStream.epochPeriod.day')}
                    description=""
                    value={StreamingEpochPeriod.DAY}
                />
                <RadioCard
                    className="w-full"
                    label={t('app.capitalFlow.setupStrategyDialog.distributionStream.epochPeriod.week')}
                    description=""
                    value={StreamingEpochPeriod.WEEK}
                />
            </RadioGroup>

            <SetupStrategyDialogDistributionRecipients
                recipientsFieldName="distributionStream.recipients"
                daoId={daoId}
            />
        </div>
    );
};
