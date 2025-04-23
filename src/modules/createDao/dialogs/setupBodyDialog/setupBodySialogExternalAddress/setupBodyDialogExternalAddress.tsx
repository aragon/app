import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { AddressInput, addressUtils, type ICompositeAddress } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import type { ISetupBodyForm } from '../setupBodyDialogDefinitions';

export interface ISetupBodyDialogExternalAddressProps {}

export const SetupBodyDialogExternalAddress: React.FC<ISetupBodyDialogExternalAddressProps> = () => {
    const { t } = useTranslations();

    const [addressInput, setAddressInput] = useState<string | undefined>();

    const {
        onChange: onReceiverChange,
        value,
        ...addressField
    } = useFormField<ISetupBodyForm, 'external'>('external', {
        label: t('app.createDao.setupBodyDialog.externalAddress.address.label'),
        rules: { required: true, validate: (value) => addressUtils.isAddress(value.address) },
    });

    return (
        <AddressInput
            helpText={t('app.createDao.setupBodyDialog.externalAddress.address.helpText')}
            chainId={1}
            value={addressInput}
            onChange={setAddressInput}
            onAccept={(val) => {
                if (val?.address) {
                    const composite: ICompositeAddress = {
                        address: val.address,
                        name: val.name,
                    };
                    setAddressInput(val.name ?? val.address); // Display ENS or address
                    onReceiverChange(composite); // Update form state
                }
            }}
            {...addressField}
        />
    );
};
