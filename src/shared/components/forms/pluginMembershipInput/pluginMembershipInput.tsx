'use client';

import { addressUtils, type ICompositeAddress } from '@aragon/gov-ui-kit';
import { useWatch } from 'react-hook-form';
import { useMemberExists } from '@/modules/governance/api/governanceService';
import type { Network } from '@/shared/api/daoService';
import { useDao } from '@/shared/api/daoService';
import { AddressesInput } from '@/shared/components/forms/addressesInput';
import { useDaoChain } from '@/shared/hooks/useDaoChain';

export interface IPluginMembershipInputProps {
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
     * When true, validates that entered members are not already in the plugin.
     */
    validateMemberExists?: boolean;
    /**
     * Translation key used when member exists validation fails.
     */
    alreadyMemberErrorKey?: string;
    /**
     * Whether to show the "Reset all" option in the more actions menu.
     */
    showResetAllAction?: boolean;
}

interface IPluginMembershipInputItemProps {
    index: number;
    member: ICompositeAddress;
    disabled?: boolean;
    pluginAddress?: string;
    network?: Network;
    validateMemberExists?: boolean;
    alreadyMemberErrorKey?: string;
}

const PluginMembershipInputItem: React.FC<IPluginMembershipInputItemProps> = (
    props,
) => {
    const {
        index,
        member,
        disabled,
        pluginAddress,
        network,
        validateMemberExists,
        alreadyMemberErrorKey,
    } = props;
    const { chainId } = useDaoChain({ network });

    const memberExistsParams = {
        urlParams: {
            memberAddress: member.address,
            pluginAddress: pluginAddress!,
        },
        queryParams: { network: network! },
    };
    const { data } = useMemberExists(memberExistsParams, {
        enabled:
            validateMemberExists === true &&
            network != null &&
            pluginAddress != null &&
            addressUtils.isAddress(member.address),
    });

    const isMember = data?.status === true;
    const customValidator = () =>
        isMember ? (alreadyMemberErrorKey ?? true) : true;

    return (
        <AddressesInput.Item
            chainId={chainId}
            customValidator={customValidator}
            disabled={disabled}
            index={index}
        />
    );
};

export const PluginMembershipInput: React.FC<IPluginMembershipInputProps> = (
    props,
) => {
    const {
        formPrefix,
        disabled,
        onAddClick,
        allowEmptyList,
        pluginAddress,
        network,
        daoId,
        validateMemberExists,
        alreadyMemberErrorKey,
        showResetAllAction,
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
            name={membersFieldName}
            onAddClick={onAddClick}
            showResetAllAction={showResetAllAction}
        >
            {watchMembersField.map((member, index) => (
                <PluginMembershipInputItem
                    alreadyMemberErrorKey={alreadyMemberErrorKey}
                    disabled={disabled}
                    index={index}
                    key={index}
                    member={member}
                    network={membershipNetwork}
                    pluginAddress={pluginAddress}
                    validateMemberExists={validateMemberExists}
                />
            ))}
        </AddressesInput.Container>
    );
};
