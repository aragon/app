import {
    type ITransactionInfo,
    type ITransactionStatusStepMeta,
    TransactionStatus,
} from '@/shared/components/transactionStatus';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { useIsSafeContract } from '@/shared/hooks/useIsSafeContract';
import { daoUtils } from '@/shared/utils/daoUtils';
import type { IStepperStep } from '@/shared/utils/stepperUtils';
import { AddressInput, addressUtils, type IAddressInputResolvedValue } from '@aragon/gov-ui-kit';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
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
                    !isSafeCheckLoading ||
                    t('app.createDao.setupBodyDialog.externalAddress.addressTypeCheck.validation'),
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

    const addressCheckStepLabelType = isSafeCheckLoading ? 'loading' : isSafe ? 'successSafe' : 'success';
    const steps: Array<IStepperStep<ITransactionStatusStepMeta>> = [
        {
            id: 'safeCheck',
            order: 0,
            meta: {
                label: t(`app.createDao.setupBodyDialog.externalAddress.addressTypeCheck.${addressCheckStepLabelType}`),
                state: isSafeCheckLoading ? 'pending' : 'success',
            },
        },
    ];

    const transactionInfo: ITransactionInfo = { title: addressUtils.truncateAddress(value) };

    return (
        <div className="flex w-full flex-col gap-3">
            <AddressInput
                helpText={t('app.createDao.setupBodyDialog.externalAddress.address.helpText')}
                value={addressInput}
                onChange={setAddressInput}
                onAccept={handleAddressAccept}
                {...addressField}
            />
            {value && (
                <TransactionStatus.Container steps={steps} transactionInfo={transactionInfo}>
                    {steps.map((step) => (
                        <TransactionStatus.Step key={step.id} {...step} />
                    ))}
                </TransactionStatus.Container>
            )}
        </div>
    );
};
