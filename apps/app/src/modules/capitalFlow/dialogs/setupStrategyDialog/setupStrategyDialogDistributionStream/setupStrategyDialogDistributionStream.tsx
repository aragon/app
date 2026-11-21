import { RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { useWatch } from 'react-hook-form';
import { AssetInput } from '@/modules/finance/components/assetInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import type {
    ISetupStrategyForm,
    ISetupStrategyFormRouter,
} from '../setupStrategyDialogDefinitions';
import { StreamingEpochPeriod } from '../setupStrategyDialogDefinitions';
import { SetupStrategyDialogDistributionRecipients } from '../setupStrategyDialogDistributionRecipients';

export interface ISetupStrategyDialogDistributionStreamProps {}

export const SetupStrategyDialogDistributionStream: React.FC<
    ISetupStrategyDialogDistributionStreamProps
> = () => {
    const { t } = useTranslations();

    const daoId = useWatch<ISetupStrategyForm, 'sourceVault'>({
        name: 'sourceVault',
    });

    const epochPeriodField = useFormField<
        ISetupStrategyFormRouter,
        'distributionStream.epochPeriod'
    >('distributionStream.epochPeriod', {
        label: t(
            'app.capitalFlow.setupStrategyDialog.distributionStream.epochPeriod.label',
        ),
        defaultValue: StreamingEpochPeriod.HOUR,
    });

    const fetchAssetsParams = { queryParams: { daoId } };

    return (
        <div className="flex w-full flex-col gap-section">
            <div className="flex flex-col gap-tight--2-4">
                <p className="text-base leading-tight font-normal text-neutral-800 md:text-lg">
                    {t(
                        'app.capitalFlow.setupStrategyDialog.distributionStream.token.label',
                    )}
                </p>
                <p className="text-sm leading-normal font-normal text-neutral-500 md:text-base">
                    {t(
                        'app.capitalFlow.setupStrategyDialog.distributionStream.token.helpText',
                    )}
                </p>
            </div>

            <AssetInput
                disableMaxValidation={true}
                fetchAssetsParams={fetchAssetsParams}
                fieldPrefix="distributionStream"
                hideAmount={true}
            />

            <RadioGroup
                className="flex flex-col gap-related"
                helpText={t(
                    'app.capitalFlow.setupStrategyDialog.distributionStream.epochPeriod.helpText',
                )}
                label={t(
                    'app.capitalFlow.setupStrategyDialog.distributionStream.epochPeriod.label',
                )}
                onValueChange={epochPeriodField.onChange}
                {...epochPeriodField}
            >
                <RadioCard
                    className="w-full"
                    description=""
                    label={t(
                        'app.capitalFlow.setupStrategyDialog.distributionStream.epochPeriod.hour',
                    )}
                    value={StreamingEpochPeriod.HOUR}
                />
                <RadioCard
                    className="w-full"
                    description=""
                    label={t(
                        'app.capitalFlow.setupStrategyDialog.distributionStream.epochPeriod.day',
                    )}
                    value={StreamingEpochPeriod.DAY}
                />
                <RadioCard
                    className="w-full"
                    description=""
                    label={t(
                        'app.capitalFlow.setupStrategyDialog.distributionStream.epochPeriod.week',
                    )}
                    value={StreamingEpochPeriod.WEEK}
                />
            </RadioGroup>

            <SetupStrategyDialogDistributionRecipients
                daoId={daoId}
                recipientsFieldName="distributionStream.recipients"
            />
        </div>
    );
};
