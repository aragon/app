import type { Network } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { AddressInput, InputNumber } from '@aragon/ods';
import type { IAsset } from '../../api/financeService';
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
        rules: { required: true },
        fieldPrefix,
    });

    const amountField = useFormField<ITransferAssetFormData, 'amount'>('amount', {
        label: t('app.finance.transferAssetForm.amount.label'),
        rules: { required: true },
        fieldPrefix,
    });

    const tokenField = useFormField<ITransferAssetFormData, 'token'>('token', { fieldPrefix });

    const handleAssetClick = (asset: IAsset) => tokenField.onChange(asset.token);

    const assetListParams = { queryParams: { address: sender, network } };

    return (
        <div className="flex w-full flex-col gap-6">
            <AddressInput
                helpText={t('app.finance.transferAssetForm.receiver.helpText')}
                placeholder={t('app.finance.transferAssetForm.receiver.placeholder')}
                {...receiverField}
            />
            <InputNumber placeholder={t('app.finance.transferAssetForm.amount.placeholder')} {...amountField} />
            {tokenField.value != null && <p>Selected token: {tokenField.value.symbol}</p>}
            <AssetList initialParams={assetListParams} onAssetClick={handleAssetClick} />
        </div>
    );
};
