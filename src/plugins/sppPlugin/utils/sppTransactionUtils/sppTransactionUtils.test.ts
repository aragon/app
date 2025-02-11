import { ProcessStageType, ProposalCreationMode } from '@/modules/createDao/components/createProcessForm';
import {
    generateCreateProcessFormBody,
    generateCreateProcessFormData,
    generateCreateProcessFormStage,
} from '@/modules/createDao/testUtils/generators/createProcessFormData';
import { createProposalUtils } from '@/modules/governance/utils/createProposalUtils';
import { sppPlugin } from '@/plugins/sppPlugin/constants/sppPlugin';
import { Network } from '@/shared/api/daoService';
import { generateDao } from '@/shared/testUtils';
import { generatePluginSetupData } from '@/shared/testUtils/generators/pluginSetupData';
import { permissionTransactionUtils } from '@/shared/utils/permissionTransactionUtils';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import * as Viem from 'viem';
import { zeroHash } from 'viem';
import { sppPluginAbi, sppPluginSetupAbi } from './sppPluginAbi';
import { sppTransactionUtils } from './sppTransactionUtils';

jest.mock('viem', () => ({ __esModule: true, ...jest.requireActual<typeof Viem>('viem') }));

describe('sppTransaction utils', () => {
    const encodeAbiParametersSpy = jest.spyOn(Viem, 'encodeAbiParameters');
    const grantPermissionSpy = jest.spyOn(permissionTransactionUtils, 'buildGrantPermissionTransaction');
    const revokePermissionSpy = jest.spyOn(permissionTransactionUtils, 'buildRevokePermissionTransaction');
    const buildPrepareInstallationDataSpy = jest.spyOn(pluginTransactionUtils, 'buildPrepareInstallationData');
    const encodeFunctionDataSpy = jest.spyOn(Viem, 'encodeFunctionData');
    const parseStartDateSpy = jest.spyOn(createProposalUtils, 'parseStartDate');

    afterEach(() => {
        encodeAbiParametersSpy.mockReset();
        grantPermissionSpy.mockReset();
        revokePermissionSpy.mockReset();
        encodeFunctionDataSpy.mockReset();
        buildPrepareInstallationDataSpy.mockReset();
        parseStartDateSpy.mockReset();
    });

    describe('buildInstallPluginsActions', () => {
        const setupDataToActionsSpy = jest.spyOn(pluginTransactionUtils, 'setupDataToActions');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const buildUpdateStagesTransactionSpy = jest.spyOn(sppTransactionUtils as any, 'buildUpdateStagesTransaction');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const buildUpdateRulesTransactionSpy = jest.spyOn(sppTransactionUtils as any, 'buildUpdateRulesTransaction');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const buildBodyPermissionActionsSpy = jest.spyOn(sppTransactionUtils as any, 'buildBodyPermissionActions');

        afterEach(() => {
            setupDataToActionsSpy.mockReset();
            buildUpdateStagesTransactionSpy.mockReset();
            buildUpdateRulesTransactionSpy.mockReset();
            buildBodyPermissionActionsSpy.mockReset();
        });

        afterAll(() => {
            setupDataToActionsSpy.mockRestore();
            buildUpdateStagesTransactionSpy.mockRestore();
            buildUpdateRulesTransactionSpy.mockRestore();
            buildBodyPermissionActionsSpy.mockRestore();
        });

        it('correctly builds the install actions for plugins', () => {
            const values = generateCreateProcessFormData();
            const setupData = [generatePluginSetupData(), generatePluginSetupData()];
            const dao = generateDao({ address: '0x123', network: Network.ETHEREUM_SEPOLIA });
            const daoAddress = dao.address as Viem.Hex;

            const grantAction = { to: daoAddress, data: '0xgrant' as Viem.Hex, value: '0' };
            const setupActions = [{ to: '0x001' as Viem.Hex, data: '0xsetup' as Viem.Hex, value: '0' }];
            const updateStagesAction = { to: '0x002', data: '0xstages', value: '0' };
            const updateRulesAction = { to: '0x003', data: '0xrules', value: '0' };
            const bodyPermissionActions = [{ to: daoAddress, data: '0xbody' as Viem.Hex, value: '0' }];
            const revokeAction = { to: daoAddress, data: '0xrevoke' as Viem.Hex, value: '0' };

            grantPermissionSpy.mockReturnValueOnce(grantAction);
            setupDataToActionsSpy.mockReturnValueOnce(setupActions);
            buildUpdateStagesTransactionSpy.mockReturnValueOnce(updateStagesAction);
            buildUpdateRulesTransactionSpy.mockReturnValueOnce(updateRulesAction);
            buildBodyPermissionActionsSpy.mockReturnValueOnce(bodyPermissionActions);
            revokePermissionSpy.mockReturnValueOnce(revokeAction);

            const result = sppTransactionUtils.buildInstallPluginsActions(values, setupData, dao);

            const expected = [
                grantAction,
                ...setupActions,
                updateStagesAction,
                updateRulesAction,
                ...bodyPermissionActions,
                revokeAction,
            ];

            expect(result).toEqual(expected);
        });
    });

    describe('buildCreateProposalData', () => {
        it('encodes createProposal data with correct parameters', () => {
            const startDate = 12345;
            parseStartDateSpy.mockReturnValue(startDate);

            const params = {
                metadata: '0xmetadata' as const,
                actions: [{ to: '0xAddress', data: '0xdata', value: '0' }],
                values: {
                    title: 'Proposal Title',
                    summary: 'Proposal Summary',
                    description: 'Proposal Description',
                    addActions: false,
                    resources: [],
                    actions: [],
                    startTimeMode: 'fixed' as const,
                    endTimeMode: 'duration' as const,
                },
                title: 'Proposal Title',
                description: 'Proposal Description',
                addActions: false,
                permissions: {
                    proposalCreationMode: ProposalCreationMode.ANY_WALLET,
                    proposalCreationBodies: [{ bodyId: 'body1', minVotingPower: '0' }],
                },
            };
            encodeFunctionDataSpy.mockReturnValue('0xEncodedData');

            const result = sppTransactionUtils.buildCreateProposalData(params);
            expect(Viem.encodeFunctionData).toHaveBeenCalledWith({
                abi: sppPluginAbi,
                functionName: 'createProposal',
                args: [params.metadata, params.actions, BigInt(0), startDate, [[]]],
            });
            expect(result).toBe('0xEncodedData');
        });
    });

    describe('buildPrepareSppInstallData', () => {
        it('builds prepare installation data correctly', () => {
            const metadataCid = '0xmetadataCID';
            const network = Network.BASE_MAINNET;
            const dao = generateDao({ address: '0xDAOAddress', network });
            const expectedTarget = { target: dao.address as Viem.Hex, operation: 0 };

            // Stub dependencies with hardcoded return values.
            encodeAbiParametersSpy.mockReturnValue('0xPluginSettingsData');
            buildPrepareInstallationDataSpy.mockReturnValue('0xTransactionData');

            const result = sppTransactionUtils.buildPreparePluginInstallData(metadataCid, dao);

            // Verify encodeAbiParameters is called with the expected parameters.
            expect(encodeAbiParametersSpy).toHaveBeenCalledWith(sppPluginSetupAbi, [
                metadataCid as Viem.Hex,
                [],
                [],
                expectedTarget,
            ]);

            // Verify buildPrepareInstallationData is called with expected arguments.
            expect(buildPrepareInstallationDataSpy).toHaveBeenCalledWith(
                sppPlugin.repositoryAddresses[network],
                sppPlugin.installVersion,
                '0xPluginSettingsData',
                dao.address as Viem.Hex,
            );

            expect(result).toBe('0xTransactionData');
        });
    });

    describe('buildBodyPermissionActions', () => {
        it('correctly builds permission actions for the bodies of the SPP', () => {
            const pluginData = generatePluginSetupData({ pluginAddress: '0x123' });
            const daoAddress = '0xDao' as Viem.Hex;
            const sppAddress = '0xSpp' as Viem.Hex;

            const revokeCreateProposalAction = { to: daoAddress, data: '0xrevoke-proposal' as Viem.Hex, value: '0' };
            const revokeExecutePermissionAction = { to: daoAddress, data: '0xrevoke-execute' as Viem.Hex, value: '0' };
            const grantAction = { to: daoAddress, data: '0xgrant' as Viem.Hex, value: '0' };

            revokePermissionSpy
                .mockReturnValueOnce(revokeCreateProposalAction)
                .mockReturnValueOnce(revokeExecutePermissionAction);
            grantPermissionSpy.mockReturnValueOnce(grantAction);

            const result = sppTransactionUtils['buildBodyPermissionActions'](pluginData, daoAddress, sppAddress);
            expect(result).toEqual([revokeCreateProposalAction, grantAction, revokeExecutePermissionAction]);

            expect(revokePermissionSpy).toHaveBeenNthCalledWith(1, {
                where: pluginData.pluginAddress,
                who: sppTransactionUtils['anyAddress'],
                what: sppTransactionUtils['permissionIds'].createProposalPermission,
                to: daoAddress,
            });
            expect(revokePermissionSpy).toHaveBeenNthCalledWith(2, {
                where: daoAddress,
                who: pluginData.pluginAddress,
                what: sppTransactionUtils['permissionIds'].executePermission,
                to: daoAddress,
            });
            expect(grantPermissionSpy).toHaveBeenCalledWith({
                where: pluginData.pluginAddress,
                who: sppAddress,
                what: sppTransactionUtils['permissionIds'].createProposalPermission,
                to: daoAddress,
            });
        });
    });

    describe('buildUpdateRulesTransaction', () => {
        const buildRuleConditionsSpy = jest.spyOn(permissionTransactionUtils, 'buildRuleConditions');

        it('returns undefined when proposalCreationMode is ANY_WALLET', () => {
            const permissions = { proposalCreationMode: ProposalCreationMode.ANY_WALLET, proposalCreationBodies: [] };
            const values = generateCreateProcessFormData({ permissions });
            const result = sppTransactionUtils['buildUpdateRulesTransaction'](values, generatePluginSetupData(), []);
            expect(result).toBeUndefined();
        });

        it('correctly builds the update rules transaction', () => {
            const sppAllowedBody = generateCreateProcessFormBody({ id: 'body-1' });
            const sppNotAllowedBody = generateCreateProcessFormBody({ id: 'body-2' });
            const sppStage = generateCreateProcessFormStage({ bodies: [sppAllowedBody, sppNotAllowedBody] });
            const values = generateCreateProcessFormData({
                stages: [sppStage],
                permissions: {
                    proposalCreationBodies: [{ bodyId: sppAllowedBody.id }],
                    proposalCreationMode: ProposalCreationMode.LISTED_BODIES,
                },
            });

            const sppSetupData = generatePluginSetupData({
                preparedSetupData: { helpers: ['0xSppRuleCondition'], permissions: [] },
            });

            const pluginSetupData = [
                generatePluginSetupData({ preparedSetupData: { helpers: ['0x0'], permissions: [] } }),
                generatePluginSetupData({ preparedSetupData: { helpers: ['0x1'], permissions: [] } }),
            ];

            const expectedConditionRules = [{ id: 202, op: 1, value: '0xTestBodyCondition', permissionId: zeroHash }];
            buildRuleConditionsSpy.mockReturnValueOnce(expectedConditionRules);

            const updateRulesTxData = '0xUpdateRulesTxData';
            encodeFunctionDataSpy.mockReturnValueOnce(updateRulesTxData);

            const result = sppTransactionUtils['buildUpdateRulesTransaction'](values, sppSetupData, pluginSetupData);

            expect(buildRuleConditionsSpy).toHaveBeenCalledWith(['0x0'], []);

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
            const sppBody = generateCreateProcessFormBody();
            const sppStage = generateCreateProcessFormStage({ bodies: [sppBody] });
            const values = generateCreateProcessFormData({ stages: [sppStage] });
            const transactionData = '0xupdate-stages';

            const timing = {
                voteDuration: BigInt(86400),
                minAdvance: BigInt(86400),
                maxAdvance: sppTransactionUtils['defaultMaxAdvance'],
            };
            processStageTimingSpy.mockReturnValueOnce(timing);

            const thresholds = { approvalThreshold: 1, vetoThreshold: 0 };
            processStageApprovalsSpy.mockReturnValueOnce(thresholds);

            encodeFunctionDataSpy.mockReturnValueOnce(transactionData);

            const sppAddress = '0xSpp';
            const pluginAddresses = ['0x01'] as Viem.Hex[];
            const result = sppTransactionUtils['buildUpdateStagesTransaction'](values, sppAddress, pluginAddresses);

            const expectedProcessedBodies = [
                { addr: pluginAddresses[0], resultType: 1, isManual: false, tryAdvance: true },
            ];
            const expectedProcessedStages = [
                { bodies: expectedProcessedBodies, ...thresholds, ...timing, cancelable: false, editable: false },
            ];

            expect(encodeFunctionDataSpy).toHaveBeenCalledWith({
                abi: sppPluginAbi,
                functionName: 'updateStages',
                args: [expectedProcessedStages],
            });

            expect(result).toEqual({ to: sppAddress, data: transactionData, value: '0' });
        });
    });

    describe('processStageApprovals', () => {
        it('returns the correct approvals for a timelock stage', () => {
            const result = sppTransactionUtils['processStageApprovals'](1, ProcessStageType.TIMELOCK);
            expect(result).toEqual({ approvalThreshold: 0, vetoThreshold: 0 });
        });

        it('returns the correct approvals for a normal stage', () => {
            const requiredApprovals = 3;
            const result = sppTransactionUtils['processStageApprovals'](requiredApprovals, ProcessStageType.NORMAL);
            expect(result).toEqual({ approvalThreshold: requiredApprovals, vetoThreshold: 0 });
        });

        it('returns the correct approvals for a optimistic stage', () => {
            const requiredApprovals = 2;
            const result = sppTransactionUtils['processStageApprovals'](requiredApprovals, ProcessStageType.OPTIMISTIC);
            expect(result).toEqual({ approvalThreshold: 0, vetoThreshold: requiredApprovals });
        });
    });

    describe('processStageTiming', () => {
        it('returns vote duration as 0 when stageType is TIMELOCK', () => {
            const timing = { votingPeriod: { days: 1, hours: 0, minutes: 0 }, earlyStageAdvance: false };
            const stageType = ProcessStageType.TIMELOCK;
            const result = sppTransactionUtils['processStageTiming'](timing, stageType);
            expect(result.voteDuration).toBe(BigInt(0));
        });

        it('correctly processes the voting period to seconds for non timelock stages', () => {
            const timing = { votingPeriod: { days: 1, hours: 0, minutes: 0 }, earlyStageAdvance: false };
            const stageType = ProcessStageType.NORMAL;
            const result = sppTransactionUtils['processStageTiming'](timing, stageType);
            expect(result.voteDuration).toBe(BigInt(86400)); // One day in seconds
        });

        it('returns minAdvance as 0 when earlyStageAdvance is true', () => {
            const timing = { votingPeriod: { days: 1, hours: 0, minutes: 0 }, earlyStageAdvance: true };
            const stageType = ProcessStageType.NORMAL;
            const result = sppTransactionUtils['processStageTiming'](timing, stageType);
            expect(result.minAdvance).toBe(BigInt(0));
        });

        it('returns minAdvance as the voting period when earlyStageAdvance is false', () => {
            const timing = { votingPeriod: { days: 0, hours: 12, minutes: 0 }, earlyStageAdvance: false };
            const result = sppTransactionUtils['processStageTiming'](timing, ProcessStageType.OPTIMISTIC);
            expect(result.minAdvance).toBe(BigInt(43200));
        });

        it('returns a big default max advance when stage expiration is not set', () => {
            const timing = {
                votingPeriod: { days: 0, hours: 12, minutes: 0 },
                earlyStageAdvance: false,
                stageExpiration: undefined,
            };
            const result = sppTransactionUtils['processStageTiming'](timing, ProcessStageType.OPTIMISTIC);
            expect(result.maxAdvance).toEqual(sppTransactionUtils['defaultMaxAdvance']);
        });

        it('returns the max advance set to the vote duration plus the stage expiration when set', () => {
            const timing = {
                votingPeriod: { days: 0, hours: 12, minutes: 0 },
                earlyStageAdvance: false,
                stageExpiration: { days: 0, hours: 0, minutes: 30 },
            };
            const result = sppTransactionUtils['processStageTiming'](timing, ProcessStageType.OPTIMISTIC);
            expect(result.maxAdvance).toEqual(BigInt(45000));
        });
    });
});
