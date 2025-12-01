import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, IconType, InputContainer } from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import type { ISetupStrategyForm } from '../setupStrategyDialogDefinitions';
import { SetupStrategyDialogDistributionRecipientItem } from '../setupStrategyDialogDistributionFixed';

export interface ISetupStrategyDialogDistributionRecipientsProps {
    /**
     * Field name for the recipients array in the form (e.g., 'distributionFixed.recipients').
     */
    recipientsFieldName: 'distributionFixed.recipients' | 'distributionStream.recipients';
    /**
     * ID of the DAO for network context.
     */
    daoId?: string;
}

const maxRecipients = 15;

export const SetupStrategyDialogDistributionRecipients: React.FC<ISetupStrategyDialogDistributionRecipientsProps> = (
    props,
) => {
    const { recipientsFieldName, daoId } = props;

    const { t } = useTranslations();

    const { getValues } = useFormContext<ISetupStrategyForm>();
    const {
        fields: recipientsField,
        append: addRecipient,
        remove: removeRecipient,
        update: updateRecipient,
    } = useFieldArray({
        name: recipientsFieldName,
        rules: {
            required: true,
            minLength: 1,
        },
    });

    const recipients = useWatch<ISetupStrategyForm, typeof recipientsFieldName>({
        name: recipientsFieldName,
        defaultValue: [],
    });

    useEffect(() => {
        // get fresh values
        const recipientsValues = getValues(recipientsFieldName);

        if (recipientsValues.length === 0) {
            addRecipient({ address: '', ratio: 0 });
        }
    }, [addRecipient, recipients]);

    const totalRatio = recipients.reduce((sum, recipient) => sum + recipient.ratio, 0);

    const handleAddRecipient = () => {
        if (recipientsField.length < maxRecipients) {
            addRecipient({ address: '', ratio: 0 });
        }
    };

    const handleRemoveRecipient = (index: number) => {
        if (recipientsField.length > 1) {
            removeRecipient(index);
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
    const canRemove = recipientsField.length > 1;

    return (
        <div className="flex flex-col gap-4">
            <InputContainer
                id="recipients"
                label={t('app.capitalFlow.setupStrategyDialog.distributionRecipients.label')}
                helpText={t('app.capitalFlow.setupStrategyDialog.distributionRecipients.helpText')}
                useCustomWrapper={true}
                className="gap-3 md:gap-2"
                alert={
                    totalRatio !== 100 && recipientsField.length > 0
                        ? {
                              message: `${totalRatio}%`,
                              variant: totalRatio > 100 ? 'critical' : 'warning',
                          }
                        : undefined
                }
            >
                {recipientsField.map((field, index) => (
                    <SetupStrategyDialogDistributionRecipientItem
                        key={field.id}
                        fieldPrefix={`${recipientsFieldName}.[${index}]`}
                        totalRatio={totalRatio}
                        onRemove={() => handleRemoveRecipient(index)}
                        canRemove={canRemove}
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
                    {t('app.capitalFlow.setupStrategyDialog.distributionRecipients.distributeEvenly')}
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
                {t('app.capitalFlow.setupStrategyDialog.distributionRecipients.addButton')}
            </Button>
        </div>
    );
};
