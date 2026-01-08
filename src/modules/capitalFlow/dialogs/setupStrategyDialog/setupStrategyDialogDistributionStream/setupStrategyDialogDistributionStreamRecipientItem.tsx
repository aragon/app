import {
    AddressInput,
    addressUtils,
    Button,
    Card,
    type IAddressInputResolvedValue,
    IconType,
    InputNumber,
} from '@aragon/gov-ui-kit';
import { useState } from 'react';
import type { IAsset } from '@/modules/finance/api/financeService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useFormField } from '@/shared/hooks/useFormField';
import { daoUtils } from '@/shared/utils/daoUtils';
import type { IRecipientAbsolute } from '../setupStrategyDialogDefinitions';

export interface ISetupStrategyDialogDistributionStreamRecipientItemProps {
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
    /**
     * The selected asset for displaying symbol.
     */
    asset?: IAsset;
}

export const SetupStrategyDialogDistributionStreamRecipientItem: React.FC<
    ISetupStrategyDialogDistributionStreamRecipientItemProps
> = (props) => {
    const { onRemove, canRemove, daoId, fieldPrefix, asset } = props;

    const { t } = useTranslations();

    const { network } = daoUtils.parseDaoId(daoId ?? '');
    const { id: chainId } = networkDefinitions[network];

    const {
        onChange: onAddressChange,
        value: addressValue,
        ...addressField
    } = useFormField<IRecipientAbsolute, 'address'>('address', {
        rules: {
            required: true,
            validate: (value) => addressUtils.isAddress(value),
        },
        fieldPrefix,
        sanitizeOnBlur: false,
    });

    const amountField = useFormField<IRecipientAbsolute, 'amount'>('amount', {
        rules: {
            required: true,
            min: 0,
        },
        defaultValue: 0,
        fieldPrefix,
    });

    const [addressInput, setAddressInput] = useState<string | undefined>(
        addressValue,
    );

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
                    placeholder={t(
                        'app.shared.addressesInput.item.input.placeholder',
                    )}
                    value={addressInput}
                    {...addressField}
                />
            </div>

            <div className="flex-1">
                <InputNumber
                    alert={amountField.alert}
                    min={0}
                    onChange={(value) => amountField.onChange(Number(value))}
                    suffix={asset?.token.symbol}
                    value={amountField.value.toString()}
                />
            </div>

            <div className="flex h-full items-start pt-1">
                <Button
                    disabled={!canRemove}
                    iconLeft={IconType.CLOSE}
                    onClick={onRemove}
                    size="md"
                    variant="tertiary"
                />
            </div>
        </Card>
    );
};
