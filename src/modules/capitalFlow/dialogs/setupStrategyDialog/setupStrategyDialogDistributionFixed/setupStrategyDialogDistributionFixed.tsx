import { AssetInput } from '@/modules/finance/components/assetInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { Button, IconType, InputContainer } from '@aragon/gov-ui-kit';
import { useMemo } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import type { ISetupStrategyForm, ISetupStrategyFormRouter } from '../setupStrategyDialogDefinitions';
import { SetupStrategyDialogDistributionRecipientItem } from './setupStrategyDialogDistributionRecipientItem';

export interface ISetupStrategyDialogDistributionFixedProps {}

const maxRecipients = 15;

export const SetupStrategyDialogDistributionFixed: React.FC<ISetupStrategyDialogDistributionFixedProps> = (props) => {
    const { t } = useTranslations();

    const daoId = useWatch<ISetupStrategyForm, 'sourceVault'>({ name: 'sourceVault' });
    const { network, address } = daoUtils.parseDaoId(daoId);
    const recipientsFieldName = 'distributionFixed.recipients' as const;

    const { getValues } = useFormContext();
    const {
        fields: recipientsField,
        append: addRecipient,
        remove: removeRecipient,
        update: updateRecipient,
    } = useFieldArray<ISetupStrategyFormRouter, typeof recipientsFieldName>({
        name: recipientsFieldName,
    });

    const watchAsset = useWatch<ISetupStrategyForm>({ name: 'distributionFixed.asset' });

    const totalRatio = useMemo(
        () => recipientsField?.reduce((sum, recipient) => sum + (recipient?.ratio || 0), 0) || 0,
        [recipientsField],
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
                    {t('app.capitalFlow.setupStrategyDialog.distributionFixed.token.label')}
                </p>
                <p className="text-sm leading-normal font-normal text-neutral-500 md:text-base">
                    {t('app.capitalFlow.setupStrategyDialog.distributionFixed.token.helpText')}
                </p>
            </div>

            <AssetInput fetchAssetsParams={fetchAssetsParams} fieldPrefix="distributionFixed" hideAmount={true} />

            <div className="flex flex-col gap-4">
                <InputContainer
                    id="recipients"
                    label={t('app.capitalFlow.setupStrategyDialog.distributionFixed.recipients.label')}
                    helpText={t('app.capitalFlow.setupStrategyDialog.distributionFixed.recipients.helpText')}
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
                        {t('app.capitalFlow.setupStrategyDialog.distributionFixed.recipients.distributeEvenly')}
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
                    {t('app.capitalFlow.setupStrategyDialog.distributionFixed.recipients.addButton')}
                </Button>
            </div>
        </div>
    );
};
