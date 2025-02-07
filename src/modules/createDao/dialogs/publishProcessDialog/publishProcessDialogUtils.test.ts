import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { generateCreateProcessFormData } from '@/shared/testUtils/generators/createProcessFormData';
import { generatePluginSetupData } from '@/shared/testUtils/generators/pluginSetupData';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import { ProposalCreationMode } from '../../components/createProcessForm';
import { publishProcessDialogUtils } from './publishProcessDialogUtils';

describe('PublishProcessDialogUtils', () => {
    const getSlotFunctionSpy = jest.spyOn(pluginRegistryUtils, 'getSlotFunction');
    const cidToHexSpy = jest.spyOn(transactionUtils, 'cidToHex');
    const buildInstallActionsSpy = jest.spyOn(pluginTransactionUtils, 'buildInstallActions');

    afterEach(() => {
        getSlotFunctionSpy.mockReset();
        cidToHexSpy.mockReset();
        buildInstallActionsSpy.mockReset();
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
        const values = generateCreateProcessFormData({
            permissions: {
                proposalCreationMode: ProposalCreationMode.LISTED_BODIES,
                proposalCreationBodies: [],
            },
        });
        const plugin = generateDaoPlugin({ subdomain: 'spp' });
        const dao = generateDao();
        const setupData = [generatePluginSetupData()];
        const metadataCid = 'test-cid';

        it('converts the metadata CID to hex', async () => {
            const transactionData = '0xfbd56e4100000000000000000000000000000000000000000000000000000000000000e';
            const slotFunction = jest.fn(() => transactionData);
            getSlotFunctionSpy.mockReturnValue(slotFunction);

            await publishProcessDialogUtils.buildTransaction({
                values,
                dao,
                plugin,
                setupData,
                metadataCid,
            });

            expect(cidToHexSpy).toHaveBeenCalledWith(metadataCid);
        });

        it('calls the plugin-specific data function with the correct params', async () => {
            const transactionData = '0xfbd56e4100000000000000000000000000000000000000000000000000000000000000e';
            const slotFunction = jest.fn(() => transactionData);
            getSlotFunctionSpy.mockReturnValue(slotFunction);

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

        it('calls the plugin-specific function to prepare the transaction data and resolves with a transaction object', async () => {
            const transactionData = '0xfbd56e4100000000000000000000000000000000000000000000000000000000000000e';
            const slotFunction = jest.fn(() => transactionData);
            getSlotFunctionSpy.mockReturnValue(slotFunction);

            const metadataCid = 'test-cid';

            const transaction = await publishProcessDialogUtils.buildTransaction({
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

            expect(transaction.data).toEqual(transactionData);
            expect(transaction.to).toEqual(plugin.address);
        });
    });
});
