import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { sppTransactionUtils } from '@/plugins/sppPlugin/utils/sppTransactionUtils';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { generateCreateProcessFormData } from '@/shared/testUtils/generators/createProcessFormData';
import { generatePluginSetupData } from '@/shared/testUtils/generators/pluginSetupData';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import { ProposalCreationMode } from '../../components/createProcessForm';
import { publishProcessDialogUtils } from './publishProcessDialogUtils';

export const createTestParams = () => {
    const values = generateCreateProcessFormData({
        permissions: {
            proposalCreationMode: ProposalCreationMode.LISTED_BODIES,
            proposalCreationBodies: [],
        },
    });
    const dao = generateDao();
    const plugin = generateDaoPlugin({ subdomain: 'spp' });
    const setupData = [generatePluginSetupData()];
    const metadataCid = 'test-cid';

    return { values, dao, plugin, setupData, metadataCid };
};

describe('publishProcessDialog utils', () => {
    const getSlotFunctionSpy = jest.spyOn(pluginRegistryUtils, 'getSlotFunction');
    const cidToHexSpy = jest.spyOn(transactionUtils, 'cidToHex');
    const buildInstallActionsSpy = jest.spyOn(sppTransactionUtils, 'buildInstallActions');

    afterEach(() => {
        getSlotFunctionSpy.mockReset();
        cidToHexSpy.mockReset();
    });

    describe('prepareProposalMetadata', () => {
        it('returns correct proposal metadata', () => {
            const result = publishProcessDialogUtils.prepareProposalMetadata();

            expect(result).toEqual({
                title: publishProcessDialogUtils['proposal'].title,
                summary: publishProcessDialogUtils['proposal'].summary,
            });
        });
    });

    describe('buildTransaction', () => {
        it('converts the metadata CID to hex', async () => {
            const transactionData = '0xfbd56e4100000000000000000000000000000000000000000000000000000000000000e';
            const slotFunction = jest.fn(() => transactionData);
            getSlotFunctionSpy.mockReturnValue(slotFunction);
            buildInstallActionsSpy.mockReturnValue([]);

            const { values, dao, plugin, setupData } = createTestParams();

            const metadataCid = 'cid-test';

            await publishProcessDialogUtils.buildTransaction({
                values,
                dao,
                plugin,
                setupData,
                metadataCid,
            });

            expect(cidToHexSpy).toHaveBeenCalledWith(metadataCid);
        });

        it('calls the plugin specific data function with the correct params', async () => {
            const transactionData = '0xfbd56e4100000000000000000000000000000000000000000000000000000000000000e';
            const slotFunction = jest.fn(() => transactionData);
            getSlotFunctionSpy.mockReturnValue(slotFunction);
            buildInstallActionsSpy.mockReturnValue([]);

            const { values, dao, plugin, setupData, metadataCid } = createTestParams();

            await publishProcessDialogUtils.buildTransaction({
                values,
                dao,
                plugin,
                setupData,
                metadataCid,
            });

            expect(getSlotFunctionSpy).toHaveBeenCalledWith({
                pluginId: plugin.subdomain,
                slotId: GovernanceSlotId.GOVERNANCE_BUILD_CREATE_PROPOSAL_DATA,
            });
        });

        it('calls the plugin specific data function to prepare the transaction data and resolves with a transaction object', async () => {
            const transactionData = '0xfbd56e4100000000000000000000000000000000000000000000000000000000000000e';
            const slotFunction = jest.fn(() => transactionData);
            getSlotFunctionSpy.mockReturnValue(slotFunction);
            buildInstallActionsSpy.mockReturnValue([]);

            const { values, dao, plugin, setupData, metadataCid } = createTestParams();

            const transaction = await publishProcessDialogUtils.buildTransaction({
                values,
                dao,
                plugin,
                setupData,
                metadataCid,
            });

            expect(transaction.data).toEqual(transactionData);
            expect(transaction.to).toEqual(plugin.address);
        });
    });
});
