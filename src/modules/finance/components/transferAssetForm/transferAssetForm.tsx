import { AssetInput } from '@/modules/finance/components/assetInput';
import type { Network } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { AddressInput, addressUtils } from '@aragon/gov-ui-kit';
import { useState } from 'react';
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

export const TransferAssetForm: React.FC<ITransferAssetFormProps> = (props) => {
    const { sender, network, fieldPrefix } = props;

    const { t } = useTranslations();

    const {
        onChange: onReceiverChange,
        value,
        ...receiverField
    } = useFormField<ITransferAssetFormData, 'receiver'>('receiver', {
        label: t('app.finance.transferAssetForm.receiver.label'),
        rules: { required: true, validate: (value) => addressUtils.isAddress(value?.address) },
        fieldPrefix,
    });

    const [receiverInput, setReceiverInput] = useState<string | undefined>(value?.address);

    const fetchAssetsParams = { queryParams: { address: sender, network } };

    return (
        <div className="flex w-full flex-col gap-6">
            <AddressInput
                helpText={t('app.finance.transferAssetForm.receiver.helpText')}
                placeholder={t('app.finance.transferAssetForm.receiver.placeholder')}
                value={receiverInput}
                onChange={setReceiverInput}
                onAccept={onReceiverChange}
                {...receiverField}
            />
            <AssetInput fetchAssetsParams={fetchAssetsParams} fieldPrefix={fieldPrefix} />
        </div>
    );
};
