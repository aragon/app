import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useFormField } from '@/shared/hooks/useFormField';
import { daoUtils } from '@/shared/utils/daoUtils';
import {
    AddressInput,
    addressUtils,
    Button,
    Card,
    IconType,
    InputNumber,
    type IAddressInputResolvedValue,
} from '@aragon/gov-ui-kit';
import { useCallback, useState } from 'react';
import type { IRecipient } from '../setupStrategyDialogDefinitions';

export interface ISetupStrategyDialogDistributionRecipientItemProps {
    /**
     * Index of the recipient in the array.
     */
    index: number;
    /**
     * Total ratio currently allocated.
     */
    totalRatio: number;
    /**
     * Callback for removing this recipient.
     */
    onRemove: () => void;
    /**
     * Whether this recipient can be removed.
     */
    canRemove: boolean;
    /**
     * ID of the DAO for network context.
     */
    daoId?: string;
}

export const SetupStrategyDialogDistributionRecipientItem: React.FC<
    ISetupStrategyDialogDistributionRecipientItemProps
> = (props) => {
    const { index, totalRatio, onRemove, canRemove, daoId } = props;

    const { t } = useTranslations();

    const { network } = daoUtils.parseDaoId(daoId ?? '');
    const { id: chainId } = networkDefinitions[network];

    const fieldPrefix = `distribution.recipients.[${index}]`;

    const {
        onChange: onAddressChange,
        value: addressValue,
        ...addressField
    } = useFormField<IRecipient, 'address'>('address', {
        label: t('app.capitalFlow.setupStrategyDialog.distribution.recipients.label'),
        rules: {
            required: true,
            validate: (value) => addressUtils.isAddress(value),
        },
        fieldPrefix,
    });

    const ratioField = useFormField<IRecipient, 'ratio'>('ratio', {
        rules: {
            required: true,
            min: 0,
            max: 100,
            validate: (value) => {
                const numValue = Number(value);
                if (numValue === 0) return true;
                // Calculate what total would be without this recipient's current value
                const otherRecipientsRatio = totalRatio - numValue;
                // Check if adding this value would exceed 100
                return otherRecipientsRatio + numValue <= 100;
            },
        },
        defaultValue: 0,
        fieldPrefix,
    });

    const [addressInput, setAddressInput] = useState<string | undefined>(addressValue);

    const handleAddressAccept = useCallback(
        (value?: IAddressInputResolvedValue) => {
            onAddressChange(value?.address ?? '');
        },
        [onAddressChange],
    );

    return (
        <Card className="shadow-neutral-sm flex flex-col gap-4 border border-neutral-100 p-4 md:flex-row md:items-center md:justify-between md:gap-2">
            <AddressInput
                value={addressInput}
                onChange={setAddressInput}
                onAccept={handleAddressAccept}
                placeholder={t('app.shared.addressesInput.item.input.placeholder')}
                chainId={chainId}
                className="flex-1"
                {...addressField}
            />

            <div className="flex items-center gap-3">
                <InputNumber
                    min={0}
                    max={100}
                    suffix="%"
                    value={ratioField.value?.toString() ?? '0'}
                    className="w-full md:max-w-40"
                    onChange={(value) => ratioField.onChange(Number(value))}
                    alert={ratioField.alert}
                />

                <Button
                    iconLeft={IconType.CLOSE}
                    onClick={onRemove}
                    variant="tertiary"
                    size="sm"
                    disabled={!canRemove}
                />
            </div>
        </Card>
    );
};
