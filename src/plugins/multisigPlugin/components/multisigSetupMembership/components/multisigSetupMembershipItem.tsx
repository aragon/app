import { useMemberExists } from '@/modules/governance/api/governanceService';
import type { Network } from '@/shared/api/daoService';
import { AddressesInput } from '@/shared/components/forms/addressesInput';
import { addressUtils, type ICompositeAddress } from '@aragon/gov-ui-kit';

export interface IMultisigSetupMembershipItemProps {
    /**
     * When true show a read only mode of the address field.
     */
    disabled?: boolean;
    /**
     * Index of the item.
     */
    index: number;
    /**
     * Address of the plugin.
     */
    pluginAddress?: string;
    /**
     * Network of the plugin.
     */
    network?: Network;
    /**
     * Current member.
     */
    member: ICompositeAddress;
    /**
     * Custom validator function that extends the default validation.
     */
    customValidator?: (member: ICompositeAddress) => string | boolean;
}

export const MultisigSetupMembershipItem: React.FC<IMultisigSetupMembershipItemProps> = (props) => {
    const { disabled, index, pluginAddress, member, network } = props;

    const memberExistsParams = { memberAddress: member.address, pluginAddress: pluginAddress!, network: network! };
    const { data } = useMemberExists(
        { urlParams: memberExistsParams },
        { enabled: network != null && pluginAddress != null && addressUtils.isAddress(member.address) },
    );

    const isMember = data?.status === true;

    const customValidator = () => (isMember ? 'app.plugins.multisig.multisigSetupMembership.item.alreadyMember' : true);

    return <AddressesInput.Item index={index} disabled={disabled} customValidator={customValidator} />;
};
