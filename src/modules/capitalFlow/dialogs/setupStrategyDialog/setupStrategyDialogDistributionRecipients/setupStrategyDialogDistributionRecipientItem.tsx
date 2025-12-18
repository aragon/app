import { AddressInput, addressUtils, Button, Card, type IAddressInputResolvedValue, IconType, InputNumber } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useTranslations } from '../../../../../shared/components/translationsProvider';
import { networkDefinitions } from '../../../../../shared/constants/networkDefinitions';
import { useFormField } from '../../../../../shared/hooks/useFormField';
import { daoUtils } from '../../../../../shared/utils/daoUtils';
import type { IRecipientRelative } from '../setupStrategyDialogDefinitions';

export interface ISetupStrategyDialogDistributionRecipientItemProps {
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

export const SetupStrategyDialogDistributionRecipientItem: React.FC<ISetupStrategyDialogDistributionRecipientItemProps> = (props) => {
    const { onRemove, daoId, fieldPrefix, canRemove } = props;

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
        },
        defaultValue: 0,
        fieldPrefix,
    });

    const [addressInput, setAddressInput] = useState<string | undefined>(addressValue);

    const handleAddressAccept = (value?: IAddressInputResolvedValue) => {
        onAddressChange(value?.address ?? '');
    };

    return (
        <Card className="flex flex-col gap-4 border border-neutral-100 p-4 shadow-neutral-sm md:flex-row md:items-start md:gap-3">
            <div className="flex-1">
                <AddressInput
                    chainId={chainId}
                    onAccept={handleAddressAccept}
                    onChange={setAddressInput}
                    placeholder={t('app.shared.addressesInput.item.input.placeholder')}
                    value={addressInput}
                    {...addressField}
                />
            </div>

            <div className="flex-1">
                <InputNumber
                    alert={ratioField.alert}
                    max={100}
                    min={0}
                    onChange={(value) => ratioField.onChange(Number(value))}
                    suffix="%"
                    value={ratioField.value.toString()}
                />
            </div>

            <div className="flex h-full items-start pt-1">
                <Button disabled={!canRemove} iconLeft={IconType.CLOSE} onClick={onRemove} size="md" variant="tertiary" />
            </div>
        </Card>
    );
};
