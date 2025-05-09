import { sppTransactionUtils } from '@/plugins/sppPlugin/utils/sppTransactionUtils';
import { Network } from '@/shared/api/daoService';
import { generateDao, generatePluginInstallationSetupData } from '@/shared/testUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import { type ITransactionRequest, transactionUtils } from '@/shared/utils/transactionUtils';
import { type Hex } from 'viem';
import {
    generateCreateProcessFormData,
    generateCreateProcessFormDataAdvanced,
    generateCreateProcessFormDataBasic,
    generateCreateProcessFormStage,
    generateSetupBodyFormData,
    generateSetupBodyFormExternal,
    generateSetupBodyFormNew,
} from '../../testUtils';
import { prepareProcessDialogUtils } from './prepareProcessDialogUtils';
import type { IBuildProcessProposalActionsParams } from './prepareProcessDialogUtils.api';

describe('prepareProcessDialog utils', () => {
    const stringToMetadataHexSpy = jest.spyOn(transactionUtils, 'stringToMetadataHex');
    const getSlotFunctionSpy = jest.spyOn(pluginRegistryUtils, 'getSlotFunction');

    afterEach(() => {
        stringToMetadataHexSpy.mockReset();
        getSlotFunctionSpy.mockReset();
    });

    describe('preparePluginsMetadata', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const prepareProcessorMetadataSpy = jest.spyOn(prepareProcessDialogUtils, 'prepareProcessorMetadata' as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const preparePluginMetadataSpy = jest.spyOn(prepareProcessDialogUtils, 'preparePluginMetadata' as any);

        afterEach(() => {
            prepareProcessorMetadataSpy.mockReset();
            preparePluginMetadataSpy.mockReset();
        });

        afterAll(() => {
            prepareProcessorMetadataSpy.mockRestore();
            preparePluginMetadataSpy.mockRestore();
        });

        it('returns the processor metadata as plugins metadata for basic governance type', () => {
            const values = generateCreateProcessFormDataBasic();
            const processorMetadata = { name: 'processor', description: 'processor-description' };
            prepareProcessorMetadataSpy.mockReturnValue(processorMetadata);
            const result = prepareProcessDialogUtils.preparePluginsMetadata(values);
            expect(result).toEqual({ pluginsMetadata: [processorMetadata] });
        });

        it('returns the metadata of the processor and the new plugins for advanced governance type', () => {
            const bodies = [
                generateSetupBodyFormNew({ name: 'new-1' }),
                generateSetupBodyFormExternal(),
                generateSetupBodyFormNew({ name: 'new-2' }),
            ];
            const stage = generateCreateProcessFormStage({ bodies });
            const values = generateCreateProcessFormDataAdvanced({ stages: [stage] });
            const processorMetadata = { name: 'processor', description: 'processor-description' };
            const pluginsMetadata = [{ name: 'new-1' }, { name: 'new-2' }];
            prepareProcessorMetadataSpy.mockReturnValue(processorMetadata);
            preparePluginMetadataSpy.mockReturnValueOnce(pluginsMetadata[0]).mockReturnValueOnce(pluginsMetadata[1]);
            const result = prepareProcessDialogUtils.preparePluginsMetadata(values);
            expect(result).toEqual({ processorMetadata, pluginsMetadata });
        });
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
            stringToMetadataHexSpy.mockReturnValue(metadataHex);
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

        it('buld the prepare install action for the single body when governance type is basic', () => {
            const body = generateSetupBodyFormNew();
            const values = generateCreateProcessFormDataBasic({ body });
            const actionData = '0x1';
            const dao = generateDao();
            const pluginsMetadata = ['metadata1'];
            buildPrepareInstallPluginActionDataSpy.mockReturnValue(actionData);

            const params = { values, dao, pluginsMetadata };
            const result = prepareProcessDialogUtils['buildPrepareInstallPluginsActionData'](params);

            expect(buildPrepareInstallPluginActionDataSpy).toHaveBeenCalledWith({
                body,
                dao,
                metadataCid: pluginsMetadata[0],
            });

            expect(result).toEqual([actionData]);
        });

        it('builds the prepare install action of all new plugins for advanced governance processes', () => {
            const votingPeriod = { days: 7, hours: 0, minutes: 0 };
            const newBodies = [
                generateSetupBodyFormData({ internalId: '0x1' }),
                generateSetupBodyFormData({ internalId: '0x2' }),
            ];
            const stage = generateCreateProcessFormStage({
                bodies: [...newBodies, generateSetupBodyFormNew()],
                timing: { votingPeriod, earlyStageAdvance: false },
            });
            const values = generateCreateProcessFormDataAdvanced({ stages: [stage] });
            const dao = generateDao();
            const pluginsMetadata = ['metadata1', 'metadata2'];
            const actionsData = ['0x1', '0x2'];
            buildPrepareInstallPluginActionDataSpy
                .mockReturnValueOnce(actionsData[0])
                .mockReturnValueOnce(actionsData[1]);

            const params = { values, dao, pluginsMetadata };
            const result = prepareProcessDialogUtils['buildPrepareInstallPluginsActionData'](params);

            newBodies.forEach((body, index) => {
                const metadataCid = pluginsMetadata[index];
                const stageVotingPeriod = votingPeriod;
                const expectedParams = { body: { ...body, stageIndex: 0 }, dao, metadataCid, stageVotingPeriod };
                expect(buildPrepareInstallPluginActionDataSpy).toHaveBeenNthCalledWith(index + 1, expectedParams);
            });
            expect(result).toEqual(actionsData);
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
            stringToMetadataHexSpy.mockReturnValue(metadata);

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
            setupData: [generatePluginInstallationSetupData()],
            ...params,
        });

        it('builds the apply-installation actions and passes them to the create proposal plugin function', () => {
            const dao = generateDao();
            const setupData = [generatePluginInstallationSetupData()];
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
