import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { sppTransactionUtils } from '@/plugins/sppPlugin/utils/sppTransactionUtils';
import { generateDao, generateDaoPlugin, generatePluginSetupData } from '@/shared/testUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import type { Hex } from 'viem';
import { GovernanceType } from '../../components/createProcessForm';
import { generateCreateProcessFormData } from '../../testUtils';
import { type IBuildTransactionParams, publishProcessDialogUtils } from './publishProcessDialogUtils';

describe('publishProcessDialog utils', () => {
    const getSlotFunctionSpy = jest.spyOn(pluginRegistryUtils, 'getSlotFunction');
    const cidToHexSpy = jest.spyOn(transactionUtils, 'cidToHex');
    const buildPluginsSetupActionsSpy = jest.spyOn(sppTransactionUtils, 'buildPluginsSetupActions');
    const buildApplyPluginsInstallationActionsSpy = jest.spyOn(
        pluginTransactionUtils,
        'buildApplyPluginsInstallationActions',
    );

    beforeEach(() => {
        getSlotFunctionSpy.mockReturnValue(jest.fn());
        buildPluginsSetupActionsSpy.mockReturnValue([]);
    });

    afterEach(() => {
        getSlotFunctionSpy.mockReset();
        cidToHexSpy.mockReset();
        buildPluginsSetupActionsSpy.mockReset();
        buildApplyPluginsInstallationActionsSpy.mockReset();
    });

    describe('prepareProposalMetadata', () => {
        it('returns the metadata for the publish process proposal', () => {
            const result = publishProcessDialogUtils.prepareProposalMetadata();
            expect(result.title).toEqual(publishProcessDialogUtils['proposalMetadata'].title);
            expect(result.summary).toEqual(publishProcessDialogUtils['proposalMetadata'].summary);
        });
    });

    describe('buildTransaction', () => {
        const createTestParams = (params?: Partial<IBuildTransactionParams>): IBuildTransactionParams => ({
            values: generateCreateProcessFormData(),
            dao: generateDao(),
            plugin: generateDaoPlugin(),
            setupData: [generatePluginSetupData()],
            metadataCid: 'cid',
            ...params,
        });

        it('converts the metadata CID to hex before passing it to the create proposal plugin function', async () => {
            const metadataCid = 'cid';
            const metadataHex = '0xtest';
            const slotFunction = jest.fn();
            cidToHexSpy.mockReturnValue(metadataHex);
            getSlotFunctionSpy.mockReturnValue(slotFunction);

            await publishProcessDialogUtils.buildTransaction(createTestParams({ metadataCid }));
            expect(cidToHexSpy).toHaveBeenCalledWith(metadataCid);
            expect(slotFunction).toHaveBeenCalledWith(expect.objectContaining({ metadata: metadataHex }));
        });

        it('builds the apply-installation actions and passes them to the create proposal plugin function', async () => {
            const dao = generateDao();
            const setupData = [generatePluginSetupData()];
            const values = generateCreateProcessFormData();
            const installPluginActions = [{ to: '0x123' as Hex, data: '0x' as Hex, value: BigInt(11) }];
            const slotFunction = jest.fn();
            buildApplyPluginsInstallationActionsSpy.mockReturnValue(installPluginActions);
            getSlotFunctionSpy.mockReturnValue(slotFunction);

            await publishProcessDialogUtils.buildTransaction(createTestParams({ dao, values, setupData }));
            expect(buildApplyPluginsInstallationActionsSpy).toHaveBeenCalledWith({ dao, setupData, actions: [] });
            expect(slotFunction).toHaveBeenCalledWith(expect.objectContaining({ actions: installPluginActions }));
        });

        it('builds the processor install actions and passes them to the apply-installation function for advanced governance type', async () => {
            const dao = generateDao();
            const setupData = [generatePluginSetupData()];
            const values = generateCreateProcessFormData({ governanceType: GovernanceType.ADVANCED });
            const processorActions = [{ to: '0x123' as Hex, data: '0x0' as Hex, value: BigInt(0) }];
            buildPluginsSetupActionsSpy.mockReturnValue(processorActions);
            await publishProcessDialogUtils.buildTransaction(createTestParams({ dao, values, setupData }));

            expect(buildPluginsSetupActionsSpy).toHaveBeenCalledWith(values, setupData, dao);
            expect(buildApplyPluginsInstallationActionsSpy).toHaveBeenCalledWith(
                expect.objectContaining({ actions: processorActions }),
            );
        });

        it('retrieves and triggers the plugin specific function for building a create proposal transaction', async () => {
            const plugin = generateDaoPlugin({ subdomain: 'admin' });
            const transactionData = '0x123';
            const buildTransactionFunction = jest.fn(() => transactionData);
            getSlotFunctionSpy.mockReturnValue(buildTransactionFunction);

            const result = await publishProcessDialogUtils.buildTransaction(createTestParams({ plugin }));

            const slotId = GovernanceSlotId.GOVERNANCE_BUILD_CREATE_PROPOSAL_DATA;
            expect(getSlotFunctionSpy).toHaveBeenCalledWith({ pluginId: plugin.subdomain, slotId });

            expect(result.to).toEqual(plugin.address);
            expect(result.data).toEqual(transactionData);
        });
    });
});
