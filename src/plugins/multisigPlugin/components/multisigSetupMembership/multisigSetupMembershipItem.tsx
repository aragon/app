import { useMemberExists } from '@/modules/governance/api/governanceService';
import { AddressesInput } from '@/shared/components/forms/addressesInput';
import { addressUtils, type ICompositeAddress } from '@aragon/gov-ui-kit';

export interface IMultisigSetupMembershipItemProps {
    /**
     * When true show a read only mode of the address field.
     */
    disabled?: boolean;
    /**
     * Index of the item
     */
    index: number;
    /**
     * Address of the plugin
     */
    pluginAddress?: string;
    /**
     * Current member
     */
    member: ICompositeAddress;
    /**
     * Optional custom validator function that extends the default validation
     */
    customValidator?: (member: ICompositeAddress) => string | boolean;
}

export const MultisigSetupMembershipItem: React.FC<IMultisigSetupMembershipItemProps> = (props) => {
    const { disabled, index, pluginAddress, member } = props;

    const memberExistsParams = { memberAddress: member.address, pluginAddress: pluginAddress! };
    const { data: isMember } = useMemberExists(
        { urlParams: memberExistsParams },
        { enabled: pluginAddress != null && addressUtils.isAddress(member.address) },
    );

    const customValidator = () => (isMember ? 'app.plugins.multisig.multisigSetupMembershipItem.alreadyMember' : true);

    return <AddressesInput.Item index={index} disabled={disabled} customValidator={customValidator} />;
};
