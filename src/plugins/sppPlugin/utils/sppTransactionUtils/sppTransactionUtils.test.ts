import {
    type ICreateProcessFormData,
    ProcessStageType,
    ProposalCreationMode,
} from '@/modules/createDao/components/createProcessForm';
import { generatePluginSetupData } from '@/shared/testUtils/generators/pluginSetupData';
import { encodeFunctionData, zeroHash } from 'viem';
import { sppPluginAbi } from './sppPluginAbi';
import { sppTransactionUtils } from './sppTransactionUtils';

jest.mock('viem', () => ({
    encodeFunctionData: jest.fn(),
}));

describe('SppTransactionUtils', () => {
    describe('buildUpdateRulesTransaction', () => {
        it('returns undefined when proposalCreationMode is ANY_WALLET', () => {
            const values: ICreateProcessFormData = {
                name: 'Process name',
                processKey: 'KEY',
                description: 'description',
                resources: [],
                stages: [],
                permissions: {
                    proposalCreationBodies: [],
                    proposalCreationMode: ProposalCreationMode.ANY_WALLET,
                },
            };
            const setupData = [generatePluginSetupData()];

            const result = sppTransactionUtils.buildUpdateRulesTransaction(values, setupData);
            expect(result).toBeUndefined();
        });

        it('builds update rules transaction correctly when proposalCreationMode is LISTED_BODIES', () => {
            const values: ICreateProcessFormData = {
                name: 'Process name',
                processKey: 'KEY',
                description: 'description',
                resources: [],
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
            };

            const setupData = [
                generatePluginSetupData(),
                generatePluginSetupData({ preparedSetupData: { permissions: [], helpers: ['0xTestBodyCondition'] } }),
            ];

            (encodeFunctionData as jest.Mock).mockReturnValueOnce('0xUpdateRulesData');

            const result = sppTransactionUtils.buildUpdateRulesTransaction(values, setupData);

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
            expect(result).toEqual({
                to: setupData[0].preparedSetupData.helpers[0],
                data: '0xUpdateRulesData',
                value: '0',
            });
        });
    });
});
