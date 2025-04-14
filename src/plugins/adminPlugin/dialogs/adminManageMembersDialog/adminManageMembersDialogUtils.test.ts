import { generateMember } from '@/modules/governance/testUtils';
import { permissionManagerAbi } from '@/shared/utils/permissionTransactionUtils/abi/permissionManagerAbi';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import { addressUtils } from '@aragon/gov-ui-kit';
import type { Hex } from 'viem';
import * as Viem from 'viem';
import { adminTransactionUtils } from '../../utils/adminTransactionUtils';
import { adminManageMembersDialogUtils } from './adminManageMembersDialogUtils';

describe('adminManageMembersDialog utils', () => {
    const encodeFunctionDataSpy = jest.spyOn(Viem, 'encodeFunctionData');
    const cidToHexSpy = jest.spyOn(transactionUtils, 'cidToHex');
    const buildCreateProposalDataSpy = jest.spyOn(adminTransactionUtils, 'buildCreateProposalData');
    const isAddressEqualSpy = jest.spyOn(addressUtils, 'isAddressEqual');

    afterEach(() => {
        encodeFunctionDataSpy.mockReset();
        cidToHexSpy.mockReset();
        buildCreateProposalDataSpy.mockReset();
        isAddressEqualSpy.mockReset();
    });

    describe('prepareProposalMetadata', () => {
        it('returns metadata for the prepare-process proposal', () => {
            const result = adminManageMembersDialogUtils.prepareProposalMetadata();
            expect(result).toEqual(adminManageMembersDialogUtils['proposalMetadata']);
        });
    });

    describe('buildActionsArray', () => {
        it('builds grant and revoke actions correctly', () => {
            const EXECUTE_PROPOSAL_PERMISSION_ID =
                '0xf281525e53675515a6ba7cc7bea8a81e649b3608423ee2d73be1752cea887889' as Hex;

            const currentAdmins = [generateMember({ address: '0x1' }), generateMember({ address: '0x2' })];
            const updatedAdmins = [generateMember({ address: '0x1' }), generateMember({ address: '0x3' })];

            const pluginAddress = '0xPlugin';
            const daoAddress = '0xDao';

            isAddressEqualSpy.mockImplementation((addr1, addr2) => {
                if (addr1 === '0x1' && addr2 === '0x1') {
                    return true;
                }
                return false;
            });

            const encodedRevokeData = '0xrevokeData';
            const encodedGrantData = '0xgrantData';

            encodeFunctionDataSpy.mockReturnValueOnce(encodedGrantData).mockReturnValueOnce(encodedRevokeData);

            const result = adminManageMembersDialogUtils.buildActionsArray({
                currentAdmins,
                updatedAdmins,
                pluginAddress,
                daoAddress,
            });

            const expectedResult = [
                { to: daoAddress, data: encodedGrantData, value: BigInt(0) },
                { to: daoAddress, data: encodedRevokeData, value: BigInt(0) },
            ];

            expect(result).toEqual(expectedResult);

            expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(1, {
                abi: permissionManagerAbi,
                functionName: 'grant',
                args: [pluginAddress, '0x3', EXECUTE_PROPOSAL_PERMISSION_ID],
            });

            expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(2, {
                abi: permissionManagerAbi,
                functionName: 'revoke',
                args: [pluginAddress, '0x2', EXECUTE_PROPOSAL_PERMISSION_ID],
            });
        });
    });
});
