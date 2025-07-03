import type { ITokenSetupMembershipMember } from '@/plugins/tokenPlugin/components/tokenSetupMembership';
import { addressUtils } from '@aragon/gov-ui-kit';
import { addressesListUtils } from './addressesListUtils';

describe('addressesList Utils', () => {
    const isAddressSpy = jest.spyOn(addressUtils, 'isAddress');
    const isAddressEqualSpy = jest.spyOn(addressUtils, 'isAddressEqual');

    afterEach(() => {
        isAddressSpy.mockReset();
        isAddressEqualSpy.mockReset();
    });

    describe('checkIsAlreadyInList', () => {
        it('returns true if address is already in the list before the current index', () => {
            isAddressEqualSpy.mockReturnValueOnce(true);

            const members: ITokenSetupMembershipMember[] = [{ address: '0x123' }, { address: '0x456' }];
            const result = addressesListUtils.checkIsAlreadyInList(members, 2, '0x123');

            expect(result).toBeTruthy();
            expect(isAddressEqualSpy).toHaveBeenCalledWith('0x123', '0x123');
        });

        it('returns false if address is not in the list before the current index', () => {
            isAddressEqualSpy.mockReturnValue(false);

            const members: ITokenSetupMembershipMember[] = [{ address: '0xabc' }, { address: '0xdef' }];
            const result = addressesListUtils.checkIsAlreadyInList(members, 2, '0x999');

            expect(result).toBeFalsy();
        });
    });

    describe('validateAddress', () => {
        it('returns true if customValidator returns true', () => {
            isAddressSpy.mockReturnValue(true);
            const customValidator = jest.fn().mockReturnValue(true);
            const address = '0x123';

            const result = addressesListUtils.validateAddress(address, [{ address }], 0, customValidator);

            expect(result).toBeTruthy();
            expect(customValidator).toHaveBeenCalledWith({ address });
        });

        it('returns errorNamespace.invalid if address is invalid', () => {
            isAddressSpy.mockReturnValue(false);

            const address = '0xinvalid';
            const members: ITokenSetupMembershipMember[] = [{ address }];

            const result = addressesListUtils.validateAddress(address, members, 0);

            expect(result).toMatch(/invalid/);
            expect(isAddressSpy).toHaveBeenCalledWith(address);
        });

        it('returns errorNamespace.alreadyInList if address is already in list', () => {
            isAddressSpy.mockReturnValue(true);
            isAddressEqualSpy.mockReturnValue(true);

            const address = '0xaaa';
            const members: ITokenSetupMembershipMember[] = [{ address }, { address }];

            const result = addressesListUtils.validateAddress(address, members, 1);

            expect(result).toMatch(/alreadyInList/);
            expect(isAddressSpy).toHaveBeenCalledWith(address);
            expect(isAddressEqualSpy).toHaveBeenCalledWith(address, address);
        });

        it('returns true if address is valid and not already in list', () => {
            isAddressSpy.mockReturnValue(true);
            isAddressEqualSpy.mockReturnValue(false);

            const addressOne = '0xbbb';
            const addressTwo = '0xccc';
            const members: ITokenSetupMembershipMember[] = [{ address: addressOne }, { address: addressTwo }];

            const result = addressesListUtils.validateAddress(addressTwo, members, 1);

            expect(result).toBeTruthy();
            expect(isAddressSpy).toHaveBeenCalledWith(addressTwo);
            expect(isAddressEqualSpy).toHaveBeenCalledWith(addressOne, addressTwo);
        });
    });
});
