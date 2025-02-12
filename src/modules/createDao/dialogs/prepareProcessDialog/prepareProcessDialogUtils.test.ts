import { sppTransactionUtils } from '@/plugins/sppPlugin/utils/sppTransactionUtils';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import { zeroAddress } from 'viem';
import { ProposalCreationMode, type ICreateProcessFormData } from '../../components/createProcessForm';
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
                process: values.processKey,
                stages: [stageOne.name, stageTwo.name],
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

        it('builds install actions for SPP and plugin bodies', () => {
            const dao = generateDao({ address: '0xDaoAddress' });
            const sppInstallData = '0xSppInstallData';
            const pluginInstallData = '0xPluginInstallData';
            const processMetadata = {
                proposal: 'proposalCID',
                plugins: ['pluginCID1', 'pluginCID2'],
                spp: 'sppCID',
            };

            cidToHexSpy.mockImplementation((cid: string) => `0x${cid}`);
            sppInstallSpy.mockReturnValue(sppInstallData);
            getSlotFunctionSpy.mockReturnValue(() => pluginInstallData);
            installDataToActionSpy.mockImplementation((data) => ({ to: zeroAddress, data, value: '0' }));

            const stage = generateCreateProcessFormStage({
                bodies: [generateCreateProcessFormBody({ id: 'body1', governanceType: 'multisig' })],
            });
            const values: ICreateProcessFormData = {
                name: 'Test Process',
                description: 'Test description',
                processKey: 'test-key',
                resources: [],
                stages: [stage],
                permissions: {
                    proposalCreationMode: ProposalCreationMode.ANY_WALLET,
                    proposalCreationBodies: [],
                },
            };

            const actions = prepareProcessDialogUtils.buildPrepareInstallActions(values, dao, processMetadata);
            expect(actions).toEqual([
                { to: zeroAddress, data: sppInstallData, value: '0' },
                { to: zeroAddress, data: pluginInstallData, value: '0' },
            ]);
        });
    });
});
