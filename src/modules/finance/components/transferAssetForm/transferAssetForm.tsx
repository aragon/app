import { wagmiConfig } from '@/modules/application/constants/wagmi';
import type { Network } from '@/shared/api/daoService';
import { AssetInput } from '@/shared/components/forms/assetInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { AddressInput } from '@aragon/ods';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import type { ITransferAssetFormData } from './transferAssetFormDefinitions';

export interface ITransferAssetFormProps {
    /**
     * Address of the sender to fetch the asset list from.
     */
    sender: string;
    /**
     * Network of the asset to be transferred.
     */
    network: Network;
    /**
     * Prefix to prepend to all form fields.
     */
    fieldPrefix?: string;
}

//TODO: Correctly export from ODS before next release
interface IAddressInputResolvedValue {
    /**
     * Address value.
     */
    address?: string;
    /**
     * ENS name linked to the given address.
     */
    name?: string;
}

export const TransferAssetForm: React.FC<ITransferAssetFormProps> = (props) => {
    const { sender, network, fieldPrefix } = props;
    const [resolved, setResolved] = useState<IAddressInputResolvedValue>();
    const { t } = useTranslations();
    const { trigger } = useFormContext();

    const receiverField = useFormField<ITransferAssetFormData, 'receiver.address'>('receiver.address', {
        label: t('app.finance.transferAssetForm.receiver.label'),
        rules: {
            required: true,
            validate: () => {
                const hasAddressOrName = !!(resolved?.address ?? resolved?.name);
                return hasAddressOrName;
            },
        },
        fieldPrefix,
    });

    const assetField = useFormField<ITransferAssetFormData, 'asset'>('asset', {
        rules: { required: true },
        fieldPrefix,
    });

    const amountField = useFormField<ITransferAssetFormData, 'amount'>('amount', {
        label: t('app.finance.transferAssetForm.amount.label'),
        rules: {
            required: true,
            max: assetField.value?.amount,
            validate: (value) => {
                return parseFloat(value ?? '') > 0;
            },
        },
        fieldPrefix,
    });

    useEffect(() => {
        // Trigger validation when 'resolved' changes to ensure valid receiver address.
        if (receiverField.value) {
            trigger(`${fieldPrefix}.receiver.address`);
        }
    }, [resolved, fieldPrefix, trigger, receiverField.value]);

    return (
        <div className="flex w-full flex-col gap-6">
            <AddressInput
                helpText={t('app.finance.transferAssetForm.receiver.helpText')}
                placeholder={t('app.finance.transferAssetForm.receiver.placeholder')}
                chainId={1}
                wagmiConfig={wagmiConfig}
                onAccept={setResolved}
                {...receiverField}
            />
            <AssetInput sender={sender} network={network} amountField={amountField} assetField={assetField} />
        </div>
    );
};
