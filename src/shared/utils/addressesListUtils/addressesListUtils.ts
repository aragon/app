import type { ITokenSetupMembershipMember } from '@/plugins/tokenPlugin/components/tokenSetupMembership';
import { addressUtils, type ICompositeAddress } from '@aragon/gov-ui-kit';

class AddressesListUtils {
    checkIsAlreadyInList = (members: ITokenSetupMembershipMember[], currentIndex: number, address: string): boolean => {
        return members.slice(0, currentIndex).some((member) => addressUtils.isAddressEqual(member.address, address));
    };

    validateAddress = (
        members: ITokenSetupMembershipMember[],
        index: number,
        customValidator?: (member: ICompositeAddress) => true | string,
    ): true | string => {
        const errorNamespace = 'app.shared.addressesInput.item.input.error';

        if (customValidator) {
            return customValidator(members[index]);
        }

        if (!addressUtils.isAddress(members[index].address)) {
            return `${errorNamespace}.invalid`;
        } else if (this.checkIsAlreadyInList(members, index, members[index].address)) {
            return `${errorNamespace}.alreadyInList`;
        }

        return true;
    };
}

export const addressesListUtils = new AddressesListUtils();
