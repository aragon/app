import { useFormField } from '@/shared/hooks/useFormField';
import { AddressInput, addressUtils } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import type { ISetupBodyForm } from '../setupBodyDialogDefinitions';

export interface ISetupBodyDialogExternalAddressProps {}

export const SetupBodyDialogExternalAddress: React.FC<ISetupBodyDialogExternalAddressProps> = () => {
    const [addressInput, setAddressInput] = useState<string | undefined>();

    const {
        onChange: onReceiverChange,
        value,
        ...addressField
    } = useFormField<ISetupBodyForm, 'address'>('address', {
        label: 'External address',
        rules: { required: true, validate: (value) => addressUtils.isAddress(value) },
    });

    return (
        <AddressInput
            label="External address"
            helpText="Add any address as a body, such as a Safe or Governor"
            chainId={1}
            value={addressInput}
            onChange={setAddressInput}
            onAccept={(value) => onReceiverChange(value?.address)}
            {...addressField}
        />
    );
};
