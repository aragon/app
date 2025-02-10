import { ProcessStageType, ProposalCreationMode } from '@/modules/createDao/components/createProcessForm';
import { type Hex, zeroHash } from 'viem';
import * as Viem from 'viem';
import { sppTransactionUtils } from './sppTransactionUtils';
import { generateCreateProcessFormData } from '@/shared/testUtils/generators/createProcessFormData';
import { sppPluginAbi } from './sppPluginAbi';
import { generatePluginSetupData } from '@/shared/testUtils/generators/pluginSetupData';
import { permissionTransactionUtils } from '@/shared/utils/permissionTransactionUtils';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import { generateDao } from '@/shared/testUtils';
import { Network } from '@/shared/api/daoService';

jest.mock('viem', () => ({ __esModule: true, ...jest.requireActual<typeof Viem>('viem') }));

describe('sppTransaction utils', () => {
    const encodeFunctionDataSpy = jest.spyOn(Viem, 'encodeFunctionData');

    afterEach(() => {
        encodeFunctionDataSpy.mockReset();
    });

    describe('buildInstallPluginsActions', () => {
        const grantPermissionSpy = jest.spyOn(permissionTransactionUtils, 'buildGrantPermissionTransaction');
        const setupDataToActionsSpy = jest.spyOn(pluginTransactionUtils, 'setupDataToActions');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const buildUpdateStagesTransactionSpy = jest.spyOn(sppTransactionUtils as any, 'buildUpdateStagesTransaction');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const buildUpdateRulesTransactionSpy = jest.spyOn(sppTransactionUtils as any, 'buildUpdateRulesTransaction');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const buildBodyPermissionActionsSpy = jest.spyOn(sppTransactionUtils as any, 'buildBodyPermissionActions');
        const buildRevokePermissionTransactionSpy = jest.spyOn(
            permissionTransactionUtils,
            'buildRevokePermissionTransaction',
        );
        const installDataToActionSpy = jest.spyOn(pluginTransactionUtils, 'installDataToAction');

        afterEach(() => {
            grantPermissionSpy.mockReset();
            setupDataToActionsSpy.mockReset();
            buildUpdateStagesTransactionSpy.mockReset();
            buildUpdateRulesTransactionSpy.mockReset();
            buildBodyPermissionActionsSpy.mockReset();
            buildRevokePermissionTransactionSpy.mockReset();
            installDataToActionSpy.mockReset();
        });

        afterAll(() => {
            grantPermissionSpy.mockRestore();
            setupDataToActionsSpy.mockRestore();
            buildUpdateStagesTransactionSpy.mockRestore();
            buildUpdateRulesTransactionSpy.mockRestore();
            buildBodyPermissionActionsSpy.mockRestore();
            buildRevokePermissionTransactionSpy.mockRestore();
            installDataToActionSpy.mockRestore();
        });

        it('correctly builds the install actions for plugins', () => {
            const values = generateCreateProcessFormData();
            const setupData = [generatePluginSetupData(), generatePluginSetupData()];
            const dao = generateDao({
                address: '0x0000000000000000000000000000000000000001',
                network: Network.ETHEREUM_SEPOLIA,
            });

            const daoAddress = dao.address as Hex;

            // Mock each utility call to return consistent objects
            grantPermissionSpy.mockReturnValueOnce({ to: daoAddress, data: '0xGrantRootPermissionData', value: '0' });
            setupDataToActionsSpy.mockReturnValueOnce([{ to: '0xApplyTo', data: '0xApplyData', value: '0' }]);
            installDataToActionSpy.mockReturnValueOnce({ to: '0xApplyTo', data: '0xApplyData', value: '0' });
            buildBodyPermissionActionsSpy.mockReturnValueOnce([
                { to: daoAddress, data: '0xBodyPermissionData', value: '0' },
            ]);
            buildUpdateStagesTransactionSpy.mockReturnValueOnce({ to: '0xStagesTo', data: '0xStagesData', value: '0' });
            buildUpdateRulesTransactionSpy.mockReturnValueOnce({ to: '0xRulesTo', data: '0xRulesData', value: '0' });
            // This is the missing piece
            buildRevokePermissionTransactionSpy.mockReturnValueOnce({
                to: daoAddress,
                data: '0xRevokePermissionData',
                value: '0',
            });

            const result = sppTransactionUtils.buildInstallPluginsActions(values, setupData, dao);

            const expected = [
                { to: daoAddress, data: '0xGrantRootPermissionData', value: '0' },
                { to: '0xApplyTo', data: '0xApplyData', value: '0' },
                { to: '0xStagesTo', data: '0xStagesData', value: '0' },
                { to: '0xRulesTo', data: '0xRulesData', value: '0' },
                { to: daoAddress, data: '0xBodyPermissionData', value: '0' },
                { to: daoAddress, data: '0xRevokePermissionData', value: '0' },
            ];

            expect(result).toEqual(expected);
        });
    });

    describe('buildBodyPermissionActions', () => {
        const revokePermissionSpy = jest.spyOn(permissionTransactionUtils, 'buildRevokePermissionTransaction');
        const grantPermissionSpy = jest.spyOn(permissionTransactionUtils, 'buildGrantPermissionTransaction');
        const revokeExecutePermissionSpy = jest.spyOn(permissionTransactionUtils, 'buildRevokePermissionTransaction');

        afterEach(() => {
            revokePermissionSpy.mockReset();
            grantPermissionSpy.mockReset();
            revokeExecutePermissionSpy.mockReset();
        });

        afterAll(() => {
            revokePermissionSpy.mockRestore();
            grantPermissionSpy.mockRestore();
            revokeExecutePermissionSpy.mockRestore();
        });

        it('correctly builds the body permission actions', () => {
            const pluginData = generatePluginSetupData({ pluginAddress: '0xBody' });
            const daoAddress = '0xDao';
            const sppAddress = '0xSpp';

            const revokeData = '0xRevokePluginCreateProposalData';
            const grantData = '0xGrantSppCreateProposalData';
            const revokeExecuteData = '0xrevokeExecuteData';

            revokePermissionSpy.mockReturnValueOnce({ to: daoAddress, data: revokeData, value: '0' });
            grantPermissionSpy.mockReturnValueOnce({ to: daoAddress, data: grantData, value: '0' });
            revokeExecutePermissionSpy.mockReturnValueOnce({ to: daoAddress, data: revokeExecuteData, value: '0' });

            const result = sppTransactionUtils['buildBodyPermissionActions'](pluginData, daoAddress, sppAddress);

            const expectedRevokeAction = { to: daoAddress, data: revokeData, value: '0' };
            const expectedGrantAction = { to: daoAddress, data: grantData, value: '0' };
            const expectedRevokeExecuteAction = { to: daoAddress, data: revokeExecuteData, value: '0' };

            expect(result).toEqual([expectedRevokeAction, expectedGrantAction, expectedRevokeExecuteAction]);
        });
    });

    describe('buildUpdateRulesTransaction', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const processStageTimingSpy = jest.spyOn(sppTransactionUtils as any, 'processStageTiming');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const processStageApprovalsSpy = jest.spyOn(sppTransactionUtils as any, 'processStageApprovals');
        const buildRuleConditionsSpy = jest.spyOn(permissionTransactionUtils, 'buildRuleConditions');

        afterEach(() => {
            processStageTimingSpy.mockReset();
            processStageApprovalsSpy.mockReset();
        });

        afterAll(() => {
            processStageTimingSpy.mockRestore();
            processStageApprovalsSpy.mockRestore();
        });

        it('returns undefined when proposalCreationMode is ANY_WALLET', () => {
            const values = generateCreateProcessFormData();
            const sppSetupData = generatePluginSetupData();
            const pluginSetupData = [generatePluginSetupData()];

            const result = sppTransactionUtils['buildUpdateRulesTransaction'](values, sppSetupData, pluginSetupData);

            expect(result).toBeUndefined();
        });

        it('correctly builds the update rules transaction', () => {
            const values = generateCreateProcessFormData({
                stages: [
                    {
                        name: 'Stage name',
                        type: ProcessStageType.NORMAL,
                        timing: {
                            votingPeriod: { days: 1, hours: 0, minutes: 0 },
                            earlyStageAdvance: false,
                        },
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

            const sppSetupData = generatePluginSetupData({
                preparedSetupData: {
                    helpers: ['0xSppRuleCondition'] as readonly Hex[],
                    permissions: [],
                },
            });
            const pluginSetupData = [
                generatePluginSetupData({
                    preparedSetupData: {
                        helpers: ['0xTestBodyCondition'] as readonly Hex[],
                        permissions: [],
                    },
                }),
            ];

            const expectedConditionRules = [{ id: 202, op: 1, value: '0xTestBodyCondition', permissionId: zeroHash }];

            buildRuleConditionsSpy.mockReturnValueOnce(expectedConditionRules);

            const updateRulesTxData = '0xUpdateRulesTxData';
            encodeFunctionDataSpy.mockReturnValueOnce(updateRulesTxData);

            const result = sppTransactionUtils['buildUpdateRulesTransaction'](values, sppSetupData, pluginSetupData);

            expect(encodeFunctionDataSpy).toHaveBeenCalledWith({
                abi: sppPluginAbi,
                functionName: 'updateRules',
                args: [expectedConditionRules],
            });

            const expectedTransaction = { to: '0xSppRuleCondition', data: updateRulesTxData, value: '0' };

            expect(result).toEqual(expectedTransaction);
        });
    });

    describe('buildUpdateStagesTransaction', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const processStageTimingSpy = jest.spyOn(sppTransactionUtils as any, 'processStageTiming');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const processStageApprovalsSpy = jest.spyOn(sppTransactionUtils as any, 'processStageApprovals');

        afterEach(() => {
            processStageTimingSpy.mockReset();
            processStageApprovalsSpy.mockReset();
        });

        afterAll(() => {
            processStageTimingSpy.mockRestore();
            processStageApprovalsSpy.mockRestore();
        });

        it('correctly builds the update stages transaction', () => {
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

            processStageTimingSpy.mockReturnValueOnce({
                voteDuration: BigInt(86400),
                minAdvance: BigInt(86400),
                maxAdvance: sppTransactionUtils['defaultMaxAdvance'],
            });

            processStageApprovalsSpy.mockReturnValueOnce({ approvalThreshold: 1, vetoThreshold: 0 });

            encodeFunctionDataSpy.mockReturnValueOnce('0xUpdateStagesData');

            const sppAddress = '0xSpp';
            const pluginAddresses = ['0xPlugin1'] as Hex[];

            const result = sppTransactionUtils['buildUpdateStagesTransaction'](values, sppAddress, pluginAddresses);

            const expectedProcessedBodies = [{ addr: '0xPlugin1', resultType: 1, isManual: false, tryAdvance: true }];
            const expectedProcessedStages = [
                {
                    bodies: expectedProcessedBodies,
                    approvalThreshold: 1,
                    vetoThreshold: 0,
                    minAdvance: BigInt(86400),
                    voteDuration: BigInt(86400),
                    maxAdvance: sppTransactionUtils['defaultMaxAdvance'],
                    cancelable: false,
                    editable: false,
                },
            ];

            expect(encodeFunctionDataSpy).toHaveBeenCalledWith({
                abi: sppPluginAbi,
                functionName: 'updateStages',
                args: [expectedProcessedStages],
            });

            expect(result).toEqual({
                to: '0xSpp',
                data: '0xUpdateStagesData',
                value: '0',
            });
        });
    });

    describe('processStageApprovals', () => {
        it('returns the correct approvals for a timelock stage', () => {
            const stageType = ProcessStageType.TIMELOCK;
            const requiredApprovals = 1;

            const result = sppTransactionUtils['processStageApprovals'](requiredApprovals, stageType);

            expect(result.approvalThreshold).toBe(0);
            expect(result.vetoThreshold).toBe(0);
        });

        it('returns the correct approvals for a normal stage', () => {
            const stageType = ProcessStageType.NORMAL;
            const requiredApprovals = 3;

            const result = sppTransactionUtils['processStageApprovals'](requiredApprovals, stageType);

            expect(result.approvalThreshold).toBe(3);
            expect(result.vetoThreshold).toBe(0);
        });

        it('returns the correct approvals for a optimistic stage', () => {
            const stageType = ProcessStageType.OPTIMISTIC;
            const requiredApprovals = 2;

            const result = sppTransactionUtils['processStageApprovals'](requiredApprovals, stageType);

            expect(result.approvalThreshold).toBe(0);
            expect(result.vetoThreshold).toBe(2);
        });
    });

    describe('processStageTiming', () => {
        it('returns voteDuration as 0 when stageType is TIMELOCK', () => {
            const timing = { votingPeriod: { days: 1, hours: 0, minutes: 0 }, earlyStageAdvance: false };
            const stageType = ProcessStageType.TIMELOCK;

            const result = sppTransactionUtils['processStageTiming'](timing, stageType);

            expect(result.voteDuration).toBe(BigInt(0));
        });

        it('correctly processes the voting period to seconds for non timelock stages', () => {
            const ONE_DAY_IN_SECONDS = 86400;
            const timing = { votingPeriod: { days: 1, hours: 0, minutes: 0 }, earlyStageAdvance: false };
            const stageType = ProcessStageType.NORMAL;

            const result = sppTransactionUtils['processStageTiming'](timing, stageType);

            expect(result.voteDuration).toBe(BigInt(ONE_DAY_IN_SECONDS));
        });

        it('returns minAdvance as 0 when earlyStageAdvance is true', () => {
            const timing = { votingPeriod: { days: 1, hours: 0, minutes: 0 }, earlyStageAdvance: true };
            const stageType = ProcessStageType.NORMAL;

            const result = sppTransactionUtils['processStageTiming'](timing, stageType);

            expect(result.minAdvance).toBe(BigInt(0));
        });
    });
});

