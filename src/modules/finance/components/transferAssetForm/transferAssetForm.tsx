import type { Network } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { AddressInput, addressUtils, InputNumberMax } from '@aragon/ods';
import { AssetList } from '../assetList';
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
        rules: { required: true, min: 0, max: assetField.value?.amount },
        fieldPrefix,
    });

    const assetListParams = { queryParams: { address: sender, network } };

    return (
        <div className="flex w-full flex-col gap-6">
            <AddressInput
                helpText={t('app.finance.transferAssetForm.receiver.helpText')}
                placeholder={t('app.finance.transferAssetForm.receiver.placeholder')}
                {...receiverField}
            />
            {/* TODO: use AssetInput component (APP-3611) */}
            <InputNumberMax
                placeholder={t('app.finance.transferAssetForm.amount.placeholder')}
                max={Number(assetField.value?.amount ?? 0)}
                {...amountField}
            />
            {assetField.value != null && <p>Selected token: {assetField.value.token.symbol}</p>}
            <AssetList initialParams={assetListParams} onAssetClick={assetField.onChange} />
        </div>
    );
};
