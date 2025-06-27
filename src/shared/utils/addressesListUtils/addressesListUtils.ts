import { addressUtils, type ICompositeAddress } from '@aragon/gov-ui-kit';

class AddressesListUtils {
    checkIsAlreadyInList = (members: ICompositeAddress[], currentIndex: number, address?: string): boolean => {
        return members.slice(0, currentIndex).some((member) => addressUtils.isAddressEqual(member.address, address));
    };

    validateAddress = (
        address: string,
        members: ICompositeAddress[],
        index: number,
        customValidator?: (member: ICompositeAddress) => true | string,
    ): true | string => {
        const errorNamespace = 'app.shared.addressesInput.item.input.error';

        console.log('address', address);
        if (!addressUtils.isAddress(address)) {
            return `${errorNamespace}.invalid`;
        } else if (this.checkIsAlreadyInList(members, index, address)) {
            return `${errorNamespace}.alreadyInList`;
        }

        if (customValidator) {
            return customValidator(members[index]);
        }

        return true;
    };
}

export const addressesListUtils = new AddressesListUtils();
