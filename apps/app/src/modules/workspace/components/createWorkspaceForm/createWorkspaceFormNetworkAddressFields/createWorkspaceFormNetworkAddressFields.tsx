import {
    AddressInput,
    type IAddressInputResolvedValue,
} from '@aragon/gov-ui-kit';
import { useCallback, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Network } from '@/shared/api/daoService';
import { NetworkInput } from '@/shared/components/forms/networkInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useFormField } from '@/shared/hooks/useFormField';
import { workspaceUtils } from '../../../utils/workspaceUtils';
import type { ICreateWorkspaceFormNetworkAddress } from '../createWorkspaceFormDefinitions';

export interface ICreateWorkspaceFormNetworkAddressFieldsProps {
    /**
     * Name of the field-array the entry belongs to.
     */
    listName: string;
    /**
     * Index of the entry inside the field-array.
     */
    index: number;
}

type AddressFieldBaseForm = Record<string, string>;

/**
 * Network and address fields shared by the workspace target and account rows.
 */
export const CreateWorkspaceFormNetworkAddressFields: React.FC<
    ICreateWorkspaceFormNetworkAddressFieldsProps
> = (props) => {
    const { listName, index } = props;

    const { t } = useTranslations();

    const { getValues, trigger } = useFormContext();

    const fieldPrefix = `${listName}.${index.toString()}`;
    const addressFieldName = `${fieldPrefix}.address`;

    // Watched to keep the chain id of the address input in sync with the network selected on this row.
    const network = useWatch<Record<string, Network>>({
        name: `${fieldPrefix}.network`,
        defaultValue: Network.ETHEREUM_SEPOLIA,
    });

    // Reads the list off the live form state, which is undefined until the field-array is seeded and can lag behind
    // while rows are added, removed or re-mounted. Never assert it as a populated array.
    const getNetworkAddresses = useCallback(
        (): ICreateWorkspaceFormNetworkAddress[] | undefined =>
            getValues(listName),
        [getValues, listName],
    );

    const {
        value: addressValue,
        onChange: onAddressChange,
        ...addressField
    } = useFormField<AddressFieldBaseForm, typeof addressFieldName>(
        addressFieldName,
        {
            label: t('app.workspace.createWorkspaceForm.address.label'),
            defaultValue: '',
            rules: {
                required: true,
                validate: () =>
                    workspaceUtils.validateNetworkAddress(
                        getNetworkAddresses(),
                        index,
                    ),
            },
            sanitizeOnBlur: false,
        },
    );

    const [addressInput, setAddressInput] = useState<string | undefined>(
        addressValue,
    );

    const handleAddressAccept = useCallback(
        (value?: IAddressInputResolvedValue) =>
            onAddressChange(value?.address ?? ''),
        [onAddressChange],
    );

    // The duplicate check compares network and address, therefore changing the network of any row can turn another
    // row into a duplicate or resolve an existing one. Revalidate every address of the list on network change.
    const handleNetworkChange = useCallback(() => {
        const addressFieldNames = (getNetworkAddresses() ?? []).map(
            (_, addressIndex) =>
                `${listName}.${addressIndex.toString()}.address`,
        );

        void trigger(addressFieldNames);
    }, [getNetworkAddresses, listName, trigger]);

    return (
        <div className="flex flex-col gap-3 md:flex-row md:gap-2">
            <div className="w-full md:w-2/5">
                <NetworkInput
                    fieldPrefix={fieldPrefix}
                    name="network"
                    onValueChange={handleNetworkChange}
                />
            </div>
            <AddressInput
                chainId={networkDefinitions[network].id}
                className="w-full min-w-0"
                onAccept={handleAddressAccept}
                onChange={setAddressInput}
                placeholder={t(
                    'app.workspace.createWorkspaceForm.address.placeholder',
                )}
                value={addressInput}
                {...addressField}
            />
        </div>
    );
};
