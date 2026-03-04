'use client';

import type {
    ICompositeAddress,
    IInputComponentProps,
} from '@aragon/gov-ui-kit';
import { useWatch } from 'react-hook-form';
import { type Network, useDao } from '@/shared/api/daoService';
import { AddressesInput } from '@/shared/components/forms/addressesInput';
import { ManageMembershipAddressListItem } from './manageMembershipAddressListItem';

export interface IManageMembershipAddressListProps
    extends Pick<IInputComponentProps, 'label' | 'helpText'> {
    /**
     * Prefix to be appended to all form fields.
     */
    formPrefix: string;
    /**
     * When true show a read-only mode for the address fields.
     */
    disabled?: boolean;
    /**
     * Callback to be used when the add button is clicked.
     */
    onAddClick?: () => void;
    /**
     * Flag to determine if the list can be empty.
     */
    allowEmptyList?: boolean;
    /**
     * Address of the plugin, used for member validation.
     */
    pluginAddress?: string;
    /**
     * Network of the plugin.
     */
    network?: Network;
    /**
     * ID of the DAO, used to derive the chain when the network is not provided.
     */
    daoId?: string;
    /**
     * Translation key used when member exists validation fails.
     * When provided, enables async member-exists validation.
     */
    alreadyMemberErrorKey?: string;
    /**
     * Whether to show the "Reset all" option in the more actions menu.
     */
    showResetAllAction?: boolean;
}

export const ManageMembershipAddressList: React.FC<
    IManageMembershipAddressListProps
> = (props) => {
    const {
        formPrefix,
        disabled,
        onAddClick,
        allowEmptyList,
        pluginAddress,
        network,
        daoId,
        alreadyMemberErrorKey,
        showResetAllAction,
        label,
        helpText,
    } = props;

    const { data: dao } = useDao(
        { urlParams: { id: daoId ?? '' } },
        { enabled: daoId != null },
    );
    const membershipNetwork = network ?? dao?.network;

    const membersFieldName = formPrefix ? `${formPrefix}.members` : 'members';
    const watchMembersField = useWatch<Record<string, ICompositeAddress[]>>({
        name: membersFieldName,
        defaultValue: [],
    });

    return (
        <AddressesInput.Container
            allowEmptyList={allowEmptyList}
            helpText={helpText}
            label={label}
            name={membersFieldName}
            onAddClick={onAddClick}
            showResetAllAction={showResetAllAction}
        >
            {watchMembersField.map((member, index) => (
                <ManageMembershipAddressListItem
                    alreadyMemberErrorKey={alreadyMemberErrorKey}
                    disabled={disabled}
                    index={index}
                    key={index}
                    member={member}
                    network={membershipNetwork}
                    pluginAddress={pluginAddress}
                />
            ))}
        </AddressesInput.Container>
    );
};
