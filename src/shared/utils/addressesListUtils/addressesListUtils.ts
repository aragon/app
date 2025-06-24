import type { ITokenSetupMembershipMember } from '@/plugins/tokenPlugin/components/tokenSetupMembership';
import { addressUtils, type ICompositeAddress } from '@aragon/gov-ui-kit';

class AddressesListUtils {
    checkIsAlreadyInList = (members: ITokenSetupMembershipMember[], currentIndex: number, address: string): boolean => {
        return members.slice(0, currentIndex).some((member) => addressUtils.isAddressEqual(member.address, address));
    };

    validateAddress = (
        members: ITokenSetupMembershipMember[],
        index: number,
        member: ICompositeAddress,
        errorNamespace: string,
        customValidator?: (member: ICompositeAddress) => true | string,
    ): true | string => {
        if (customValidator) {
            return customValidator(member);
        }

        if (!addressUtils.isAddress(member.address, { strict: true })) {
            return `${errorNamespace}.invalid`;
        } else if (this.checkIsAlreadyInList(members, index, member.address)) {
            return `${errorNamespace}.alreadyInList`;
        }

        return true;
    };
}

export const addressesListUtils = new AddressesListUtils();
