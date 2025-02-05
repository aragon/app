import { daoAbi } from '@/modules/createDao/dialogs/publishProcessDialog/abi/daoAbi';
import { encodeFunctionData, type Hex, keccak256, toBytes, zeroHash } from 'viem';
import { permissionTransactionUtils } from '../permissionTransactionUtils';
import type { IConditionRule } from './permissionTransactionUtils';

jest.mock('viem', () => ({
    keccak256: jest.fn(),
    encodeFunctionData: jest.fn(),
    toBytes: jest.fn(),
}));

describe('PermissionTransactionUtils', () => {
    describe('buildGrantPermissionTransaction', () => {
        it('returns a transaction object with correct data for grant', () => {
            const params = {
                where: '0xWhere' as Hex,
                who: '0xWho' as Hex,
                what: 'what',
                to: '0xTo' as Hex,
            };

            (toBytes as jest.Mock).mockReturnValueOnce('0xBytesTest');
            (keccak256 as jest.Mock).mockReturnValueOnce('0xGrantHash');

            (encodeFunctionData as jest.Mock).mockReturnValueOnce('0xGrantTxData');

            const tx = permissionTransactionUtils.buildGrantPermissionTransaction(params);

            expect(encodeFunctionData).toHaveBeenCalledWith(
                expect.objectContaining({
                    abi: daoAbi,
                    functionName: 'grant',
                    args: [params.where, params.who, '0xGrantHash'],
                }),
            );

            const expectedTransaction = { to: params.to, data: '0xGrantTxData', value: '0' };

            expect(tx).toEqual(expectedTransaction);
        });
    });

    describe('buildRevokePermissionTransaction', () => {
        it('returns a transaction object with correct data for revoke', () => {
            const params = {
                where: '0xWhere' as Hex,
                who: '0xWho' as Hex,
                what: 'what',
                to: '0xTo' as Hex,
            };

            (toBytes as jest.Mock).mockReturnValueOnce('0xBytesTest');
            (keccak256 as jest.Mock).mockReturnValueOnce('0xRevokeHash');

            (encodeFunctionData as jest.Mock).mockReturnValueOnce('0xRevokeTxData');

            const tx = permissionTransactionUtils.buildRevokePermissionTransaction(params);

            expect(encodeFunctionData).toHaveBeenCalledWith(
                expect.objectContaining({
                    abi: daoAbi,
                    functionName: 'revoke',
                    args: [params.where, params.who, '0xRevokeHash'],
                }),
            );

            expect(tx).toEqual({ to: params.to, data: '0xRevokeTxData', value: '0' });
        });
    });

    describe('buildCreateProposalRuleConditions', () => {
        it('returns original conditionRules if conditionAddresses is empty', () => {
            const conditionRules = [{ id: 1, op: 1, value: '0x123', permissionId: '0x456' }];
            const result = permissionTransactionUtils.buildCreateProposalRuleConditions([], conditionRules);
            expect(result).toEqual(conditionRules);
        });

        it('returns conditionRules with one added condition if conditionAddresses has one element', () => {
            const conditionRules: IConditionRule[] = [];
            const conditionAddress = '0xConditionAddress';
            const result = permissionTransactionUtils.buildCreateProposalRuleConditions(
                [conditionAddress],
                conditionRules,
            );

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
            const conditionRules: IConditionRule[] = [];
            const addresses = ['0x123', '0x456'];
            const results = permissionTransactionUtils.buildCreateProposalRuleConditions(
                [...addresses],
                conditionRules,
            );

            const ruleConditionId = permissionTransactionUtils['ruleConditionId'];
            const ruleConditionOperator = permissionTransactionUtils['ruleConditionOperator'];

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
