import * as Viem from 'viem';
import { encodeFunctionData, type Hex, zeroHash } from 'viem';
import { permissionTransactionUtils } from '../permissionTransactionUtils';
import { daoAbi } from './abi/daoAbi';
import type { IConditionRule } from './permissionTransactionUtils';

jest.mock('viem', () => ({ __esModule: true, ...jest.requireActual<typeof Viem>('viem') }));

describe('PermissionTransactionUtils', () => {
    const keccak256Spy = jest.spyOn(Viem, 'keccak256');
    const encodeFunctionDataSpy = jest.spyOn(Viem, 'encodeFunctionData');
    const toBytesSpy = jest.spyOn(Viem, 'toBytes');

    afterEach(() => {
        keccak256Spy.mockReset();
        encodeFunctionDataSpy.mockReset();
        toBytesSpy.mockReset();
    });
    describe('buildGrantPermissionTransaction', () => {
        it('returns a transaction object with correct data for grant', () => {
            const grantParams = {
                where: '0xWhere' as Hex,
                who: '0xWho' as Hex,
                what: 'what',
                to: '0xTo' as Hex,
            };

            toBytesSpy.mockReturnValueOnce(Viem.hexToBytes('0x4279746573'));
            keccak256Spy.mockReturnValueOnce('0xGrantHash');
            encodeFunctionDataSpy.mockReturnValueOnce('0xGrantTxData');

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

            toBytesSpy.mockReturnValueOnce(Viem.hexToBytes('0x4279746573'));
            keccak256Spy.mockReturnValueOnce('0xRevokeHash');
            encodeFunctionDataSpy.mockReturnValueOnce('0xRevokeTxData');

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

        it('builds correct rule conditions with multiple conditionAddresses', () => {
            const addresses = ['0x123', '0x456'];
            const results = permissionTransactionUtils.buildCreateProposalRuleConditions([...addresses], []);

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

            // Index is actually baseIndex + 1 so we use 1 and 2 here
            const expectedLogicalValue = BigInt(1) + (BigInt(2) << BigInt(32));

            expect(logicalCondition).toEqual({
                id: ruleConditionId.logicOperation,
                op: ruleConditionOperator.or,
                value: expectedLogicalValue,
                permissionId: zeroHash,
            });
        });
    });
});
