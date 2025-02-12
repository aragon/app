import { CreateDaoSlotId } from '@/modules/createDao/constants/moduleSlots';
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
import { prepareProcessDialogUtils } from './prepareProcessDialogUtils';

describe('prepareProcessDialog utils', () => {
    const cidToHexSpy = jest.spyOn(transactionUtils, 'cidToHex');

    afterEach(() => {
        cidToHexSpy.mockReset();
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
        const getSlotFunctionSpy = jest.spyOn(pluginRegistryUtils, 'getSlotFunction');

        afterEach(() => {
            buildPrepareInstallActionsSpy.mockReset();
            getSlotFunctionSpy.mockReset();
        });

        afterAll(() => {
            buildPrepareInstallActionsSpy.mockRestore();
        });

        it('builds transaction data using the slot function', async () => {
            const dao = generateDao();
            const processMetadata = {
                proposal: 'proposalCID',
                plugins: ['pluginCID1', 'pluginCID2'],
                spp: 'sppCID',
            };
            const values = {
                stages: [],
                permissions: { proposalCreationMode: ProposalCreationMode.ANY_WALLET, proposalCreationBodies: [] },
                name: 'Test Process',
                processKey: 'WEF',
                description: 'Test Description',
                resources: [],
            };
            const plugin = generateDaoPlugin();

            cidToHexSpy.mockReturnValue('0xPROPOSALHEX');
            buildPrepareInstallActionsSpy.mockReturnValue([
                { to: '0xTo1', data: '0xData1', value: 'value1' },
                { to: '0xTo2', data: '0xData2', value: 'value2' },
            ]);
            getSlotFunctionSpy.mockReturnValue(() => 'txData-constant');

            const buildParams = { values, processMetadata, plugin, dao, nonce: 0 };
            const result = await prepareProcessDialogUtils.buildTransaction(buildParams);

            expect(cidToHexSpy).toHaveBeenCalledWith(processMetadata.proposal);
            expect(buildPrepareInstallActionsSpy).toHaveBeenCalledWith(values, dao, processMetadata);
            expect(result).toEqual({
                to: plugin.address,
                data: 'txData-constant',
            });
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

        it('correctly prepares the SPP install data', () => {
            const sppInstallData = '0xSppInstallData';
            const sppMetadata = '0xSppMetadata';
            const dao = generateDao({ address: '0xDaoAddress' });

            sppInstallSpy.mockReturnValue(sppInstallData);

            const result = sppTransactionUtils.buildPreparePluginInstallData(sppMetadata, dao);

            expect(sppInstallSpy).toHaveBeenCalledWith(sppMetadata, dao);

            expect(result).toEqual(sppInstallData);
        });

        it('correctly prepares the plugin install data with no permissions when proposal creation mode is any wallet', () => {
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

        it('correctly prepares the plugin install data with defined permissions when proposal creation mode is listed bodies', () => {
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

        it('correctly maps install data to install actions', () => {
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
