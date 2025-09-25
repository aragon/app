import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { daoUtils } from '@/shared/utils/daoUtils';
import { AddressInput, addressUtils, type IAddressInputResolvedValue } from '@aragon/gov-ui-kit';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useIsSafeContract } from '../../../../../shared/hooks/useIsSafeContract';
import type { ISetupBodyForm } from '../setupBodyDialogDefinitions';

export interface ISetupBodyDialogExternalAddressProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const SetupBodyDialogExternalAddress: React.FC<ISetupBodyDialogExternalAddressProps> = (props) => {
    const { daoId } = props;
    const { network } = daoUtils.parseDaoId(daoId);
    const { t } = useTranslations();

    const { setValue } = useFormContext<ISetupBodyForm>();

    const {
        onChange: onReceiverChange,
        value,
        ...addressField
    } = useFormField<ISetupBodyForm, 'address'>('address', {
        label: t('app.createDao.setupBodyDialog.externalAddress.address.label'),
        rules: {
            required: true,
            validate: {
                isAddress: (value) => addressUtils.isAddress(value),
                isSafeCheckLoading: () =>
                    !isSafeCheckLoading || t('app.createDao.setupBodyDialog.externalAddress.safeCheck.validation'),
            },
        },
    });

    const { data: isSafe, isLoading: isSafeCheckLoading } = useIsSafeContract({
        network,
        address: value,
    });

    useEffect(() => {
        if (isSafeCheckLoading) {
            return;
        }

        setValue('isSafe', isSafe);
    }, [isSafe, isSafeCheckLoading, setValue]);

    const [addressInput, setAddressInput] = useState<string | undefined>(value);

    const handleAddressAccept = (value?: IAddressInputResolvedValue) => {
        onReceiverChange(value?.address);
        setValue('name', value?.name);
    };

    return (
        <div className="flex w-full flex-col gap-3">
            <AddressInput
                helpText={t('app.createDao.setupBodyDialog.externalAddress.address.helpText')}
                value={addressInput}
                onChange={setAddressInput}
                onAccept={handleAddressAccept}
                {...addressField}
            />
            {isSafeCheckLoading && (
                <p className="text-info-800">{t('app.createDao.setupBodyDialog.externalAddress.safeCheck.loading')}</p>
            )}
        </div>
    );
};
