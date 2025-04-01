import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { sppTransactionUtils } from '@/plugins/sppPlugin/utils/sppTransactionUtils';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import { type Hex } from 'viem';
import {
    generateCreateProcessFormBody,
    generateCreateProcessFormData,
    generateCreateProcessFormStage,
} from '../../testUtils';
import { prepareProcessDialogUtils } from './prepareProcessDialogUtils';
import type { IBuildTransactionParams } from './prepareProcessDialogUtils.api';

describe('prepareProcessDialog utils', () => {
    const cidToHexSpy = jest.spyOn(transactionUtils, 'cidToHex');
    const getSlotFunctionSpy = jest.spyOn(pluginRegistryUtils, 'getSlotFunction');

    afterEach(() => {
        cidToHexSpy.mockReset();
        getSlotFunctionSpy.mockReset();
    });

    describe('prepareProposalMetadata', () => {
        it('returns metadata for the prepare-process proposal', () => {
            const result = prepareProcessDialogUtils.prepareProposalMetadata();
            expect(result).toEqual(prepareProcessDialogUtils['proposalMetadata']);
        });
    });

    describe('preparePluginMetadata', () => {
        it('maps the plugin form body to metadata', () => {
            const pluginResources = [{ name: 'resource', url: 'resource.com' }];
            const plugin = generateCreateProcessFormBody({
                name: 'name',
                description: 'description',
                resources: pluginResources,
            });
            const result = prepareProcessDialogUtils.preparePluginMetadata(plugin);
            expect(result).toEqual({ name: plugin.name, description: plugin.description, links: plugin.resources });
        });
    });

    describe('prepareProcessorMetadata', () => {
        it('builds the metadata for the processor plugin', () => {
            const stageOne = generateCreateProcessFormStage({ name: 'Stage1' });
            const stageTwo = generateCreateProcessFormStage({ name: 'Stage2' });
            const resources = [{ name: 'Link', url: 'http://example.com' }];
            const values = generateCreateProcessFormData({
                name: 'process',
                description: 'description',
                resources,
                processKey: 'PPP',
                stages: [stageOne, stageTwo],
            });
            const result = prepareProcessDialogUtils.prepareProcessorMetadata(values);
            expect(result).toEqual({
                name: values.name,
                description: values.description,
                links: resources,
                processKey: values.processKey,
                stageNames: [stageOne.name, stageTwo.name],
            });
        });
    });

    describe('buildTransaction', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const prepareInstallActionsSpy = jest.spyOn(prepareProcessDialogUtils as any, 'buildPrepareInstallActions');

        beforeEach(() => {
            prepareInstallActionsSpy.mockReturnValue([]);
        });

        afterEach(() => {
            prepareInstallActionsSpy.mockReset();
        });

        afterAll(() => {
            prepareInstallActionsSpy.mockRestore();
        });

        const createTestParams = (params?: Partial<IBuildTransactionParams>): IBuildTransactionParams => ({
            values: generateCreateProcessFormData(),
            dao: generateDao(),
            plugin: generateDaoPlugin(),
            processMetadata: { proposal: 'proposalCID', plugins: ['pluginCID1', 'pluginCID2'] },
            ...params,
        });

        it('converts the metadata CID to hex before passing it to the create proposal plugin function', async () => {
            const metadataCid = 'proposalCID';
            const metadataHex = '0xproposalCID';
            const params = createTestParams({ processMetadata: { proposal: metadataCid, plugins: [] } });
            const slotFunction = jest.fn();

            cidToHexSpy.mockReturnValue(metadataHex);
            getSlotFunctionSpy.mockReturnValue(slotFunction);

            await prepareProcessDialogUtils.buildTransaction(params);

            expect(cidToHexSpy).toHaveBeenCalledWith(metadataCid);
            expect(slotFunction).toHaveBeenCalledWith(expect.objectContaining({ metadata: metadataHex }));
        });

        it('builds the prepare install plugin actions and passes them to the create proposal plugin function', async () => {
            const dao = generateDao();
            const values = generateCreateProcessFormData();
            const installPluginActions = [{ to: '0x123' as Hex, data: '0x' as Hex, value: '11' }];
            const slotFunction = jest.fn();

            prepareInstallActionsSpy.mockReturnValue(installPluginActions);
            getSlotFunctionSpy.mockReturnValue(slotFunction);

            await prepareProcessDialogUtils.buildTransaction(createTestParams({ dao, values }));

            expect(prepareInstallActionsSpy).toHaveBeenCalledWith(expect.objectContaining({ values, dao }));
            expect(slotFunction).toHaveBeenCalledWith(expect.objectContaining({ actions: installPluginActions }));
        });

        it('retrieves and triggers the plugin-specific function for building a create proposal transaction', async () => {
            const plugin = generateDaoPlugin({ subdomain: 'admin' });
            const transactionData = '0x123';
            const buildTransactionFunction = jest.fn(() => transactionData);

            getSlotFunctionSpy.mockReturnValue(buildTransactionFunction);
            const result = await prepareProcessDialogUtils.buildTransaction(createTestParams({ plugin }));

            const slotId = GovernanceSlotId.GOVERNANCE_BUILD_CREATE_PROPOSAL_DATA;
            expect(getSlotFunctionSpy).toHaveBeenCalledWith({ pluginId: plugin.subdomain, slotId });

            expect(result.to).toEqual(plugin.address);
            expect(result.data).toEqual(transactionData);
        });
    });

    describe('buildPrepareInstallActions', () => {
        const installDataToActionSpy = jest.spyOn(pluginTransactionUtils, 'installDataToAction');
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
        });

        afterEach(() => {
            buildPrepareInstallProcessorActionDataSpy.mockReset();
            buildPrepareInstallPluginsActionDataSpy.mockReset();
            installDataToActionSpy.mockReset();
        });

        afterAll(() => {
            buildPrepareInstallProcessorActionDataSpy.mockRestore();
            buildPrepareInstallPluginsActionDataSpy.mockRestore();
        });

        it('builds the prepare install action of the processor when processor metadata is set', () => {
            const values = generateCreateProcessFormData();
            const dao = generateDao();
            const processMetadata = { processor: 'metadataTest', plugins: [], proposal: '' };
            const installProcessorActionData = '0x0000';
            const installProcessorAction = { to: '0x456' as Hex, data: installProcessorActionData as Hex, value: '0' };
            buildPrepareInstallProcessorActionDataSpy.mockReturnValue(installProcessorActionData);
            installDataToActionSpy.mockReturnValue(installProcessorAction);

            const result = prepareProcessDialogUtils['buildPrepareInstallActions']({ values, dao, processMetadata });
            expect(buildPrepareInstallProcessorActionDataSpy).toHaveBeenCalledWith(processMetadata.processor, dao);
            expect(installDataToActionSpy).toHaveBeenCalledWith(installProcessorActionData, dao.network);
            expect(result).toEqual([installProcessorAction]);
        });

        it('does not build the prepare install action for the processor when processor metadata is not set', () => {
            const values = generateCreateProcessFormData();
            const dao = generateDao();
            const processMetadata = { plugins: [], proposal: '' };
            const result = prepareProcessDialogUtils['buildPrepareInstallActions']({ values, dao, processMetadata });
            expect(buildPrepareInstallProcessorActionDataSpy).not.toHaveBeenCalled();
            expect(installDataToActionSpy).not.toHaveBeenCalled();
            expect(result).toEqual([]);
        });

        it('builds the action data for each plugin and maps it to an action', () => {
            const values = generateCreateProcessFormData();
            const dao = generateDao();
            const processMetadata = { plugins: [], proposal: '' };
            const pluginInstallActions = [
                { to: '0x123' as Hex, data: '0x01' as Hex, value: '0' },
                { to: '0x456' as Hex, data: '0x02' as Hex, value: '0' },
            ];
            buildPrepareInstallPluginsActionDataSpy.mockReturnValue(['0x01', '0x02']);
            installDataToActionSpy
                .mockReturnValueOnce(pluginInstallActions[0])
                .mockReturnValueOnce(pluginInstallActions[1]);

            const result = prepareProcessDialogUtils['buildPrepareInstallActions']({ values, dao, processMetadata });

            expect(buildPrepareInstallPluginsActionDataSpy).toHaveBeenCalledWith({
                values,
                dao,
                pluginsMetadata: processMetadata.plugins,
            });
            expect(result).toEqual(pluginInstallActions);
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
                generateCreateProcessFormBody({ internalId: '0x1' }),
                generateCreateProcessFormBody({ internalId: '0x2' }),
            ];
            const values = generateCreateProcessFormData({ bodies });
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
            const stage = generateCreateProcessFormStage({
                internalId: '0x1',
                timing: { votingPeriod, earlyStageAdvance: false },
            });
            const body = generateCreateProcessFormBody({ stageId: stage.internalId });
            const values = generateCreateProcessFormData({ stages: [stage], bodies: [body] });

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
            const body = generateCreateProcessFormBody({ plugin: 'multisig' });
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
});
