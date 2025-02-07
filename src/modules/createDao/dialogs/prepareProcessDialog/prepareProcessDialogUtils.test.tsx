import { generateProcessFormBody } from '@/modules/createDao/testUtils/generators/processBodyForm';
import { generateProcessFormStage } from '@/modules/createDao/testUtils/generators/processFormStage';
import { sppTransactionUtils } from '@/plugins/sppPlugin/utils/sppTransactionUtils';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import { type ICreateProcessFormData, ProposalCreationMode } from '../../components/createProcessForm';
import { prepareProcessDialogUtils } from './prepareProcessDialogUtils';

describe('PrepareProcessDialogUtils', () => {
    describe('prepareProposalMetadata', () => {
        it('returns the correct title and summary', () => {
            const result = prepareProcessDialogUtils.prepareProposalMetadata();
            expect(result).toEqual({
                title: 'Prepare plugin installation',
                summary: 'This proposal prepares the installation of all plugins',
            });
        });
    });

    describe('preparePluginMetadata', () => {
        it('maps the plugin form body to metadata', () => {
            const plugin = generateProcessFormBody({
                name: 'Test Plugin',
                description: 'A test description',
                resources: [{ name: 'Example', url: 'http://example.com' }],
            });
            const result = prepareProcessDialogUtils.preparePluginMetadata(plugin);
            expect(result).toEqual({
                name: plugin.name,
                description: plugin.description,
                links: plugin.resources,
            });
        });
    });

    describe('buildPrepareInstallActions', () => {
        const cidToHexSpy = jest.spyOn(transactionUtils, 'cidToHex');
        const sppInstallSpy = jest.spyOn(sppTransactionUtils, 'buildPrepareSppInstallData');
        const getSlotFunctionSpy = jest.spyOn(pluginRegistryUtils, 'getSlotFunction');

        afterEach(() => {
            cidToHexSpy.mockReset();
            sppInstallSpy.mockReset();
            getSlotFunctionSpy.mockReset();
        });

        it('builds install actions for SPP and plugin bodies', () => {
            const daoAddress = '0x1234567890123456789012345678901234567890';
            const processMetadata = {
                proposal: 'proposalCID',
                plugins: ['pluginCID1', 'pluginCID2'],
                spp: 'sppCID',
            };
            cidToHexSpy.mockReturnValue('0x234234000000000000000000000000000000000000000e');
            const sppInstallData = '0xSPP-constant';
            sppInstallSpy.mockReturnValue(sppInstallData);
            const pluginInstallData = '0xPlugin-constant';
            const slotFunction = jest.fn().mockReturnValue(pluginInstallData);
            getSlotFunctionSpy.mockReturnValue(slotFunction);

            const values: ICreateProcessFormData = {
                name: 'Test Process',
                processKey: 'test-process-key',
                description: 'This is a test process',
                resources: [],
                stages: [generateProcessFormStage({ bodies: [generateProcessFormBody()] })],
                permissions: {
                    proposalCreationMode: ProposalCreationMode.ANY_WALLET,
                    proposalCreationBodies: [{ bodyId: 'body1', minVotingPower: '0' }],
                },
            };

            const actions = prepareProcessDialogUtils.buildPrepareInstallActions(values, daoAddress, processMetadata);

            const pspRepoAddress = '0x9e99D11b513dD2cc5e117a5793412106502FF04B';

            expect(actions).toEqual([
                {
                    to: pspRepoAddress,
                    data: sppInstallData,
                    value: '0',
                },
                {
                    to: pspRepoAddress,
                    data: pluginInstallData,
                    value: '0',
                },
            ]);
        });
    });

    describe('buildTransaction', () => {
        const cidToHexSpy = jest.spyOn(transactionUtils, 'cidToHex');
        const sppInstallSpy = jest.spyOn(sppTransactionUtils, 'buildPrepareSppInstallData');
        const buildPrepareInstallActionsSpy = jest.spyOn(prepareProcessDialogUtils, 'buildPrepareInstallActions');
        const getSlotFunctionSpy = jest.spyOn(pluginRegistryUtils, 'getSlotFunction');

        afterEach(() => {
            cidToHexSpy.mockReset();
            sppInstallSpy.mockReset();
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
                permissions: {
                    proposalCreationMode: ProposalCreationMode.ANY_WALLET,
                    proposalCreationBodies: [],
                },
                name: 'Test Process',
                processKey: 'WEF',
                description: 'Test Description',
                resources: [],
            };
            const plugin = generateDaoPlugin();
            getSlotFunctionSpy.mockReturnValue(() => 'txData-constant');
            cidToHexSpy.mockReturnValue('0xPROPOSALHEX');
            buildPrepareInstallActionsSpy.mockReturnValue([
                { to: '0xTo1', data: '0xData1', value: 'value1' },
                { to: '0xTo2', data: '0xData2', value: 'value2' },
            ]);

            const buildParams = {
                values,
                processMetadata,
                plugin,
                dao,
                nonce: 0,
            };
            const result = await prepareProcessDialogUtils.buildTransaction(buildParams);

            expect(cidToHexSpy).toHaveBeenCalledWith(processMetadata.proposal);
            expect(buildPrepareInstallActionsSpy).toHaveBeenCalledWith(values, dao.address, processMetadata);
            expect(result).toEqual({
                to: plugin.address,
                data: 'txData-constant',
            });
        });
    });
});
