import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { AddressInput, addressUtils, type IAddressInputResolvedValue } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import type { ISetupBodyForm } from '../setupBodyDialogDefinitions';

export interface ISetupBodyDialogExternalAddressProps {}

export const SetupBodyDialogExternalAddress: React.FC<ISetupBodyDialogExternalAddressProps> = () => {
    const { t } = useTranslations();

    const { setValue } = useFormContext<ISetupBodyForm>();

    const {
        onChange: onReceiverChange,
        value,
        ...addressField
    } = useFormField<ISetupBodyForm, 'address'>('address', {
        label: t('app.createDao.setupBodyDialog.externalAddress.address.label'),
        rules: { required: true, validate: (value) => addressUtils.isAddress(value) },
    });

    const [addressInput, setAddressInput] = useState<string | undefined>(value);

    const handleAddressAccept = (value?: IAddressInputResolvedValue) => {
        onReceiverChange(value?.address);
        setValue('name', value?.name);
    };

    return (
        <AddressInput
            helpText={t('app.createDao.setupBodyDialog.externalAddress.address.helpText')}
            value={addressInput}
            onChange={setAddressInput}
            onAccept={handleAddressAccept}
            {...addressField}
        />
    );
};
