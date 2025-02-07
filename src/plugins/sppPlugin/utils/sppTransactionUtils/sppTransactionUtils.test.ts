import { ProcessStageType, ProposalCreationMode } from '@/modules/createDao/components/createProcessForm';
import { generateCreateProcessFormData } from '@/shared/testUtils/generators/createProcessFormData';
import { generatePluginSetupData } from '@/shared/testUtils/generators/pluginSetupData';
import { generatePluginSetupDataPermission } from '@/shared/testUtils/generators/pluginSetupDataPermission';
import type { IPluginSetupData } from '@/shared/types/pluginSetupData';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import * as Viem from 'viem';
import { encodeFunctionData, zeroHash, type Hex } from 'viem';
import { sppPluginAbi } from './sppPluginAbi';
import { sppTransactionUtils } from './sppTransactionUtils';

jest.mock('viem', () => ({ __esModule: true, ...jest.requireActual<typeof Viem>('viem') }));

describe('SppTransactionUtils', () => {
    const encodeFunctionDataSpy = jest.spyOn(Viem, 'encodeFunctionData');

    afterEach(() => {
        encodeFunctionDataSpy.mockReset();
    });

    describe('buildUpdateRulesTransaction', () => {
        const values = generateCreateProcessFormData({
            stages: [
                {
                    name: 'Stage name',
                    type: ProcessStageType.NORMAL,
                    timing: { votingPeriod: { days: 1, hours: 0, minutes: 0 }, earlyStageAdvance: false },
                    requiredApprovals: 1,
                    bodies: [
                        {
                            id: 'body1',
                            name: 'body1',
                            resources: [],
                            governanceType: 'multisig',
                            members: [],
                            tokenType: 'new',
                            supportThreshold: 1,
                            minimumParticipation: 1,
                            voteChange: false,
                            multisigThreshold: 1,
                        },
                    ],
                },
            ],
            permissions: {
                proposalCreationBodies: [{ bodyId: 'body1' }],
                proposalCreationMode: ProposalCreationMode.LISTED_BODIES,
            },
        });

        const setupData = [
            generatePluginSetupData(),
            generatePluginSetupData({ preparedSetupData: { permissions: [], helpers: ['0xTestBodyCondition'] } }),
        ];

        it('returns undefined when proposalCreationMode is ANY_WALLET', () => {
            const values = generateCreateProcessFormData();
            const setupData = [generatePluginSetupData()];

            const result = sppTransactionUtils.buildUpdateRulesTransaction(values, setupData);

            expect(result).toBeUndefined();
        });

        it('calls the encodeDataFunction with the correct params', () => {
            encodeFunctionDataSpy.mockReturnValueOnce('0xUpdateRulesData');

            sppTransactionUtils.buildUpdateRulesTransaction(values, setupData);

            expect(encodeFunctionData).toHaveBeenCalledWith(
                expect.objectContaining({
                    abi: sppPluginAbi,
                    functionName: 'updateRules',
                    // See PermissionTransactionUtils for ruleConditionId and ruleConditionOperator
                    args: [
                        [
                            {
                                id: 202,
                                op: 1,
                                value: '0xTestBodyCondition',
                                permissionId: zeroHash,
                            },
                        ],
                    ],
                }),
            );
        });

        it('builds update rules transaction correctly when proposalCreationMode is LISTED_BODIES', () => {
            encodeFunctionDataSpy.mockReturnValueOnce('0xUpdateRulesData');

            const result = sppTransactionUtils.buildUpdateRulesTransaction(values, setupData);

            expect(result).toEqual({
                to: setupData[0].preparedSetupData.helpers[0],
                data: '0xUpdateRulesData',
                value: '0',
            });
        });
    });

    describe('buildInstallActions', () => {
        const buildApplyInstallSpy = jest.spyOn(pluginTransactionUtils, 'buildApplyInstallationTransactions');
        const buildUpdateStagesSpy = jest.spyOn(sppTransactionUtils, 'buildUpdateStagesTransaction');
        const buildUpdateRulesSpy = jest.spyOn(sppTransactionUtils, 'buildUpdateRulesTransaction');

        afterEach(() => {
            buildApplyInstallSpy.mockReset();
            buildUpdateStagesSpy.mockReset();
            buildUpdateRulesSpy.mockReset();
        });

        it('builds install actions correctly', () => {
            const daoAddress = '0x123';

            const testValues = generateCreateProcessFormData();

            const setupData: IPluginSetupData[] = [
                generatePluginSetupData({
                    pluginSetupRepo: '0xRepo1' as Hex,
                    pluginAddress: '0xPlugin1' as Hex,
                    preparedSetupData: {
                        permissions: [generatePluginSetupDataPermission()],
                        helpers: ['0xHelper1'] as readonly Hex[],
                    },
                }),
                generatePluginSetupData({
                    pluginSetupRepo: '0xRepo2' as Hex,
                    pluginAddress: '0xPlugin2' as Hex,
                    preparedSetupData: {
                        permissions: [generatePluginSetupDataPermission()],
                        helpers: ['0xHelper2'] as readonly Hex[],
                    },
                }),
            ];

            const applyInstallationActions = [{ to: '0xApplyTo' as Hex, data: '0xApplyData' as Hex, value: '0' }];
            const updateStagesAction = { to: '0xStagesTo' as Hex, data: '0xStagesData' as Hex, value: '0' };
            const updateRulesAction = { to: '0xRulesTo' as Hex, data: '0xRulesData' as Hex, value: '0' };

            buildApplyInstallSpy.mockReturnValue(applyInstallationActions);
            buildUpdateStagesSpy.mockReturnValue(updateStagesAction);
            buildUpdateRulesSpy.mockReturnValue(updateRulesAction);

            encodeFunctionDataSpy.mockImplementation((params) => {
                const fnName = params.functionName ?? 'unknown';
                return `0x${fnName}TxData`;
            });

            const actions = sppTransactionUtils.buildInstallActions(testValues, setupData, daoAddress);

            const expectedGrantMultiTargetAction = { to: daoAddress, data: '0xgrantTxData', value: '0' };
            const expectedRevokePluginCreateProposalAction = { to: daoAddress, data: '0xrevokeTxData', value: '0' };
            const expectedGrantSppCreateProposalAction = { to: daoAddress, data: '0xgrantTxData', value: '0' };
            const expectedRevokeExecutePermission = { to: daoAddress, data: '0xrevokeTxData', value: '0' };
            const expectedRevokeMultiTargetAction = { to: daoAddress, data: '0xrevokeTxData', value: '0' };

            const expectedActions = [
                expectedGrantMultiTargetAction,
                ...applyInstallationActions,
                updateStagesAction,
                updateRulesAction,
                expectedRevokePluginCreateProposalAction,
                expectedGrantSppCreateProposalAction,
                expectedRevokeExecutePermission,
                expectedRevokeMultiTargetAction,
            ];

            expect(actions).toEqual(expectedActions);
            expect(buildApplyInstallSpy).toHaveBeenCalledWith(setupData, daoAddress);
            expect(buildUpdateStagesSpy).toHaveBeenCalledWith(
                testValues,
                setupData.map((data) => data.pluginAddress),
            );
            expect(buildUpdateRulesSpy).toHaveBeenCalledWith(testValues, setupData);
        });
    });
});
