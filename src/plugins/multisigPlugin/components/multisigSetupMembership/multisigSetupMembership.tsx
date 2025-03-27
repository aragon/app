import { AddressesInput } from '@/shared/components/forms/addressesInput';
import { useWatch } from 'react-hook-form';
import type { IMultisigSetupMembershipForm, IMultisigSetupMembershipProps } from './multisigSetupMembership.api';
import { MultisigSetupMembershipItem } from './multisigSetupMembershipItem';

export const MultisigSetupMembership: React.FC<IMultisigSetupMembershipProps> = (props) => {
    const { formPrefix, disabled, onAddClick, pluginAddress } = props;

    const watchMembersField = useWatch<Record<string, IMultisigSetupMembershipForm['members']>>({
        name: `${formPrefix}.members`,
    });

    return (
        <AddressesInput.Container name={`${formPrefix}.members`} onAddClick={onAddClick}>
            {watchMembersField.map((_, index) => (
                <MultisigSetupMembershipItem
                    key={index}
                    index={index}
                    disabled={disabled}
                    member={watchMembersField[index]}
                    pluginAddress={pluginAddress}
                />
            ))}
        </AddressesInput.Container>
    );
};
