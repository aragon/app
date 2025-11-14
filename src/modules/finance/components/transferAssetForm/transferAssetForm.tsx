import { AssetInput, type IAssetInputFormData, type IAssetInputProps } from '@/modules/finance/components/assetInput';
import type { Network } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useFormField } from '@/shared/hooks/useFormField';
import { AddressInput, addressUtils } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useState } from 'react';
import { useWatch } from 'react-hook-form';
import type { ITransferAssetFormData } from './transferAssetFormDefinitions';

export interface ITransferAssetFormProps extends Pick<IAssetInputProps, 'disableAssetField' | 'fieldPrefix'> {
    /**
     * Address of the sender to fetch the asset list from.
     */
    sender: string;
    /**
     * Network of the asset to be transferred.
     */
    network: Network;
}

export const TransferAssetForm: React.FC<ITransferAssetFormProps> = (props) => {
    const { sender, network, fieldPrefix, disableAssetField } = props;

    const { t } = useTranslations();

    const assetValue = useWatch<Record<string, IAssetInputFormData['asset']>>({
        name: `${fieldPrefix!}.asset`,
        defaultValue: undefined,
    });

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
    const { id: chainId } = networkDefinitions[network];

    return (
        <div className={classNames('flex w-full flex-col', { 'gap-6': !assetValue })}>
            <AssetInput
                fetchAssetsParams={fetchAssetsParams}
                fieldPrefix={fieldPrefix}
                disableAssetField={disableAssetField}
            />
            <AddressInput
                helpText={t('app.finance.transferAssetForm.receiver.helpText')}
                placeholder={t('app.finance.transferAssetForm.receiver.placeholder')}
                value={receiverInput}
                onChange={setReceiverInput}
                onAccept={onReceiverChange}
                chainId={chainId}
                {...receiverField}
            />
        </div>
    );
};
