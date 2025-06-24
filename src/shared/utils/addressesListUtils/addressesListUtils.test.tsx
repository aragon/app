import type { ITokenSetupMembershipMember } from '@/plugins/tokenPlugin/components/tokenSetupMembership';
import type { ICompositeAddress } from '@aragon/gov-ui-kit';
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
            const customValidator = jest.fn().mockReturnValue(true);
            const member: ICompositeAddress = { address: '0xabc' };

            const result = addressesListUtils.validateAddress([], 0, member, 'error', customValidator);

            expect(result).toBeTruthy();
            expect(customValidator).toHaveBeenCalledWith(member);
        });

        it('returns errorNamespace.invalid if address is invalid', () => {
            isAddressSpy.mockReturnValue(false);

            const member: ICompositeAddress = { address: '0xinvalid' };
            const errorNamespace = 'test-one';

            const result = addressesListUtils.validateAddress([], 0, member, errorNamespace);

            expect(result).toBe(`${errorNamespace}.invalid`);
            expect(isAddressSpy).toHaveBeenCalledWith('0xinvalid');
        });

        it('returns errorNamespace.alreadyInList if address is already in list', () => {
            isAddressSpy.mockReturnValue(true);
            isAddressEqualSpy.mockReturnValue(true);

            const members: ITokenSetupMembershipMember[] = [{ address: '0xaaa' }];
            const member: ICompositeAddress = { address: '0xaaa' };
            const errorNamespace = 'test-two';

            const result = addressesListUtils.validateAddress(members, 1, member, errorNamespace);

            expect(result).toBe(`${errorNamespace}.alreadyInList`);
            expect(isAddressSpy).toHaveBeenCalledWith('0xaaa');
            expect(isAddressEqualSpy).toHaveBeenCalledWith('0xaaa', '0xaaa');
        });

        it('returns true if address is valid and not already in list', () => {
            isAddressSpy.mockReturnValue(true);
            isAddressEqualSpy.mockReturnValue(false);

            const members: ITokenSetupMembershipMember[] = [{ address: '0xaaa' }];
            const member: ICompositeAddress = { address: '0xbbb' };

            const result = addressesListUtils.validateAddress(members, 1, member, 'test-three');

            expect(result).toBeTruthy();
            expect(isAddressSpy).toHaveBeenCalledWith('0xbbb');
            expect(isAddressEqualSpy).toHaveBeenCalledWith('0xaaa', '0xbbb');
        });
    });
});
