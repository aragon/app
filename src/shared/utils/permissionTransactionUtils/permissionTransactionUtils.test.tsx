import * as Viem from 'viem';
import { encodeFunctionData, type Hex, zeroHash } from 'viem';
import { permissionTransactionUtils } from '../permissionTransactionUtils';
import { permissionManagerAbi } from './abi/permissionManagerAbi';

jest.mock('viem', () => ({ __esModule: true, ...jest.requireActual<typeof Viem>('viem') }));

describe('permissionTransaction utils', () => {
    const keccak256Spy = jest.spyOn(Viem, 'keccak256');
    const encodeFunctionDataSpy = jest.spyOn(Viem, 'encodeFunctionData');
    const toBytesSpy = jest.spyOn(Viem, 'toBytes');

    afterEach(() => {
        keccak256Spy.mockReset();
        encodeFunctionDataSpy.mockReset();
        toBytesSpy.mockReset();
    });

    describe('buildGrantPermissionTransaction', () => {
        it('returns a transaction for granting the specified permission', () => {
            const grantParams = { where: '0x123' as Hex, who: '0x456' as Hex, what: 'what', to: '0x789' as Hex };
            const permissionHash = '0x0000';
            const transactionData = '0x0001';

            toBytesSpy.mockReturnValueOnce(Viem.hexToBytes('0x4279746573'));
            keccak256Spy.mockReturnValueOnce(permissionHash);
            encodeFunctionDataSpy.mockReturnValueOnce(transactionData);

            const transaction = permissionTransactionUtils.buildGrantPermissionTransaction(grantParams);

            expect(toBytesSpy).toHaveBeenCalledWith(grantParams.what);
            expect(encodeFunctionData).toHaveBeenCalledWith({
                abi: permissionManagerAbi,
                functionName: 'grant',
                args: [grantParams.where, grantParams.who, permissionHash],
            });

            const expectedTransaction = { to: grantParams.to, data: transactionData, value: '0' };
            expect(transaction).toEqual(expectedTransaction);
        });
    });

    describe('buildRevokePermissionTransaction', () => {
        it('returns a transaction for revoking the specified permission', () => {
            const grantParams = { where: '0x123' as Hex, who: '0x456' as Hex, what: 'what', to: '0x789' as Hex };
            const permissionHash = '0x0000';
            const transactionData = '0x0001';

            toBytesSpy.mockReturnValueOnce(Viem.hexToBytes('0x4279746573'));
            keccak256Spy.mockReturnValueOnce(permissionHash);
            encodeFunctionDataSpy.mockReturnValueOnce(transactionData);

            const transaction = permissionTransactionUtils.buildRevokePermissionTransaction(grantParams);

            expect(toBytesSpy).toHaveBeenCalledWith(grantParams.what);
            expect(encodeFunctionData).toHaveBeenCalledWith({
                abi: permissionManagerAbi,
                functionName: 'revoke',
                args: [grantParams.where, grantParams.who, permissionHash],
            });

            const expectedTransaction = { to: grantParams.to, data: transactionData, value: '0' };
            expect(transaction).toEqual(expectedTransaction);
        });
    });

    describe('buildRuleConditions', () => {
        it('returns original condition rules if condition addresses array is empty', () => {
            const conditionRules = [{ id: 1, op: 1, value: '0x123', permissionId: '0x456' }];
            const result = permissionTransactionUtils.buildRuleConditions([], conditionRules);

            expect(result).toEqual(conditionRules);
        });

        it('appends the condition address rule to the existing condition rules when having only one condition addres', () => {
            const conditionAddress = '0x123';
            const conditionRules = [{ id: 1, op: 1, value: '0x123', permissionId: '0x456' }];

            const result = permissionTransactionUtils.buildRuleConditions([conditionAddress], conditionRules);
            expect(result[0]).toEqual(conditionRules[0]);
            expect(result[1]).toEqual({ id: 202, op: 1, permissionId: zeroHash, value: conditionAddress });
        });

        it('builds correct ruled conditions for one condition address', () => {
            const conditionAddress = '0x123';
            const result = permissionTransactionUtils.buildRuleConditions([conditionAddress], []);
            expect(result).toEqual([{ id: 202, op: 1, permissionId: zeroHash, value: conditionAddress }]);
        });

        it('builds correct ruled conditions for two condition addresses', () => {
            const conditionAddresses = ['0x123', '0x456'];
            const result = permissionTransactionUtils.buildRuleConditions([...conditionAddresses], []);
            expect(result).toEqual([
                { id: 203, op: 10, permissionId: zeroHash, value: BigInt(8589934593) }, // OR operator on indexes 1 & 2
                { id: 202, op: 1, permissionId: zeroHash, value: conditionAddresses[0] },
                { id: 202, op: 1, permissionId: zeroHash, value: conditionAddresses[1] },
            ]);
        });

        it('builds correct ruled conditions for three condition addresses', () => {
            const conditionAddresses = ['0x123', '0x456', '0x789'];
            const result = permissionTransactionUtils.buildRuleConditions([...conditionAddresses], []);
            expect(result).toEqual([
                { id: 203, op: 10, permissionId: zeroHash, value: BigInt(8589934593) }, // OR operator on indexes 1 & 2
                { id: 203, op: 10, permissionId: zeroHash, value: BigInt(17179869187) }, // OR operator on indexes 3 & 4
                { id: 202, op: 1, permissionId: zeroHash, value: conditionAddresses[0] },
                { id: 202, op: 1, permissionId: zeroHash, value: conditionAddresses[1] },
                { id: 202, op: 1, permissionId: zeroHash, value: conditionAddresses[2] },
            ]);
        });
    });

    describe('encodeLogicalOperator', () => {
        it('encodes two indexes into a uint 240 value', () => {
            expect(permissionTransactionUtils['encodeLogicalOperator'](0, 1)).toEqual(BigInt(4294967296));
            expect(permissionTransactionUtils['encodeLogicalOperator'](1, 2)).toEqual(BigInt(8589934593));
            expect(permissionTransactionUtils['encodeLogicalOperator'](10, 11)).toEqual(BigInt(47244640266));
        });
    });

    describe('addressToCondition', () => {
        it('builds a ruled condition from a condition address', () => {
            const address = '0x111';
            const result = permissionTransactionUtils['addressToCondition'](address);
            expect(result.id).toEqual(202);
            expect(result.op).toEqual(1);
            expect(result.permissionId).toEqual(zeroHash);
            expect(result.value).toEqual(address);
        });
    });
});
