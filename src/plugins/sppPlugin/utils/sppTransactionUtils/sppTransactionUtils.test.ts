import {
    GovernanceType,
    ProcessStageType,
    ProposalCreationMode,
} from '@/modules/createDao/components/createProcessForm';
import {
    generateCreateProcessFormDataAdvanced,
    generateCreateProcessFormStage,
    generateSetupBodyFormData,
    generateSetupBodyFormExternal,
    generateSetupBodyFormNew,
} from '@/modules/createDao/testUtils';
import { generateCreateProposalEndDateFormData, generateProposalCreate } from '@/modules/governance/testUtils';
import { createProposalUtils } from '@/modules/governance/utils/createProposalUtils';
import { sppPlugin } from '@/plugins/sppPlugin/constants/sppPlugin';
import { Network } from '@/shared/api/daoService';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { generatePluginSetupData } from '@/shared/testUtils/generators/pluginSetupData';
import { permissionTransactionUtils } from '@/shared/utils/permissionTransactionUtils';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import * as Viem from 'viem';
import { zeroHash } from 'viem';
import { generateSppPluginSettings } from '../../testUtils';
import { sppPluginAbi, sppPluginSetupAbi } from './sppPluginAbi';
import { sppTransactionUtils } from './sppTransactionUtils';

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

    describe('buildCreateProposalData', () => {
        it('encodes createProposal data with correct parameters', () => {
            const transactionData = '0xencoded';
            const startDate = 12345;
            const proposal = { ...generateProposalCreate(), ...generateCreateProposalEndDateFormData() };
            const actions: ITransactionRequest[] = [{ to: '0xAddress', data: '0xdata', value: BigInt(0) }];
            const plugin = generateDaoPlugin({
                address: '0x123',
                subdomain: 'spp',
                settings: generateSppPluginSettings(),
            });
            parseStartDateSpy.mockReturnValue(startDate);

            const params = { metadata: '0xmetadata' as Viem.Hex, actions, proposal, plugin };
            encodeFunctionDataSpy.mockReturnValue(transactionData);

            const result = sppTransactionUtils.buildCreateProposalData(params);
            expect(result).toBe(transactionData);
            expect(encodeFunctionDataSpy).toHaveBeenCalledWith({
                abi: sppPluginAbi,
                functionName: 'createProposal',
                args: [params.metadata, params.actions, BigInt(0), startDate, [[]]],
            });
        });
    });

    describe('buildPreparePluginInstallData', () => {
        it('encodes the plugin settings correctly using encodeAbiParameters', () => {
            const metadataCid = '0xMetadataCID';
            const dao = generateDao({ address: '0xDAOAddress' });

            encodeAbiParametersSpy.mockReturnValue('0xPluginSettingsData');
            sppTransactionUtils.buildPreparePluginInstallData(metadataCid, dao);

            const expectedTarget = { target: dao.address as Viem.Hex, operation: 0 };
            expect(encodeAbiParametersSpy).toHaveBeenCalledWith(sppPluginSetupAbi, [
                metadataCid as Viem.Hex,
                [],
                [],
                expectedTarget,
            ]);
        });

        it('builds prepare installation data correctly using buildPrepareInstallationData', () => {
            const metadataCid = '0xMetadataCID';
            const network = Network.BASE_MAINNET;
            const dao = generateDao({ address: '0xDAOAddress', network });

            const pluginSettingsData = '0xPluginSettingsData';
            const transactionData = '0xTransactionData';

            encodeAbiParametersSpy.mockReturnValue(pluginSettingsData);
            buildPrepareInstallationDataSpy.mockReturnValue(transactionData);

            const result = sppTransactionUtils.buildPreparePluginInstallData(metadataCid, dao);
            expect(result).toEqual(transactionData);
            expect(buildPrepareInstallationDataSpy).toHaveBeenCalledWith(
                sppPlugin.repositoryAddresses[network],
                sppPlugin.installVersion,
                pluginSettingsData,
                dao.address as Viem.Hex,
            );
        });
    });

    describe('buildPluginsSetupActions', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const buildUpdateStagesTransactionSpy = jest.spyOn(sppTransactionUtils as any, 'buildUpdateStagesTransaction');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const buildUpdateRulesTransactionSpy = jest.spyOn(sppTransactionUtils as any, 'buildUpdateRulesTransaction');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const buildBodyPermissionActionsSpy = jest.spyOn(sppTransactionUtils as any, 'buildBodyPermissionActions');

        afterEach(() => {
            buildUpdateStagesTransactionSpy.mockReset();
            buildUpdateRulesTransactionSpy.mockReset();
            buildBodyPermissionActionsSpy.mockReset();
        });

        afterAll(() => {
            buildUpdateStagesTransactionSpy.mockRestore();
            buildUpdateRulesTransactionSpy.mockRestore();
            buildBodyPermissionActionsSpy.mockRestore();
        });

        it('correctly builds the install actions for plugins', () => {
            const values = generateCreateProcessFormDataAdvanced({ governanceType: GovernanceType.ADVANCED });
            const setupData = [generatePluginSetupData(), generatePluginSetupData()];
            const dao = generateDao({ address: '0x123', network: Network.ETHEREUM_SEPOLIA });
            const daoAddress = dao.address as Viem.Hex;

            const updateStagesAction = { to: '0x002', data: '0xstages' };
            const updateRulesAction = { to: '0x003', data: '0xrules' };
            const bodyPermissionActions = [{ to: daoAddress, data: '0xbody' as Viem.Hex }];

            buildUpdateStagesTransactionSpy.mockReturnValueOnce(updateStagesAction);
            buildUpdateRulesTransactionSpy.mockReturnValueOnce(updateRulesAction);
            buildBodyPermissionActionsSpy.mockReturnValueOnce(bodyPermissionActions);

            const result = sppTransactionUtils.buildPluginsSetupActions(values, setupData, dao);
            expect(result).toEqual([updateStagesAction, updateRulesAction, ...bodyPermissionActions]);
        });
    });

    describe('buildBodyPermissionActions', () => {
        it('correctly builds permission actions for the bodies of the SPP', () => {
            const pluginData = generatePluginSetupData({ pluginAddress: '0x123' });
            const daoAddress = '0xDao' as Viem.Hex;
            const sppAddress = '0xSpp' as Viem.Hex;

            const revokeCreateProposalAction = { to: daoAddress, data: '0xproposal' as Viem.Hex, value: BigInt(0) };
            const revokeExecutePermissionAction = { to: daoAddress, data: '0xexecute' as Viem.Hex, value: BigInt(0) };
            const grantAction = { to: daoAddress, data: '0xgrant' as Viem.Hex, value: BigInt(0) };

            revokePermissionSpy
                .mockReturnValueOnce(revokeCreateProposalAction)
                .mockReturnValueOnce(revokeExecutePermissionAction);
            grantPermissionSpy.mockReturnValueOnce(grantAction);

            const result = sppTransactionUtils['buildBodyPermissionActions'](pluginData, daoAddress, sppAddress);
            expect(result).toEqual([revokeCreateProposalAction, grantAction, revokeExecutePermissionAction]);

            expect(revokePermissionSpy).toHaveBeenNthCalledWith(1, {
                where: pluginData.pluginAddress,
                who: sppTransactionUtils['anyAddress'],
                what: permissionTransactionUtils.permissionIds.createProposalPermission,
                to: daoAddress,
            });
            expect(revokePermissionSpy).toHaveBeenNthCalledWith(2, {
                where: daoAddress,
                who: pluginData.pluginAddress,
                what: permissionTransactionUtils.permissionIds.executePermission,
                to: daoAddress,
            });
            expect(grantPermissionSpy).toHaveBeenCalledWith({
                where: pluginData.pluginAddress,
                who: sppAddress,
                what: permissionTransactionUtils.permissionIds.createProposalPermission,
                to: daoAddress,
            });
        });
    });

    describe('buildUpdateRulesTransaction', () => {
        const buildRuleConditionsSpy = jest.spyOn(permissionTransactionUtils, 'buildRuleConditions');

        it('returns undefined when proposalCreationMode is ANY_WALLET', () => {
            const values = generateCreateProcessFormDataAdvanced({
                proposalCreationMode: ProposalCreationMode.ANY_WALLET,
            });
            const result = sppTransactionUtils['buildUpdateRulesTransaction'](values, generatePluginSetupData(), []);
            expect(result).toBeUndefined();
        });

        it('correctly builds the update rules transaction', () => {
            const allowedBody = generateSetupBodyFormNew({ internalId: 'body-1', canCreateProposal: true });
            const notAllowedBody = generateSetupBodyFormNew({ internalId: 'body-2' });
            const externalBody = generateSetupBodyFormExternal();
            const sppStage = generateCreateProcessFormStage({ bodies: [allowedBody, notAllowedBody, externalBody] });
            const values = generateCreateProcessFormDataAdvanced({
                stages: [sppStage],
                proposalCreationMode: ProposalCreationMode.LISTED_BODIES,
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

            const expectedTransaction = { to: '0xSppRuleCondition', data: updateRulesTxData, value: BigInt(0) };
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
            const sppBody = generateSetupBodyFormData();
            const externalBody = generateSetupBodyFormExternal({ address: '0xexternal' });
            const sppStage = generateCreateProcessFormStage({ internalId: '0', bodies: [sppBody, externalBody] });
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
            const result = sppTransactionUtils['buildUpdateStagesTransaction']([sppStage], sppAddress, pluginAddresses);

            const expectedProcessedBodies = [
                { addr: pluginAddresses[0], resultType: 1, isManual: false, tryAdvance: true },
                { addr: externalBody.address, resultType: 1, isManual: true, tryAdvance: true },
            ];
            const expectedProcessedStages = [
                { bodies: expectedProcessedBodies, ...thresholds, ...timing, cancelable: false, editable: false },
            ];

            expect(encodeFunctionDataSpy).toHaveBeenCalledWith({
                abi: sppPluginAbi,
                functionName: 'updateStages',
                args: [expectedProcessedStages],
            });

            expect(result).toEqual({ to: sppAddress, data: transactionData, value: BigInt(0) });
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
        it('correctly processes the voting period to seconds', () => {
            const timing = { votingPeriod: { days: 1, hours: 0, minutes: 0 }, earlyStageAdvance: false };
            const result = sppTransactionUtils['processStageTiming'](timing);
            expect(result.voteDuration).toBe(BigInt(86400)); // One day in seconds
        });

        it('returns minAdvance as 0 when earlyStageAdvance is true', () => {
            const timing = { votingPeriod: { days: 1, hours: 0, minutes: 0 }, earlyStageAdvance: true };
            const result = sppTransactionUtils['processStageTiming'](timing);
            expect(result.minAdvance).toBe(BigInt(0));
        });

        it('returns minAdvance as the voting period when earlyStageAdvance is false', () => {
            const timing = { votingPeriod: { days: 0, hours: 12, minutes: 0 }, earlyStageAdvance: false };
            const result = sppTransactionUtils['processStageTiming'](timing);
            expect(result.minAdvance).toBe(BigInt(43200));
        });

        it('returns a big default max advance when stage expiration is not set', () => {
            const timing = {
                votingPeriod: { days: 0, hours: 12, minutes: 0 },
                earlyStageAdvance: false,
                stageExpiration: undefined,
            };
            const result = sppTransactionUtils['processStageTiming'](timing);
            expect(result.maxAdvance).toEqual(sppTransactionUtils['defaultMaxAdvance']);
        });

        it('returns the max advance set to the vote duration plus the stage expiration when set', () => {
            const timing = {
                votingPeriod: { days: 0, hours: 12, minutes: 0 },
                earlyStageAdvance: false,
                stageExpiration: { days: 0, hours: 0, minutes: 30 },
            };
            const result = sppTransactionUtils['processStageTiming'](timing);
            expect(result.maxAdvance).toEqual(BigInt(45000));
        });
    });
});
