import { CreateDaoSlotId } from '@/modules/createDao/constants/moduleSlots';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { sppTransactionUtils } from '@/plugins/sppPlugin/utils/sppTransactionUtils';
import { Network } from '@/shared/api/daoService';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import { type Hex, zeroAddress } from 'viem';
import { ProposalCreationMode } from '../../components/createProcessForm';
import {
    generateCreateProcessFormBody,
    generateCreateProcessFormData,
    generateCreateProcessFormStage,
} from '../../testUtils';
import { type IBuildTransactionParams, prepareProcessDialogUtils } from './prepareProcessDialogUtils';

describe('prepareProcessDialog utils', () => {
    const cidToHexSpy = jest.spyOn(transactionUtils, 'cidToHex');
    const buildPrepareInstallActionsSpy = jest.spyOn(prepareProcessDialogUtils, 'buildPrepareInstallActions');
    const getSlotFunctionSpy = jest.spyOn(pluginRegistryUtils, 'getSlotFunction');

    afterEach(() => {
        cidToHexSpy.mockReset();
        buildPrepareInstallActionsSpy.mockReset();
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

            await prepareProcessDialogUtils.buildTransaction(
                createTestParams({ processMetadata: { proposal: metadataCid, plugins: [], spp: '' } }),
            );

            expect(cidToHexSpy).toHaveBeenCalledWith(metadataCid);
            expect(slotFunction).toHaveBeenCalledWith(expect.objectContaining({ metadata: metadataHex }));
        });

        it('builds the install plugin actions and passes them to the create proposal plugin function', async () => {
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
        const getSlotFunctionSpy = jest.spyOn(pluginRegistryUtils, 'getSlotFunction');
        const installDataToActionSpy = jest.spyOn(pluginTransactionUtils, 'installDataToAction');

        afterEach(() => {
            sppInstallSpy.mockReset();
            getSlotFunctionSpy.mockReset();
            installDataToActionSpy.mockReset();
        });

        it('prepares the SPP install data', () => {
            const sppInstallData = '0xSppInstallData';
            const sppMetadata = '0xSppMetadata';
            const dao = generateDao({ address: '0xDaoAddress' });

            sppInstallSpy.mockReturnValue(sppInstallData);

            const result = sppTransactionUtils.buildPreparePluginInstallData(sppMetadata, dao);

            expect(sppInstallSpy).toHaveBeenCalledWith(sppMetadata, dao);

            expect(result).toEqual(sppInstallData);
        });

        it('prepares the plugin install data with no permissions when proposal creation mode is any wallet', () => {
            const pluginInstallData = '0xPluginInstallData' as Hex;
            const governanceType = 'multisig';
            const body = generateCreateProcessFormBody({ id: 'body1', governanceType });
            const stage = generateCreateProcessFormStage({ bodies: [body] });
            const permissions = {
                proposalCreationMode: ProposalCreationMode.ANY_WALLET,
                proposalCreationBodies: [],
            };
            const values = generateCreateProcessFormData({ stages: [stage], permissions });

            const dao = generateDao({ address: '0xDaoAddress' });

            const params = { metadataCid: undefined, dao, permissionSettings: undefined, body, stage };

            const slotFunction = jest.fn().mockReturnValue(pluginInstallData);
            getSlotFunctionSpy.mockReturnValue(slotFunction);
            const processMetadata = { proposal: 'proposalCID', plugins: [], spp: 'sppCID' };

            prepareProcessDialogUtils.buildPrepareInstallActions(values, dao, processMetadata);

            expect(getSlotFunctionSpy).toHaveBeenCalledWith({
                slotId: CreateDaoSlotId.CREATE_DAO_BUILD_PREPARE_PLUGIN_INSTALL_DATA,
                pluginId: governanceType,
            });

            expect(slotFunction).toHaveBeenCalledWith(params);
        });

        it('prepares the plugin install data with defined permissions when proposal creation mode is listed bodies', () => {
            const pluginInstallData = '0xPluginInstallData' as Hex;
            const governanceType = 'token-voting';
            const body = generateCreateProcessFormBody({ id: 'body1', governanceType });
            const listedBody = { bodyId: body.id };
            const stage = generateCreateProcessFormStage({ bodies: [body] });
            const permissions = {
                proposalCreationMode: ProposalCreationMode.LISTED_BODIES,
                proposalCreationBodies: [listedBody],
            };
            const values = generateCreateProcessFormData({ stages: [stage], permissions });

            const dao = generateDao({ address: '0xDaoAddress' });

            const params = { metadataCid: undefined, dao, permissionSettings: listedBody, body, stage };

            const slotFunction = jest.fn().mockReturnValue(pluginInstallData);
            getSlotFunctionSpy.mockReturnValue(slotFunction);
            const processMetadata = { proposal: 'proposalCID', plugins: [], spp: 'sppCID' };

            prepareProcessDialogUtils.buildPrepareInstallActions(values, dao, processMetadata);

            expect(getSlotFunctionSpy).toHaveBeenCalledWith({
                slotId: CreateDaoSlotId.CREATE_DAO_BUILD_PREPARE_PLUGIN_INSTALL_DATA,
                pluginId: governanceType,
            });

            expect(slotFunction).toHaveBeenCalledWith(params);
        });

        it('maps install data to install actions', () => {
            const dao = generateDao({ address: '0xDaoAddress', network: Network.POLYGON_MAINNET });
            const sppInstallData = '0xSppInstallData';
            const pluginInstallData1 = '0xPluginInstallData1';
            const pluginInstallData2 = '0xPluginInstallData2';

            const pluginsInstallData = [[pluginInstallData1], [pluginInstallData2]];

            installDataToActionSpy.mockImplementation((data) => ({ to: zeroAddress, data, value: '0' }));

            // Simulate the installActions mapping step
            const installActions = [sppInstallData, ...pluginsInstallData.flat()].map((data) =>
                pluginTransactionUtils.installDataToAction(data as Hex, dao.network),
            );

            // Ensure installDataToAction was called for each install data item
            expect(installDataToActionSpy).toHaveBeenCalledWith(sppInstallData, dao.network);
            expect(installDataToActionSpy).toHaveBeenCalledWith(pluginInstallData1, dao.network);
            expect(installDataToActionSpy).toHaveBeenCalledWith(pluginInstallData2, dao.network);

            // Ensure the final installActions array contains the expected transactions
            expect(installActions).toEqual([
                { to: zeroAddress, data: sppInstallData, value: '0' },
                { to: zeroAddress, data: pluginInstallData1, value: '0' },
                { to: zeroAddress, data: pluginInstallData2, value: '0' },
            ]);
        });
    });
});
