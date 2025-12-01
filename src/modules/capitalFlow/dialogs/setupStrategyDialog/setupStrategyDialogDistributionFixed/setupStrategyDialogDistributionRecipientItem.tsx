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
import { useState } from 'react';
import type { IRecipientRelative } from '../setupStrategyDialogDefinitions';

export interface ISetupStrategyDialogDistributionRecipientItemProps {
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
    /**
     * Field prefix of the recipient in the array.
     */
    fieldPrefix: string;
}

export const SetupStrategyDialogDistributionRecipientItem: React.FC<
    ISetupStrategyDialogDistributionRecipientItemProps
> = (props) => {
    const { totalRatio, onRemove, canRemove, daoId, fieldPrefix } = props;

    const { t } = useTranslations();

    const { network } = daoUtils.parseDaoId(daoId ?? '');
    const { id: chainId } = networkDefinitions[network];

    const {
        onChange: onAddressChange,
        value: addressValue,
        ...addressField
    } = useFormField<IRecipientRelative, 'address'>('address', {
        // label: t('app.capitalFlow.setupStrategyDialog.distribution.recipients.address'),
        rules: {
            required: true,
            validate: (value) => addressUtils.isAddress(value),
        },
        fieldPrefix,
        sanitizeOnBlur: false,
    });

    const ratioField = useFormField<IRecipientRelative, 'ratio'>('ratio', {
        rules: {
            required: true,
            min: 0,
            max: 100,
            validate: (value) => {
                debugger;
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

    const handleAddressAccept = (value?: IAddressInputResolvedValue) => {
        onAddressChange(value?.address ?? '');
    };

    return (
        <Card className="shadow-neutral-sm flex flex-col gap-4 border border-neutral-100 p-4 md:flex-row md:items-start md:gap-3">
            <div className="flex-1">
                <AddressInput
                    value={addressInput}
                    onChange={setAddressInput}
                    onAccept={handleAddressAccept}
                    placeholder={t('app.shared.addressesInput.item.input.placeholder')}
                    chainId={chainId}
                    {...addressField}
                />
            </div>

            <div className="flex-1">
                <InputNumber
                    min={0}
                    max={100}
                    suffix="%"
                    value={ratioField.value?.toString() ?? '0'}
                    onChange={(value) => ratioField.onChange(Number(value))}
                    alert={ratioField.alert}
                    // label={t('app.capitalFlow.setupStrategyDialog.distribution.recipients.ratio')}
                />
            </div>

            <div className="flex h-full items-start pt-1">
                <Button iconLeft={IconType.CLOSE} onClick={onRemove} variant="tertiary" size="md" />
            </div>
        </Card>
    );
};
