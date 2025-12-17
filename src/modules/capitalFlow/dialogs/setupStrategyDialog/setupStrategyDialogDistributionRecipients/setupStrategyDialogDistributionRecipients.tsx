import { Button, IconType, InputContainer } from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { ISetupStrategyForm } from '../setupStrategyDialogDefinitions';
import { SetupStrategyDialogDistributionRecipientItem } from './setupStrategyDialogDistributionRecipientItem';

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

export const SetupStrategyDialogDistributionRecipients: React.FC<ISetupStrategyDialogDistributionRecipientsProps> = (props) => {
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
    }, [addRecipient, getValues, recipientsFieldName]);

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

        recipientsField.forEach((_recipient, index) => {
            const newRatio = index === 0 ? evenRatio + remainder : evenRatio;
            updateRecipient(index, {
                ...recipientsValues[index],
                ratio: newRatio,
            });
        });
    };

    const canAddMore = recipientsField.length < maxRecipients;
    const canRemove = recipientsField.length > 1;

    return (
        <div className="flex flex-col gap-4">
            <InputContainer
                alert={
                    totalRatio !== 100 && recipientsField.length > 0
                        ? {
                              message: `${totalRatio.toString()}%`,
                              variant: totalRatio > 100 ? 'critical' : 'warning',
                          }
                        : undefined
                }
                className="gap-3 md:gap-2"
                helpText={t('app.capitalFlow.setupStrategyDialog.distributionRecipients.helpText')}
                id="recipients"
                label={t('app.capitalFlow.setupStrategyDialog.distributionRecipients.label')}
                useCustomWrapper={true}
            >
                {recipientsField.map((field, index) => (
                    <SetupStrategyDialogDistributionRecipientItem
                        canRemove={canRemove}
                        daoId={daoId}
                        fieldPrefix={`${recipientsFieldName}.[${index.toString()}]`}
                        key={field.id}
                        onRemove={() => handleRemoveRecipient(index)}
                    />
                ))}
            </InputContainer>

            <div className="flex items-center justify-between">
                <span className="font-normal text-neutral-500 text-sm leading-tight">
                    {recipientsField.length}/{maxRecipients}
                </span>

                <Button disabled={recipientsField.length === 0} onClick={handleDistributeEvenly} size="sm" variant="tertiary">
                    {t('app.capitalFlow.setupStrategyDialog.distributionRecipients.distributeEvenly')}
                </Button>
            </div>

            <Button
                className="w-fit"
                disabled={!canAddMore}
                iconLeft={IconType.PLUS}
                onClick={handleAddRecipient}
                size="md"
                variant="tertiary"
            >
                {t('app.capitalFlow.setupStrategyDialog.distributionRecipients.addButton')}
            </Button>
        </div>
    );
};
