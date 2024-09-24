import type { Network } from '@/shared/api/daoService';
import { AssetInput } from '@/shared/components/forms/assetInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { AddressInput, addressUtils } from '@aragon/ods';
import type { ITransferAssetFormData } from './transferAssetFormDefinitions';

export interface ITransferAssetFormProps {
    /**
     * Address of the sender to fetch the asset list from.
     */
    sender: string;
    /**
     * Network of the asset to be transfered.
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

    const receiverField = useFormField<ITransferAssetFormData, 'receiver.address'>('receiver.address', {
        label: t('app.finance.transferAssetForm.receiver.label'),
        rules: { required: true, validate: (value) => addressUtils.isAddress(value) },
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

    return (
        <div className="flex w-full flex-col gap-6">
            <AddressInput
                helpText={t('app.finance.transferAssetForm.receiver.helpText')}
                placeholder={t('app.finance.transferAssetForm.receiver.placeholder')}
                {...receiverField}
            />
            <AssetInput sender={sender} network={network} amountField={amountField} assetField={assetField} />
        </div>
    );
};
