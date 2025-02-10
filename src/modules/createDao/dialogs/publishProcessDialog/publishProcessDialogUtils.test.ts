import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { sppTransactionUtils } from '@/plugins/sppPlugin/utils/sppTransactionUtils';
import { generateDao, generateDaoPlugin, generatePluginSetupData } from '@/shared/testUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import type { Hex } from 'viem';
import { generateCreateProcessFormData } from '../../testUtils';
import { type IBuildTransactionParams, publishProcessDialogUtils } from './publishProcessDialogUtils';

describe('publishProcessDialog utils', () => {
    const getSlotFunctionSpy = jest.spyOn(pluginRegistryUtils, 'getSlotFunction');
    const cidToHexSpy = jest.spyOn(transactionUtils, 'cidToHex');
    const buildInstallPluginsActionsSpy = jest.spyOn(sppTransactionUtils, 'buildInstallPluginsActions');

    beforeEach(() => {
        getSlotFunctionSpy.mockReturnValue(jest.fn());
        buildInstallPluginsActionsSpy.mockReturnValue([]);
    });

    afterEach(() => {
        getSlotFunctionSpy.mockReset();
        cidToHexSpy.mockReset();
        buildInstallPluginsActionsSpy.mockReset();
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

        it('builds the install plugins actions and passes them to the create proposal plugin function', async () => {
            const dao = generateDao();
            const setupData = [generatePluginSetupData()];
            const values = generateCreateProcessFormData();
            const installPluginActions = [{ to: '0x123' as Hex, data: '0x' as Hex, value: '11' }];
            const slotFunction = jest.fn();
            buildInstallPluginsActionsSpy.mockReturnValue(installPluginActions);
            getSlotFunctionSpy.mockReturnValue(slotFunction);

            await publishProcessDialogUtils.buildTransaction(createTestParams({ dao, values, setupData }));
            expect(buildInstallPluginsActionsSpy).toHaveBeenCalledWith(values, setupData, dao);
            expect(slotFunction).toHaveBeenCalledWith(expect.objectContaining({ actions: installPluginActions }));
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
