import * as Viem from 'viem';
import { zeroHash } from 'viem';
import { GovernanceType, ProcessStageType, ProposalCreationMode } from '@/modules/createDao/components/createProcessForm';
import {
    generateCreateProcessFormDataAdvanced,
    generateCreateProcessFormStage,
    generateCreateProcessFormStageSettings,
    generateSetupBodyFormData,
    generateSetupBodyFormExisting,
    generateSetupBodyFormExternal,
    generateSetupBodyFormNew,
} from '@/modules/createDao/testUtils';
import { generateCreateProposalEndDateFormData, generateProposalCreate } from '@/modules/governance/testUtils';
import { createProposalUtils } from '@/modules/governance/utils/createProposalUtils';
import { sppPlugin } from '@/plugins/sppPlugin/constants/sppPlugin';
import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { generatePluginInstallationSetupData } from '@/shared/testUtils/generators/pluginSetupData';
import { permissionTransactionUtils } from '@/shared/utils/permissionTransactionUtils';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
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
            const startDate = 12_345;
            const proposal = { ...generateProposalCreate(), ...generateCreateProposalEndDateFormData() };
            const actions: ITransactionRequest[] = [{ to: '0xAddress', data: '0xdata', value: BigInt(0) }];
            const plugin = generateDaoPlugin({
                address: '0x123',
                interfaceType: PluginInterfaceType.SPP,
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
            expect(encodeAbiParametersSpy).toHaveBeenCalledWith(sppPluginSetupAbi, [metadataCid as Viem.Hex, [], [], expectedTarget]);
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
                dao.address as Viem.Hex
            );
        });
    });

    describe('buildPluginsSetupActions', () => {
        const buildUpdateStagesTransactionSpy = jest.spyOn(sppTransactionUtils as any, 'buildUpdateStagesTransaction');

        const buildUpdateRulesTransactionSpy = jest.spyOn(sppTransactionUtils as any, 'buildUpdateRulesTransaction');

        const buildBodyPermissionActionsSpy = jest.spyOn(sppTransactionUtils as any, 'buildBodyPermissionActions');
        const buildGrantSppProposalCreationActionSpy = jest.spyOn(sppTransactionUtils as any, 'buildGrantSppProposalCreationAction');

        afterEach(() => {
            buildUpdateStagesTransactionSpy.mockReset();
            buildUpdateRulesTransactionSpy.mockReset();
            buildBodyPermissionActionsSpy.mockReset();
            buildGrantSppProposalCreationActionSpy.mockReset();
        });

        afterAll(() => {
            buildUpdateStagesTransactionSpy.mockRestore();
            buildUpdateRulesTransactionSpy.mockRestore();
            buildBodyPermissionActionsSpy.mockRestore();
            buildGrantSppProposalCreationActionSpy.mockRestore();
        });

        it('correctly builds the install actions for plugins', () => {
            const values = generateCreateProcessFormDataAdvanced({ governanceType: GovernanceType.ADVANCED });
            const setupData = [generatePluginInstallationSetupData(), generatePluginInstallationSetupData()];
            const dao = generateDao({ address: '0x123', network: Network.ETHEREUM_SEPOLIA });
            const daoAddress = dao.address as Viem.Hex;

            const updateStagesAction = { to: '0x002', data: '0xstages' };
            const updateRulesAction = { to: '0x003', data: '0xrules' };
            const bodyPermissionActions = [{ to: daoAddress, data: '0xbody' as Viem.Hex }];

            buildUpdateStagesTransactionSpy.mockReturnValueOnce(updateStagesAction);
            buildUpdateRulesTransactionSpy.mockReturnValueOnce(updateRulesAction);
            buildBodyPermissionActionsSpy.mockReturnValueOnce(bodyPermissionActions);

            const result = sppTransactionUtils.buildPluginsSetupActions(values, setupData, dao, []);
            expect(result).toEqual([updateStagesAction, updateRulesAction, ...bodyPermissionActions]);
        });

        it('grants SPP proposal creation permission to existing bodies', () => {
            const existingBody = generateSetupBodyFormExisting({
                address: '0xExistingBody',
                canCreateProposal: true,
            });
            const newBody = generateSetupBodyFormNew({ canCreateProposal: true });
            const stage = generateCreateProcessFormStage({ bodies: [newBody, existingBody] });
            const values = generateCreateProcessFormDataAdvanced({
                governanceType: GovernanceType.ADVANCED,
                stages: [stage],
            });

            const setupData = [
                generatePluginInstallationSetupData({ pluginAddress: '0xSpp' }),
                generatePluginInstallationSetupData({ pluginAddress: '0xNewPlugin' }),
            ];
            const dao = generateDao({ address: '0xDao' });

            const updateStagesAction = { to: '0xSpp', data: '0xstages', value: BigInt(0) };
            const updateRulesAction = { to: '0xRuleCondition', data: '0xRules', value: BigInt(0) };
            const bodyPermissionActions = [{ to: '0xDao', data: '0xBody', value: BigInt(0) }];
            const existingBodyPermissionAction = { to: '0xDao', data: '0xExisting', value: BigInt(0) };

            buildUpdateStagesTransactionSpy.mockReturnValueOnce(updateStagesAction);
            buildUpdateRulesTransactionSpy.mockReturnValueOnce(updateRulesAction);
            buildBodyPermissionActionsSpy.mockReturnValueOnce(bodyPermissionActions);
            buildGrantSppProposalCreationActionSpy.mockReturnValueOnce(existingBodyPermissionAction);

            const result = sppTransactionUtils.buildPluginsSetupActions(values, setupData, dao, []);

            expect(buildGrantSppProposalCreationActionSpy).toHaveBeenCalledWith(existingBody.address, dao.address, '0xSpp');

            expect(result).toContain(existingBodyPermissionAction);
        });
    });

    describe('buildBodyPermissionActions', () => {
        it('correctly builds permission actions for the bodies of the SPP', () => {
            const pluginAddress = '0x123';
            const daoAddress = '0xDao' as Viem.Hex;
            const sppAddress = '0xSpp' as Viem.Hex;

            const revokeCreateProposalAction = { to: daoAddress, data: '0xproposal' as Viem.Hex, value: BigInt(0) };
            const revokeExecutePermissionAction = { to: daoAddress, data: '0xexecute' as Viem.Hex, value: BigInt(0) };
            const grantAction = { to: daoAddress, data: '0xgrant' as Viem.Hex, value: BigInt(0) };

            revokePermissionSpy.mockReturnValueOnce(revokeCreateProposalAction).mockReturnValueOnce(revokeExecutePermissionAction);
            grantPermissionSpy.mockReturnValueOnce(grantAction);

            const result = sppTransactionUtils['buildBodyPermissionActions'](pluginAddress, daoAddress, sppAddress);
            expect(result).toEqual([revokeCreateProposalAction, grantAction, revokeExecutePermissionAction]);

            expect(revokePermissionSpy).toHaveBeenNthCalledWith(1, {
                where: pluginAddress,
                who: sppTransactionUtils['anyAddress'],
                what: permissionTransactionUtils.permissionIds.createProposalPermission,
                to: daoAddress,
            });
            expect(revokePermissionSpy).toHaveBeenNthCalledWith(2, {
                where: daoAddress,
                who: pluginAddress,
                what: permissionTransactionUtils.permissionIds.executePermission,
                to: daoAddress,
            });
            expect(grantPermissionSpy).toHaveBeenCalledWith({
                where: pluginAddress,
                who: sppAddress,
                what: permissionTransactionUtils.permissionIds.createProposalPermission,
                to: daoAddress,
            });
        });
    });

    describe('buildGrantSppProposalCreationAction', () => {
        it('correctly builds grant permission action for SPP to create proposals on sub-plugins', () => {
            const bodyAddress = '0xBodyAddress' as Viem.Hex;
            const daoAddress = '0xDao' as Viem.Hex;
            const sppAddress = '0xSpp' as Viem.Hex;

            const grantAction = { to: daoAddress, data: '0xGrant' as Viem.Hex, value: BigInt(0) };
            grantPermissionSpy.mockReturnValueOnce(grantAction);

            const result = sppTransactionUtils['buildGrantSppProposalCreationAction'](bodyAddress, daoAddress, sppAddress);

            expect(grantPermissionSpy).toHaveBeenCalledWith({
                where: bodyAddress,
                who: sppAddress,
                what: permissionTransactionUtils.permissionIds.createProposalPermission,
                to: daoAddress,
            });
            expect(result).toEqual(grantAction);
        });
    });

    describe('buildUpdateRulesTransaction', () => {
        const buildRuleConditionsSpy = jest.spyOn(permissionTransactionUtils, 'buildRuleConditions');

        afterEach(() => {
            buildRuleConditionsSpy.mockReset();
        });

        it('returns undefined when proposalCreationMode is ANY_WALLET', () => {
            const proposalCreationMode = ProposalCreationMode.ANY_WALLET;
            const values = generateCreateProcessFormDataAdvanced({ proposalCreationMode });
            const setupData = generatePluginInstallationSetupData();
            const result = sppTransactionUtils['buildUpdateRulesTransaction'](values, setupData, [], []);
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

            const sppSetupData = generatePluginInstallationSetupData({
                preparedSetupData: { helpers: ['0xSppRuleCondition'], permissions: [] },
            });

            const pluginSetupData = [
                generatePluginInstallationSetupData({ preparedSetupData: { helpers: ['0x0'], permissions: [] } }),
                generatePluginInstallationSetupData({ preparedSetupData: { helpers: ['0x1'], permissions: [] } }),
            ];

            const expectedConditionRules = [{ id: 202, op: 1, value: '0xTestBodyCondition', permissionId: zeroHash }];
            buildRuleConditionsSpy.mockReturnValueOnce(expectedConditionRules);

            const updateRulesTxData = '0xUpdateRulesTxData';
            encodeFunctionDataSpy.mockReturnValueOnce(updateRulesTxData);

            const result = sppTransactionUtils['buildUpdateRulesTransaction'](values, sppSetupData, pluginSetupData, []);

            expect(buildRuleConditionsSpy).toHaveBeenCalledWith(['0x0'], []);

            expect(encodeFunctionDataSpy).toHaveBeenCalledWith({
                abi: sppPluginAbi,
                functionName: 'updateRules',
                args: [expectedConditionRules],
            });

            const expectedTransaction = { to: '0xSppRuleCondition', data: updateRulesTxData, value: BigInt(0) };
            expect(result).toEqual(expectedTransaction);
        });

        it('includes proposalCreationConditionAddress for existing bodies in rule conditions', () => {
            const existingBody = generateSetupBodyFormExisting({
                canCreateProposal: true,
                proposalCreationConditionAddress: '0xConditionAddress',
            });
            const newBody = generateSetupBodyFormNew({ canCreateProposal: true });
            const stage = generateCreateProcessFormStage({ bodies: [newBody, existingBody] });
            const values = generateCreateProcessFormDataAdvanced({
                stages: [stage],
                proposalCreationMode: ProposalCreationMode.LISTED_BODIES,
            });

            const sppSetupData = generatePluginInstallationSetupData({
                preparedSetupData: { helpers: ['0xSppRuleCondition'], permissions: [] },
            });

            const pluginSetupData = [
                generatePluginInstallationSetupData({
                    preparedSetupData: { helpers: ['0xNewCondition'], permissions: [] },
                }),
            ];

            const expectedConditionRules = [{ id: 202, op: 1, value: '0xConditions', permissionId: zeroHash }];
            buildRuleConditionsSpy.mockReturnValueOnce(expectedConditionRules);

            const updateRulesTxData = '0xUpdateRulesTxData';
            encodeFunctionDataSpy.mockReturnValueOnce(updateRulesTxData);

            const result = sppTransactionUtils['buildUpdateRulesTransaction'](values, sppSetupData, pluginSetupData, []);

            // Should include both existing condition address and new condition address
            expect(buildRuleConditionsSpy).toHaveBeenCalledWith(
                ['0xConditionAddress', '0xNewCondition'], // All condition addresses combined
                []
            );

            expect(result).toBeDefined();
        });

        it('handles mix of existing and new bodies with different canCreateProposal settings', () => {
            const existingBodyCanCreate = generateSetupBodyFormExisting({
                canCreateProposal: true,
                proposalCreationConditionAddress: '0xConditionAddress1',
            });
            const existingBodyCannotCreate = generateSetupBodyFormExisting({
                canCreateProposal: false,
                proposalCreationConditionAddress: '0xConditionAddress2',
            });
            const newBodyCanCreate = generateSetupBodyFormNew({ canCreateProposal: true });
            const newBodyCannotCreate = generateSetupBodyFormNew({ canCreateProposal: false });

            const stage = generateCreateProcessFormStage({
                bodies: [existingBodyCanCreate, existingBodyCannotCreate, newBodyCanCreate, newBodyCannotCreate],
            });
            const values = generateCreateProcessFormDataAdvanced({
                stages: [stage],
                proposalCreationMode: ProposalCreationMode.LISTED_BODIES,
            });

            const sppSetupData = generatePluginInstallationSetupData({
                preparedSetupData: { helpers: ['0xSppRuleCondition'], permissions: [] },
            });

            const pluginSetupData = [
                generatePluginInstallationSetupData({
                    preparedSetupData: { helpers: ['0xNewCondition1'], permissions: [] },
                }),
                generatePluginInstallationSetupData({
                    preparedSetupData: { helpers: ['0xNewCondition2'], permissions: [] },
                }),
            ];

            const expectedConditionRules = [{ id: 202, op: 1, value: '0xConditions', permissionId: zeroHash }];
            buildRuleConditionsSpy.mockReturnValueOnce(expectedConditionRules);

            const updateRulesTxData = '0xUpdateRulesTxData';
            encodeFunctionDataSpy.mockReturnValueOnce(updateRulesTxData);

            sppTransactionUtils['buildUpdateRulesTransaction'](values, sppSetupData, pluginSetupData, []);

            // Should only include condition addresses for bodies that can create proposals
            // Existing body conditions are always included (filtering happens at UI level)
            // New body conditions are filtered by canCreateProposal in the implementation
            expect(buildRuleConditionsSpy).toHaveBeenLastCalledWith(
                [existingBodyCanCreate.proposalCreationConditionAddress, '0xNewCondition1'],
                []
            );
        });

        it('includes safeConditionAddresses in the condition rules', () => {
            const newBody = generateSetupBodyFormNew({ canCreateProposal: true });
            const stage = generateCreateProcessFormStage({ bodies: [newBody] });
            const values = generateCreateProcessFormDataAdvanced({
                stages: [stage],
                proposalCreationMode: ProposalCreationMode.LISTED_BODIES,
            });

            const sppSetupData = generatePluginInstallationSetupData({
                preparedSetupData: { helpers: ['0xSppRuleCondition'], permissions: [] },
            });

            const pluginSetupData = [
                generatePluginInstallationSetupData({
                    preparedSetupData: { helpers: ['0xNewCondition'], permissions: [] },
                }),
            ];

            const safeConditionAddresses = ['0xSafeCondition1', '0xSafeCondition2'] as Viem.Hex[];

            const expectedConditionRules = [{ id: 202, op: 1, value: '0xConditions', permissionId: zeroHash }];
            buildRuleConditionsSpy.mockReturnValueOnce(expectedConditionRules);

            const updateRulesTxData = '0xUpdateRulesTxData';
            encodeFunctionDataSpy.mockReturnValueOnce(updateRulesTxData);

            const result = sppTransactionUtils['buildUpdateRulesTransaction'](
                values,
                sppSetupData,
                pluginSetupData,
                safeConditionAddresses
            );

            // Should include new body condition addresses and safe condition addresses
            expect(buildRuleConditionsSpy).toHaveBeenCalledWith(['0xNewCondition', '0xSafeCondition1', '0xSafeCondition2'], []);

            expect(result).toBeDefined();
        });
    });

    describe('buildUpdateStagesTransaction', () => {
        const processStageTimingSpy = jest.spyOn(sppTransactionUtils as any, 'processStageTiming');

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
            const externalBody = generateSetupBodyFormExternal({ address: '0xExternal' });
            const existingBody = generateSetupBodyFormExisting({ address: '0xExisting' });
            const sppStage = generateCreateProcessFormStage({
                internalId: '0',
                bodies: [sppBody, externalBody, existingBody],
            });
            const transactionData = '0xupdate-stages';

            const timing = {
                voteDuration: BigInt(86_400),
                minAdvance: BigInt(86_400),
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
                { addr: existingBody.address, resultType: 1, isManual: false, tryAdvance: true },
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
            const result = sppTransactionUtils['processStageApprovals'](1, ProcessStageType.NORMAL, []);
            expect(result).toEqual({ approvalThreshold: 0, vetoThreshold: 0 });
        });

        it('returns the correct approvals for a normal stage', () => {
            const requiredApprovals = 3;
            const body = generateSetupBodyFormData();
            const result = sppTransactionUtils['processStageApprovals'](requiredApprovals, ProcessStageType.NORMAL, [body]);
            expect(result).toEqual({ approvalThreshold: requiredApprovals, vetoThreshold: 0 });
        });

        it('returns the correct approvals for a optimistic stage', () => {
            const requiredApprovals = 2;
            const body = generateSetupBodyFormData();
            const result = sppTransactionUtils['processStageApprovals'](requiredApprovals, ProcessStageType.OPTIMISTIC, [body]);
            expect(result).toEqual({ approvalThreshold: 0, vetoThreshold: requiredApprovals });
        });
    });

    describe('processStageTiming', () => {
        it('correctly processes the voting period to seconds', () => {
            const settings = generateCreateProcessFormStageSettings({
                votingPeriod: { days: 1, hours: 0, minutes: 0 },
                earlyStageAdvance: false,
            });
            const result = sppTransactionUtils['processStageTiming'](settings, []);
            expect(result.voteDuration).toBe(BigInt(86_400)); // One day in seconds
        });

        it('returns minAdvance as 0 when earlyStageAdvance is true', () => {
            const settings = generateCreateProcessFormStageSettings({
                votingPeriod: { days: 1, hours: 0, minutes: 0 },
                earlyStageAdvance: true,
            });
            const body = generateSetupBodyFormData();
            const result = sppTransactionUtils['processStageTiming'](settings, [body]);
            expect(result.minAdvance).toBe(BigInt(0));
        });

        it('returns minAdvance as the voting period when earlyStageAdvance is false', () => {
            const settings = generateCreateProcessFormStageSettings({
                votingPeriod: { days: 0, hours: 12, minutes: 0 },
                earlyStageAdvance: false,
            });
            const result = sppTransactionUtils['processStageTiming'](settings, []);
            expect(result.minAdvance).toBe(BigInt(43_200));
        });

        it('returns a big default max advance when stage expiration is not set', () => {
            const settings = generateCreateProcessFormStageSettings({
                votingPeriod: { days: 0, hours: 12, minutes: 0 },
                earlyStageAdvance: false,
                stageExpiration: undefined,
            });
            const result = sppTransactionUtils['processStageTiming'](settings, []);
            expect(result.maxAdvance).toEqual(sppTransactionUtils['defaultMaxAdvance']);
        });

        it('returns the max advance set to the vote duration plus the stage expiration when set', () => {
            const settings = generateCreateProcessFormStageSettings({
                votingPeriod: { days: 0, hours: 12, minutes: 0 },
                earlyStageAdvance: false,
                stageExpiration: { days: 0, hours: 0, minutes: 30 },
            });
            const result = sppTransactionUtils['processStageTiming'](settings, []);
            expect(result.maxAdvance).toEqual(BigInt(45_000));
        });
    });
});
