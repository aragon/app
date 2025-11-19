import { AssetInput } from '@/modules/finance/components/assetInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { Button, IconType, InputContainer } from '@aragon/gov-ui-kit';
import { useMemo } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import type { ISetupStrategyForm } from '../setupStrategyDialogDefinitions';
import { SetupStrategyDialogDistributionRecipientItem } from './setupStrategyDialogDistributionRecipientItem';

export interface ISetupStrategyDialogDistributionProps {}

const MAX_RECIPIENTS = 15;

export const SetupStrategyDialogDistribution: React.FC<ISetupStrategyDialogDistributionProps> = (props) => {
    const { t } = useTranslations();

    const daoId = useWatch<ISetupStrategyForm, 'sourceVault'>({ name: 'sourceVault' });
    console.log('daoId', daoId);
    const { network, address } = daoUtils.parseDaoId(daoId ?? '');

    const {
        fields: recipients,
        append: addRecipient,
        remove: removeRecipient,
    } = useFieldArray<ISetupStrategyForm, 'distribution.recipients'>({
        name: 'distribution.recipients',
    });

    const watchRecipients = useWatch<ISetupStrategyForm, 'distribution.recipients'>({
        name: 'distribution.recipients',
    });

    const watchAsset = useWatch<ISetupStrategyForm>({ name: 'distribution.asset' });

    const totalRatio = useMemo(
        () => watchRecipients?.reduce((sum, recipient) => sum + (recipient?.ratio || 0), 0) || 0,
        [watchRecipients],
    );

    const fetchAssetsParams = { queryParams: { address, network } };

    const handleAddRecipient = () => {
        if (recipients.length < MAX_RECIPIENTS) {
            addRecipient({ address: '', ratio: 0 });
        }
    };

    const handleDistributeEvenly = () => {
        const evenRatio = Math.floor(100 / recipients.length);
        const remainder = 100 - evenRatio * recipients.length;

        // We can't use update from useFieldArray as it doesn't properly trigger validation
        // So we need to manipulate through form setValue which is handled in the item component
        watchRecipients?.forEach((_, index) => {
            const newRatio = index === 0 ? evenRatio + remainder : evenRatio;
            // This will be handled by each item's internal state management
            watchRecipients[index] = { ...watchRecipients[index], ratio: newRatio };
        });
    };

    const canAddMore = recipients.length < MAX_RECIPIENTS;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h3 className="text-lg leading-tight font-normal text-neutral-800">
                    {t('app.capitalFlow.setupStrategyDialog.distribution.label')}
                </h3>
                <p className="text-base leading-normal font-normal text-neutral-500">
                    {t('app.capitalFlow.setupStrategyDialog.distribution.helpText')}
                </p>
            </div>

            <AssetInput fetchAssetsParams={fetchAssetsParams} fieldPrefix="distribution" />

            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <h3 className="text-lg leading-tight font-normal text-neutral-800">
                        {t('app.capitalFlow.setupStrategyDialog.distribution.recipients.label')}
                    </h3>
                    <p className="text-base leading-normal font-normal text-neutral-500">
                        {t('app.capitalFlow.setupStrategyDialog.distribution.recipients.helpText')}
                    </p>
                </div>

                <InputContainer
                    id="recipients"
                    label={t('app.capitalFlow.setupStrategyDialog.distribution.recipients.label')}
                    useCustomWrapper={true}
                    className="gap-3 md:gap-2"
                    alert={
                        totalRatio !== 100 && recipients.length > 0
                            ? {
                                  message: `${totalRatio}%`,
                                  variant: totalRatio > 100 ? 'critical' : 'warning',
                              }
                            : undefined
                    }
                >
                    {recipients.map((field, index) => (
                        <SetupStrategyDialogDistributionRecipientItem
                            key={field.id}
                            index={index}
                            totalRatio={totalRatio}
                            onRemove={() => removeRecipient(index)}
                            canRemove={recipients.length > 1}
                            daoId={daoId}
                        />
                    ))}
                </InputContainer>

                <div className="flex items-center justify-between">
                    <span className="text-sm leading-tight font-normal text-neutral-500">
                        {t('app.capitalFlow.setupStrategyDialog.distribution.recipients.counter', {
                            current: recipients.length,
                            max: MAX_RECIPIENTS,
                        })}
                    </span>

                    <Button
                        variant="tertiary"
                        size="sm"
                        onClick={handleDistributeEvenly}
                        disabled={recipients.length === 0}
                    >
                        {t('app.capitalFlow.setupStrategyDialog.distribution.recipients.distributeEvenly')}
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
                    {t('app.capitalFlow.setupStrategyDialog.distribution.recipients.addButton')}
                </Button>
            </div>
        </div>
    );
};
