'use client';

import {
    AddressInput,
    addressUtils,
    Button,
    Card,
    type IAddressInputResolvedValue,
    IconType,
} from '@aragon/gov-ui-kit';
import { useEffect, useState } from 'react';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import type { IExistingProposalCreationCondition } from '../createProcessFormDefinitions';

export interface IExistingConditionCardProps {
    /**
     * Form field prefix pointing at the condition entry, e.g. `existingProposalCreationConditions.0`.
     */
    formPrefix: string;
    /**
     * Chain id used to build the explorer link for the address input.
     */
    chainId?: number;
    /**
     * Called when the user removes this card.
     */
    onRemove: () => void;
}

export const ExistingConditionCard: React.FC<IExistingConditionCardProps> = (
    props,
) => {
    const { formPrefix, chainId, onRemove } = props;
    const { t } = useTranslations();

    const addressRequiredKey =
        'app.createDao.createProcessForm.proposalCreation.existingCondition.addressRequired';

    const {
        value,
        onChange: onAddressChange,
        ...addressField
    } = useFormField<IExistingProposalCreationCondition, 'address'>('address', {
        fieldPrefix: formPrefix,
        defaultValue: '',
        rules: {
            required: addressRequiredKey,
            validate: (value) =>
                addressUtils.isAddress(value) || addressRequiredKey,
        },
        sanitizeOnBlur: false,
    });

    const [addressInput, setAddressInput] = useState<string | undefined>(value);

    useEffect(() => {
        setAddressInput(value);
    }, [value]);

    const handleAddressAccept = (value?: IAddressInputResolvedValue) =>
        onAddressChange(value?.address ?? '');

    return (
        <Card className="w-full shrink-0 border border-primary-400 p-4 shadow-primary">
            <div className="flex w-full min-w-0 flex-col items-start gap-3 sm:flex-row sm:items-start sm:gap-2">
                <AddressInput
                    chainId={chainId}
                    className="w-full min-w-0"
                    onAccept={handleAddressAccept}
                    onChange={setAddressInput}
                    value={addressInput}
                    {...addressField}
                    label={undefined}
                />
                <Button
                    aria-label={t(
                        'app.createDao.createProcessForm.proposalCreation.existingCondition.remove',
                    )}
                    className="shrink-0 sm:mt-2"
                    iconLeft={IconType.CLOSE}
                    onClick={onRemove}
                    size="sm"
                    variant="secondary"
                />
            </div>
        </Card>
    );
};
