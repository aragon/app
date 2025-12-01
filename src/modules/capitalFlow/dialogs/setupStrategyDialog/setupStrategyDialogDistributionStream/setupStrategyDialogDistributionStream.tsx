import { AssetInput } from '@/modules/finance/components/assetInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { daoUtils } from '@/shared/utils/daoUtils';
import { Button, IconType, InputContainer, RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { useMemo } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import type { ISetupStrategyForm, ISetupStrategyFormRouter } from '../setupStrategyDialogDefinitions';
import { StreamingEpochPeriod } from '../setupStrategyDialogDefinitions';
import { SetupStrategyDialogDistributionRecipientItem } from '../setupStrategyDialogDistributionFixed';

export interface ISetupStrategyDialogDistributionStreamProps {}

const maxRecipients = 15;

export const SetupStrategyDialogDistributionStream: React.FC<ISetupStrategyDialogDistributionStreamProps> = (props) => {
    const { t } = useTranslations();

    const daoId = useWatch<ISetupStrategyForm, 'sourceVault'>({ name: 'sourceVault' });
    const { network, address } = daoUtils.parseDaoId(daoId);
    const recipientsFieldName = 'distributionStream.recipients' as const;

    const { getValues } = useFormContext();
    const {
        fields: recipientsField,
        append: addRecipient,
        remove: removeRecipient,
        update: updateRecipient,
    } = useFieldArray<ISetupStrategyFormRouter, typeof recipientsFieldName>({
        name: recipientsFieldName,
    });

    const watchAsset = useWatch<ISetupStrategyForm, 'distributionStream.asset'>({ name: 'distributionStream.asset' });

    const totalRatio = useMemo(
        () => recipientsField?.reduce((sum, recipient) => sum + (recipient?.ratio || 0), 0) || 0,
        [recipientsField],
    );

    const epochPeriodField = useFormField<ISetupStrategyFormRouter, 'distributionStream.epochPeriod'>(
        'distributionStream.epochPeriod',
        {
            label: t('app.capitalFlow.setupStrategyDialog.distributionStream.epochPeriod.label'),
            defaultValue: StreamingEpochPeriod.HOUR,
        },
    );

    const fetchAssetsParams = { queryParams: { address, network } };

    const handleAddRecipient = () => {
        if (recipientsField.length < maxRecipients) {
            addRecipient({ address: '', ratio: 0 });
        }
    };

    const handleDistributeEvenly = () => {
        const evenRatio = Math.floor(100 / recipientsField.length);
        const remainder = 100 - evenRatio * recipientsField.length;
        // We need to use getValues() here because 'address' changes from nested component are not reflected in recipientsField until rerender
        const recipientsValues = getValues(recipientsFieldName);

        recipientsField.forEach((recipient, index) => {
            const newRatio = index === 0 ? evenRatio + remainder : evenRatio;
            updateRecipient(index, { ...recipientsValues[index], ratio: newRatio });
        });
    };

    const canAddMore = recipientsField.length < maxRecipients;

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

            <div className="flex flex-col gap-4">
                <InputContainer
                    id="recipients"
                    label={t('app.capitalFlow.setupStrategyDialog.distributionStream.recipients.label')}
                    helpText={t('app.capitalFlow.setupStrategyDialog.distributionStream.recipients.helpText')}
                    useCustomWrapper={true}
                    className="gap-3 md:gap-2"
                >
                    {recipientsField.map((field, index) => (
                        <SetupStrategyDialogDistributionRecipientItem
                            key={field.id}
                            fieldPrefix={`${recipientsFieldName}.[${index}]`}
                            totalRatio={totalRatio}
                            onRemove={() => removeRecipient(index)}
                            canRemove={recipientsField.length > 1}
                            daoId={daoId}
                        />
                    ))}
                </InputContainer>

                <div className="flex items-center justify-between">
                    <span className="text-sm leading-tight font-normal text-neutral-500">
                        {recipientsField.length}/{maxRecipients}
                    </span>

                    <Button
                        variant="tertiary"
                        size="sm"
                        onClick={handleDistributeEvenly}
                        disabled={recipientsField.length === 0}
                    >
                        {t('app.capitalFlow.setupStrategyDialog.distributionStream.recipients.distributeEvenly')}
                    </Button>
                </div>

                <Button
                    size="md"
                    variant="tertiary"
                    className="w-fit"
                    iconLeft={IconType.PLUS}
                    onClick={handleAddRecipient}
                    disabled={!canAddMore}
                >
                    {t('app.capitalFlow.setupStrategyDialog.distributionStream.recipients.addButton')}
                </Button>
            </div>
        </div>
    );
};
