import { Button, IconType } from '@aragon/gov-ui-kit';
import { type FC, useEffect } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { RouterAddressInput } from '@/modules/capitalFlow/components/routerAddressInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { daoUtils } from '@/shared/utils/daoUtils';
import type {
    ISetupStrategyForm,
    ISetupStrategyFormRouter,
} from '../setupStrategyDialogDefinitions';

// In PoC we limit the number of routers to 15
const maxRouters = 15;

export const SetupStrategyDialogDistributionMultiDispatch: FC = () => {
    const { t } = useTranslations();
    const { control, getValues } = useFormContext<ISetupStrategyFormRouter>();

    const { fields, append, remove, swap } = useFieldArray({
        control,
        name: 'distributionMultiDispatch.routerAddresses',
        rules: {
            validate: (value) => {
                const validAddresses = value.filter(
                    (router) => router.address && router.address.trim() !== '',
                );
                if (validAddresses.length === 0) {
                    return t(
                        'app.capitalFlow.setupStrategyDialog.distributionMultiDispatch.validation.atLeastOneRequired',
                    );
                }
                return true;
            },
        },
    });

    const daoId = useWatch<ISetupStrategyForm, 'sourceVault'>({
        name: 'sourceVault',
    });
    const { network } = daoUtils.parseDaoId(daoId);
    const { id: chainId } = networkDefinitions[network];

    // Ensure at least one field exists initially
    useEffect(() => {
        const currentValues = getValues(
            'distributionMultiDispatch.routerAddresses',
        );
        if (currentValues.length === 0) {
            append({ address: '' });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [append, getValues]);

    const canAddMore = fields.length < maxRouters;

    const handleMoveUp = (index: number) => {
        if (index > 0) {
            swap(index, index - 1);
        }
    };

    const handleMoveDown = (index: number) => {
        if (index < fields.length - 1) {
            swap(index, index + 1);
        }
    };

    return (
        <div className="flex w-full flex-col gap-3">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <p className="font-normal text-lg text-neutral-800 leading-tight">
                        {t(
                            'app.capitalFlow.setupStrategyDialog.distributionMultiDispatch.label',
                        )}
                    </p>
                    <p className="font-normal text-base text-neutral-500 leading-normal">
                        {t(
                            'app.capitalFlow.setupStrategyDialog.distributionMultiDispatch.helpText',
                        )}
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    {fields.map((field, index) => (
                        <RouterAddressInput
                            canMoveDown={index < fields.length - 1}
                            canMoveUp={index > 0}
                            canRemove={fields.length > 1}
                            chainId={chainId}
                            index={index}
                            key={`${field.id}-${index.toString()}`}
                            onMoveDown={() => handleMoveDown(index)}
                            onMoveUp={() => handleMoveUp(index)}
                            onRemove={() => remove(index)}
                            total={fields.length}
                        />
                    ))}
                </div>

                <div className="flex items-center">
                    <p className="flex-1 font-normal text-neutral-500 text-sm leading-tight">
                        {t(
                            'app.capitalFlow.setupStrategyDialog.distributionMultiDispatch.counter',
                            {
                                current: fields.length,
                                max: maxRouters,
                            },
                        )}
                    </p>
                </div>

                <Button
                    className="self-start"
                    disabled={!canAddMore}
                    iconLeft={IconType.PLUS}
                    onClick={() => append({ address: '' })}
                    size="md"
                    variant="secondary"
                >
                    {t(
                        'app.capitalFlow.setupStrategyDialog.distributionMultiDispatch.addRouter',
                    )}
                </Button>
            </div>
        </div>
    );
};
