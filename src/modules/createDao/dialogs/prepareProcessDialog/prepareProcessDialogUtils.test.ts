import { CreateDaoSlotId } from '@/modules/createDao/constants/moduleSlots';
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
import { type IBuildTransactionParams, prepareProcessDialogUtils } from './prepareProcessDialogUtils';

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
            expect(result).toEqual({
                name: plugin.name,
                description: plugin.description,
                links: plugin.resources,
            });
        });
    });

    describe('prepareSppMetadata', () => {
        it('builds the metadata for the SPP plugin', () => {
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
            const result = prepareProcessDialogUtils.prepareSppMetadata(values);
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
        const buildPrepareInstallActionsSpy = jest.spyOn(prepareProcessDialogUtils, 'buildPrepareInstallActions');

        afterEach(() => {
            buildPrepareInstallActionsSpy.mockReset();
        });

        afterAll(() => {
            buildPrepareInstallActionsSpy.mockRestore();
        });

        const createTestParams = (params?: Partial<IBuildTransactionParams>): IBuildTransactionParams => ({
            values: generateCreateProcessFormData(),
            dao: generateDao(),
            plugin: generateDaoPlugin(),
            processMetadata: {
                proposal: 'proposalCID',
                plugins: ['pluginCID1', 'pluginCID2'],
                spp: 'sppCID',
            },
            ...params,
        });

        it('converts the metadata CID to hex before passing it to the create proposal plugin function', async () => {
            const metadataCid = 'proposalCID';
            const metadataHex = '0xproposalCID'; // Simulated conversion result
            const slotFunction = jest.fn();

            cidToHexSpy.mockReturnValue(metadataHex);
            getSlotFunctionSpy.mockReturnValue(slotFunction);
            buildPrepareInstallActionsSpy.mockReturnValue([]);

            await prepareProcessDialogUtils.buildTransaction(
                createTestParams({ processMetadata: { proposal: metadataCid, plugins: [], spp: '' } }),
            );

            expect(cidToHexSpy).toHaveBeenCalledWith(metadataCid);
            expect(slotFunction).toHaveBeenCalledWith(expect.objectContaining({ metadata: metadataHex }));
        });

        it('builds the prepare install plugin actions and passes them to the create proposal plugin function', async () => {
            const dao = generateDao();
            const values = generateCreateProcessFormData();
            const installPluginActions = [{ to: '0x123' as Hex, data: '0x' as Hex, value: '11' }];
            const slotFunction = jest.fn();

            buildPrepareInstallActionsSpy.mockReturnValue(installPluginActions);
            getSlotFunctionSpy.mockReturnValue(slotFunction);

            await prepareProcessDialogUtils.buildTransaction(createTestParams({ dao, values }));

            expect(buildPrepareInstallActionsSpy).toHaveBeenCalledWith(values, dao, expect.any(Object));
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
        const sppInstallSpy = jest.spyOn(sppTransactionUtils, 'buildPreparePluginInstallData');
        const installDataToActionSpy = jest.spyOn(pluginTransactionUtils, 'installDataToAction');

        afterEach(() => {
            sppInstallSpy.mockReset();
            installDataToActionSpy.mockReset();
        });

        it('prepares the SPP install data', () => {
            const values = generateCreateProcessFormData();
            const processMetadata = { proposal: 'proposalCID', plugins: [], spp: 'sppCID' };
            const sppMetadata = '0xSppMetadata';
            const sppInstallData = '0xSppInstallData' as Hex;
            const sppInstallAction = { to: '0x' as Hex, value: '0', data: sppInstallData };
            const dao = generateDao({ address: '0xDaoAddress' });

            cidToHexSpy.mockReturnValue(sppMetadata);
            sppInstallSpy.mockReturnValue(sppInstallData);
            installDataToActionSpy.mockReturnValue(sppInstallAction);
            const result = prepareProcessDialogUtils.buildPrepareInstallActions(values, dao, processMetadata);

            expect(sppInstallSpy).toHaveBeenCalledWith(sppMetadata, dao);
            expect(result).toEqual([sppInstallAction]);
        });

        it('prepares the plugin install data with correct params', () => {
            const body = generateCreateProcessFormBody({ internalId: 'body1', plugin: 'multisig', stageId: '0' });
            const stage = generateCreateProcessFormStage({ internalId: '0' });
            const values = generateCreateProcessFormData({ stages: [stage], bodies: [body] });
            const dao = generateDao({ address: '0xDaoAddress' });

            const slotFunction = jest.fn().mockReturnValue('0xPluginInstallData');
            getSlotFunctionSpy.mockReturnValue(slotFunction);
            const processMetadata = { proposal: '', plugins: [], spp: '' };

            prepareProcessDialogUtils.buildPrepareInstallActions(values, dao, processMetadata);

            expect(getSlotFunctionSpy).toHaveBeenCalledWith({
                slotId: CreateDaoSlotId.CREATE_DAO_BUILD_PREPARE_PLUGIN_INSTALL_DATA,
                pluginId: body.plugin,
            });

            expect(slotFunction).toHaveBeenCalledWith(expect.objectContaining({ dao, body, stage }));
        });
    });
});
