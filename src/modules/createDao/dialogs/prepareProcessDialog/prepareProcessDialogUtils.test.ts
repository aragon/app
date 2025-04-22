import { sppTransactionUtils } from '@/plugins/sppPlugin/utils/sppTransactionUtils';
import { Network } from '@/shared/api/daoService';
import { generateDao, generatePluginSetupData } from '@/shared/testUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import { type ITransactionRequest, transactionUtils } from '@/shared/utils/transactionUtils';
import { type Hex } from 'viem';
import { GovernanceType } from '../../components/createProcessForm';
import {
    generateCreateProcessFormData,
    generateCreateProcessFormDataAdvanced,
    generateCreateProcessFormDataBasic,
    generateCreateProcessFormStage,
    generateSetupBodyFormData,
    generateSetupBodyFormNew,
} from '../../testUtils';
import { prepareProcessDialogUtils } from './prepareProcessDialogUtils';
import type { IBuildProcessProposalActionsParams } from './prepareProcessDialogUtils.api';

describe('prepareProcessDialog utils', () => {
    const cidToHexSpy = jest.spyOn(transactionUtils, 'cidToHex');
    const getSlotFunctionSpy = jest.spyOn(pluginRegistryUtils, 'getSlotFunction');

    afterEach(() => {
        cidToHexSpy.mockReset();
        getSlotFunctionSpy.mockReset();
    });

    describe('buildPrepareProcessTransaction', () => {
        const encodeTransactionRequestsSpy = jest.spyOn(transactionUtils, 'encodeTransactionRequests');
        const buildPrepareInstallProcessorActionDataSpy = jest.spyOn(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            prepareProcessDialogUtils as any,
            'buildPrepareInstallProcessorActionData',
        );

        const buildPrepareInstallPluginsActionDataSpy = jest.spyOn(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            prepareProcessDialogUtils as any,
            'buildPrepareInstallPluginsActionData',
        );

        beforeEach(() => {
            buildPrepareInstallProcessorActionDataSpy.mockReturnValue('');
            buildPrepareInstallPluginsActionDataSpy.mockReturnValue([]);
            encodeTransactionRequestsSpy.mockReturnValue({ data: '0x1', to: '0x1', value: BigInt(0) });
        });

        afterEach(() => {
            buildPrepareInstallProcessorActionDataSpy.mockReset();
            buildPrepareInstallPluginsActionDataSpy.mockReset();
            encodeTransactionRequestsSpy.mockReset();
        });

        afterAll(() => {
            buildPrepareInstallProcessorActionDataSpy.mockRestore();
            buildPrepareInstallPluginsActionDataSpy.mockRestore();
        });

        it('builds the prepare install action of the processor when processor metadata is set', async () => {
            const values = generateCreateProcessFormData();
            const dao = generateDao({ network: Network.ARBITRUM_MAINNET });
            const processMetadata = { processor: 'metadataTest', plugins: [], proposal: '' };
            const installProcessorActionData = '0x0000';
            buildPrepareInstallProcessorActionDataSpy.mockReturnValue(installProcessorActionData);

            await prepareProcessDialogUtils.buildPrepareProcessTransaction({ values, dao, processMetadata });
            expect(buildPrepareInstallProcessorActionDataSpy).toHaveBeenCalledWith(processMetadata.processor, dao);
            expect(encodeTransactionRequestsSpy).toHaveBeenCalledWith(
                [expect.objectContaining({ data: installProcessorActionData, value: BigInt(0) })],
                dao.network,
            );
        });

        it('does not build the prepare install action for the processor when processor metadata is not set', async () => {
            const values = generateCreateProcessFormData();
            const dao = generateDao();
            const processMetadata = { plugins: [], proposal: '' };
            await prepareProcessDialogUtils.buildPrepareProcessTransaction({ values, dao, processMetadata });
            expect(buildPrepareInstallProcessorActionDataSpy).not.toHaveBeenCalled();
        });

        it('builds the action data for each plugin and maps it to an action', async () => {
            const values = generateCreateProcessFormData();
            const dao = generateDao();
            const processMetadata = { plugins: ['meta'], proposal: '' };
            const encodedTransaction: ITransactionRequest = { to: '0x123', data: '0x01', value: BigInt(0) };
            buildPrepareInstallPluginsActionDataSpy.mockReturnValue(['0x01', '0x02']);
            encodeTransactionRequestsSpy.mockReturnValue(encodedTransaction);

            const result = await prepareProcessDialogUtils.buildPrepareProcessTransaction({
                values,
                dao,
                processMetadata,
            });

            expect(buildPrepareInstallPluginsActionDataSpy).toHaveBeenCalledWith({
                values,
                dao,
                pluginsMetadata: processMetadata.plugins,
            });
            expect(result).toEqual(encodedTransaction);
        });
    });

    describe('preparePluginMetadata', () => {
        it('maps the plugin form body to metadata', () => {
            const pluginResources = [{ name: 'resource', url: 'resource.com' }];
            const plugin = generateSetupBodyFormNew({ name: '1', description: '2', resources: pluginResources });
            const result = prepareProcessDialogUtils['preparePluginMetadata'](plugin);
            expect(result).toEqual({ name: plugin.name, description: plugin.description, links: plugin.resources });
        });
    });

    describe('prepareProcessorMetadata', () => {
        it('builds the metadata for the processor plugin', () => {
            const stageOne = generateCreateProcessFormStage({ name: 'Stage1' });
            const stageTwo = generateCreateProcessFormStage({ name: 'Stage2' });
            const resources = [{ name: 'Link', url: 'http://example.com' }];
            const values = generateCreateProcessFormDataAdvanced({
                name: 'process',
                description: 'description',
                resources,
                processKey: 'PPP',
                stages: [stageOne, stageTwo],
            });
            const result = prepareProcessDialogUtils['prepareProcessorMetadata'](values);
            expect(result).toEqual({
                name: values.name,
                description: values.description,
                links: resources,
                processKey: values.processKey,
                stageNames: [stageOne.name, stageTwo.name],
            });
        });
    });

    describe('buildPrepareInstallProcessorActionData', () => {
        const buildPreparePluginInstallDataSpy = jest.spyOn(sppTransactionUtils, 'buildPreparePluginInstallData');

        afterEach(() => {
            buildPreparePluginInstallDataSpy.mockReset();
        });

        it('transform the metadata hash to hex and returns the action build by the SPP utility', () => {
            const metadata = 'metadataHash';
            const metadataHex = 'metadataHex' as Hex;
            const dao = generateDao();
            const transactionData = '0xdata';
            buildPreparePluginInstallDataSpy.mockReturnValue(transactionData);
            cidToHexSpy.mockReturnValue(metadataHex);
            const result = prepareProcessDialogUtils['buildPrepareInstallProcessorActionData'](metadata, dao);
            expect(buildPreparePluginInstallDataSpy).toHaveBeenCalledWith(metadataHex, dao);
            expect(result).toEqual(transactionData);
        });
    });

    describe('buildPrepareInstallPluginsActionData', () => {
        const buildPrepareInstallPluginActionDataSpy = jest.spyOn(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            prepareProcessDialogUtils as any,
            'buildPrepareInstallPluginActionData',
        );

        afterEach(() => {
            buildPrepareInstallPluginActionDataSpy.mockReset();
        });

        afterAll(() => {
            buildPrepareInstallPluginActionDataSpy.mockRestore();
        });

        it('builds the prepare install action of all plugins', () => {
            const bodies = [
                generateSetupBodyFormData({ internalId: '0x1' }),
                generateSetupBodyFormData({ internalId: '0x2' }),
            ];
            const values = generateCreateProcessFormData({ stages: [generateCreateProcessFormStage({ bodies })] });
            const dao = generateDao();
            const pluginsMetadata = ['metadata1', 'metadata2'];
            const actionsData = ['0x1', '0x2'];
            buildPrepareInstallPluginActionDataSpy
                .mockReturnValueOnce(actionsData[0])
                .mockReturnValueOnce(actionsData[1]);

            const params = { values, dao, pluginsMetadata };
            const result = prepareProcessDialogUtils['buildPrepareInstallPluginsActionData'](params);

            bodies.forEach((body, index) => {
                const metadataCid = pluginsMetadata[index];
                const expectedParams = { body, dao, metadataCid };
                expect(buildPrepareInstallPluginActionDataSpy).toHaveBeenNthCalledWith(index + 1, expectedParams);
            });
            expect(result).toEqual(actionsData);
        });

        it('passes the stage voting period to the build install action function when bodies are setup inside stages', () => {
            const votingPeriod = { days: 7, hours: 0, minutes: 0 };
            const body = generateSetupBodyFormData();
            const stage = generateCreateProcessFormStage({
                timing: { votingPeriod, earlyStageAdvance: false },
                bodies: [body],
            });
            const values = generateCreateProcessFormData({ governanceType: GovernanceType.ADVANCED, stages: [stage] });

            const params = { values, dao: generateDao(), pluginsMetadata: [''] };
            prepareProcessDialogUtils['buildPrepareInstallPluginsActionData'](params);

            expect(buildPrepareInstallPluginActionDataSpy).toHaveBeenCalledWith(
                expect.objectContaining({ stageVotingPeriod: votingPeriod }),
            );
        });
    });

    describe('buildPrepareInstallPluginActionData', () => {
        it('triggers the plugin-specific prepare transaction function to build the plugin install data', () => {
            const metadataCid = 'metadataCid';
            const metadata = 'metadataHex' as Hex;
            const dao = generateDao();
            const body = generateSetupBodyFormNew({ plugin: 'multisig' });
            const transactionData = '0xdata';
            const prepareTransactionMock = jest.fn(() => transactionData);
            getSlotFunctionSpy.mockReturnValue(prepareTransactionMock);
            cidToHexSpy.mockReturnValue(metadata);

            const params = { metadataCid, dao, body };
            const result = prepareProcessDialogUtils['buildPrepareInstallPluginActionData'](params);
            expect(getSlotFunctionSpy).toHaveBeenCalledWith(expect.objectContaining({ pluginId: body.plugin }));
            expect(prepareTransactionMock).toHaveBeenCalledWith({ metadata, dao, body, stageVotingPeriod: undefined });
            expect(result).toEqual(transactionData);
        });
    });

    describe('preparePublishProcessProposalMetadata', () => {
        it('returns the metadata for the publish process proposal', () => {
            const result = prepareProcessDialogUtils.preparePublishProcessProposalMetadata();
            expect(result.title).toEqual(prepareProcessDialogUtils['publishProcessProposalMetadata'].title);
            expect(result.summary).toEqual(prepareProcessDialogUtils['publishProcessProposalMetadata'].summary);
        });
    });

    describe('buildPublishProcessProposalActions', () => {
        const buildApplyPluginsInstallationActionsSpy = jest.spyOn(
            pluginTransactionUtils,
            'buildApplyPluginsInstallationActions',
        );

        const createTestParams = (
            params?: Partial<IBuildProcessProposalActionsParams>,
        ): IBuildProcessProposalActionsParams => ({
            values: generateCreateProcessFormData(),
            dao: generateDao(),
            setupData: [generatePluginSetupData()],
            ...params,
        });

        it('builds the apply-installation actions and passes them to the create proposal plugin function', () => {
            const dao = generateDao();
            const setupData = [generatePluginSetupData()];
            const values = generateCreateProcessFormDataBasic();
            const installPluginActions = [{ to: '0x123' as Hex, data: '0x' as Hex, value: BigInt(11) }];

            buildApplyPluginsInstallationActionsSpy.mockReturnValue(installPluginActions);

            const result = prepareProcessDialogUtils.buildPublishProcessProposalActions(
                createTestParams({ dao, values, setupData }),
            );

            expect(buildApplyPluginsInstallationActionsSpy).toHaveBeenCalledWith({ dao, setupData, actions: [] });
            expect(result).toEqual(installPluginActions);
        });
    });
});
