import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { AddressInput, addressUtils, type ICompositeAddress } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import type { ISetupBodyForm } from '../setupBodyDialogDefinitions';

export interface ISetupBodyDialogExternalAddressProps {}

export const SetupBodyDialogExternalAddress: React.FC<ISetupBodyDialogExternalAddressProps> = () => {
    const { t } = useTranslations();

    const {
        onChange: onReceiverChange,
        value,
        ...addressField
    } = useFormField<ISetupBodyForm, 'external'>('external', {
        label: t('app.createDao.setupBodyDialog.externalAddress.address.label'),
        rules: { required: true, validate: (value) => addressUtils.isAddress(value.address) },
        defaultValue: { address: '' },
    });

    const [addressInput, setAddressInput] = useState<string | undefined>(value.address);

    return (
        <AddressInput
            helpText={t('app.createDao.setupBodyDialog.externalAddress.address.helpText')}
            chainId={1}
            value={addressInput}
            onChange={setAddressInput}
            onAccept={(value) => {
                if (value?.address) {
                    const external: ICompositeAddress = {
                        address: value.address,
                        name: value.name,
                    };
                    setAddressInput(value.name ?? value.address);
                    onReceiverChange(external);
                }
            }}
            {...addressField}
        />
    );
};
