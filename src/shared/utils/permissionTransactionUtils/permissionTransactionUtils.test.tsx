import { encodeFunctionData, type Hex, keccak256, toBytes, zeroHash } from 'viem';
import { permissionTransactionUtils } from '../permissionTransactionUtils';
import { daoAbi } from './abi/daoAbi';
import type { IConditionRule } from './permissionTransactionUtils';

jest.mock('viem', () => ({
    keccak256: jest.fn(),
    encodeFunctionData: jest.fn(),
    toBytes: jest.fn(),
}));

describe('PermissionTransactionUtils', () => {
    describe('buildGrantPermissionTransaction', () => {
        it('returns a transaction object with correct data for grant', () => {
            const grantParams = {
                where: '0xWhere' as Hex,
                who: '0xWho' as Hex,
                what: 'what',
                to: '0xTo' as Hex,
            };

            (toBytes as jest.Mock).mockReturnValueOnce('0xBytesTest');
            (keccak256 as jest.Mock).mockReturnValueOnce('0xGrantHash');

            (encodeFunctionData as jest.Mock).mockReturnValueOnce('0xGrantTxData');

            const tx = permissionTransactionUtils.buildGrantPermissionTransaction(grantParams);

            expect(encodeFunctionData).toHaveBeenCalledWith(
                expect.objectContaining({
                    abi: daoAbi,
                    functionName: 'grant',
                    args: [grantParams.where, grantParams.who, '0xGrantHash'],
                }),
            );

            const expectedTransaction = { to: grantParams.to, data: '0xGrantTxData', value: '0' };

            expect(tx).toEqual(expectedTransaction);
        });
    });

    describe('buildRevokePermissionTransaction', () => {
        it('returns a transaction object with correct data for revoke', () => {
            const revokeParams = {
                where: '0xWhere' as Hex,
                who: '0xWho' as Hex,
                what: 'what',
                to: '0xTo' as Hex,
            };

            (toBytes as jest.Mock).mockReturnValueOnce('0xBytesTest');
            (keccak256 as jest.Mock).mockReturnValueOnce('0xRevokeHash');

            (encodeFunctionData as jest.Mock).mockReturnValueOnce('0xRevokeTxData');

            const tx = permissionTransactionUtils.buildRevokePermissionTransaction(revokeParams);

            expect(encodeFunctionData).toHaveBeenCalledWith(
                expect.objectContaining({
                    abi: daoAbi,
                    functionName: 'revoke',
                    args: [revokeParams.where, revokeParams.who, '0xRevokeHash'],
                }),
            );

            expect(tx).toEqual({ to: revokeParams.to, data: '0xRevokeTxData', value: '0' });
        });
    });

    describe('buildCreateProposalRuleConditions', () => {
        it('returns original conditionRules if conditionAddresses is empty', () => {
            const conditionRules = [{ id: 1, op: 1, value: '0x123', permissionId: '0x456' }];
            const result = permissionTransactionUtils.buildCreateProposalRuleConditions([], conditionRules);

            expect(result).toEqual(conditionRules);
        });

        it('creates a new condition rule when starting with an empty rules array', () => {
            const conditionAddress = '0xConditionAddress';
            const result = permissionTransactionUtils.buildCreateProposalRuleConditions([conditionAddress], []);

            expect(result).toEqual([
                {
                    id: permissionTransactionUtils['ruleConditionId'].condition,
                    op: permissionTransactionUtils['ruleConditionOperator'].eq,
                    value: conditionAddress,
                    permissionId: zeroHash,
                },
            ]);
        });

        it('handles multiple conditionAddresses', () => {
            const addresses = ['0x123', '0x456'];
            const results = permissionTransactionUtils.buildCreateProposalRuleConditions([...addresses], []);

            const ruleConditionId = {
                condition: 202,
                logicOperation: 203,
            };

            const ruleConditionOperator = {
                eq: 1,
                or: 10,
            };

            const addressConditions = results.filter(
                (result: IConditionRule) => result.id === ruleConditionId.condition,
            );

            expect(addressConditions).toEqual(
                expect.arrayContaining([
                    {
                        id: ruleConditionId.condition,
                        op: ruleConditionOperator.eq,
                        value: addresses[0],
                        permissionId: zeroHash,
                    },
                    {
                        id: ruleConditionId.condition,
                        op: ruleConditionOperator.eq,
                        value: addresses[1],
                        permissionId: zeroHash,
                    },
                ]),
            );

            const logicalCondition = results.find(
                (result: IConditionRule) => result.id === ruleConditionId.logicOperation,
            );

            expect(logicalCondition).toBeDefined();
        });
    });
});
