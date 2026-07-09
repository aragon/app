import { addressUtils, type ICompositeAddress } from '@aragon/gov-ui-kit';
import { useMemberExists } from '@/modules/governance/api/governanceService';
import type { Network } from '@/shared/api/daoService';
import { AddressesInput } from '@/shared/components/forms/addressesInput';
import { useDaoChain } from '@/shared/hooks/useDaoChain';

export interface IManageMembershipAddressListItemProps {
    /**
     * Row index in the members array.
     */
    index: number;
    /**
     * Current member value.
     */
    member: ICompositeAddress;
    /**
     * Disables input interactions when true.
     */
    disabled?: boolean;
    /**
     * Plugin address used by async member-exists validation.
     */
    pluginAddress?: string;
    /**
     * Network used for chain-aware address rendering and validation.
     */
    network?: Network;
    /**
     * Translation key for the "already member" validation error.
     * When provided, enables async member-exists validation.
     */
    alreadyMemberErrorKey?: string;
    /**
     * Addresses that should bypass async member-exists validation.
     */
    skipMemberExistsForAddresses?: string[];
}

export const ManageMembershipAddressListItem: React.FC<
    IManageMembershipAddressListItemProps
> = (props) => {
    const {
        index,
        member,
        disabled,
        pluginAddress,
        network,
        alreadyMemberErrorKey,
        skipMemberExistsForAddresses,
    } = props;
    const { chainId } = useDaoChain({ network });
    const shouldSkipMemberExistsValidation =
        skipMemberExistsForAddresses?.some(
            (address) =>
                addressUtils.isAddress(member.address) &&
                addressUtils.isAddressEqual(address, member.address),
        ) ?? false;

    const memberExistsParams = {
        urlParams: {
            memberAddress: member.address,
            pluginAddress: pluginAddress!,
        },
        queryParams: { network: network! },
    };
    const { data } = useMemberExists(memberExistsParams, {
        enabled:
            alreadyMemberErrorKey != null &&
            network != null &&
            pluginAddress != null &&
            !shouldSkipMemberExistsValidation &&
            addressUtils.isAddress(member.address),
    });

    const isMember = data?.status === true;
    const customValidator = () =>
        isMember && !shouldSkipMemberExistsValidation
            ? (alreadyMemberErrorKey ?? true)
            : true;

    return (
        <AddressesInput.Item
            chainId={chainId}
            customValidator={customValidator}
            disabled={disabled}
            index={index}
        />
    );
};
