import { AddressInput, addressUtils } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useState } from 'react';
import { useWatch } from 'react-hook-form';
import {
    AssetInput,
    type IAssetInputFormData,
    type IAssetInputProps,
} from '@/modules/finance/components/assetInput';
import type { Network } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useFormField } from '@/shared/hooks/useFormField';
import type { ITransferAssetFormData } from './transferAssetFormDefinitions';

export interface ITransferAssetFormProps
    extends Pick<IAssetInputProps, 'disableAssetField' | 'fieldPrefix'> {
    /**
     * Address of the sender to fetch the asset list from.
     */
    sender: string;
    /**
     * DAO ID to fetch the asset list for.
     */
    daoId: string;
    /**
     * Network of the asset to be transferred.
     */
    network: Network;
}

export const TransferAssetForm: React.FC<ITransferAssetFormProps> = (props) => {
    const { daoId, network, fieldPrefix, disableAssetField } = props;

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
        rules: {
            required: true,
            validate: (value) => addressUtils.isAddress(value?.address),
        },
        fieldPrefix,
        sanitizeOnBlur: false,
    });

    const [receiverInput, setReceiverInput] = useState<string | undefined>(
        value?.address,
    );

    const fetchAssetsParams = { queryParams: { daoId } };
    const { id: chainId } = networkDefinitions[network];

    return (
        <div
            className={classNames('flex w-full flex-col', {
                'gap-6': !assetValue,
            })}
        >
            <AssetInput
                disableAssetField={disableAssetField}
                fetchAssetsParams={fetchAssetsParams}
                fieldPrefix={fieldPrefix}
            />
            <AddressInput
                chainId={chainId}
                helpText={t('app.finance.transferAssetForm.receiver.helpText')}
                onAccept={onReceiverChange}
                onChange={setReceiverInput}
                placeholder={t(
                    'app.finance.transferAssetForm.receiver.placeholder',
                )}
                value={receiverInput}
                {...receiverField}
            />
        </div>
    );
};
