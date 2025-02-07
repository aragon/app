import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { generateCreateProcessFormData } from '@/shared/testUtils/generators/createProcessFormData';
import { generatePluginSetupData } from '@/shared/testUtils/generators/pluginSetupData';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { ProposalCreationMode } from '../../components/createProcessForm';
import { publishProcessDialogUtils } from './publishProcessDialogUtils';

jest.mock('viem', () => ({
    encodeFunctionData: jest.fn(),
    toHex: jest.fn(),
    keccak256: jest.fn(),
    toBytes: jest.fn(),
    encodeAbiParameters: jest.fn(),
}));

describe('PublishProcessDialogUtils', () => {
    const getSlotFunctionSpy = jest.spyOn(pluginRegistryUtils, 'getSlotFunction');

    afterEach(() => {
        getSlotFunctionSpy.mockReset();
    });

    describe('prepareProposalMetadata', () => {
        it('returns correct proposal metadata', () => {
            const result = publishProcessDialogUtils.prepareProposalMetadata();

            expect(result).toEqual({
                title: 'Apply plugin installation',
                summary: 'This proposal applies the plugin installation to create the new process',
            });
        });
    });

    describe('buildTransaction', () => {
        it('calls the plugin-specific function to prepare the transaction data and resolves with a transaction object', async () => {
            const values = generateCreateProcessFormData({
                permissions: {
                    proposalCreationMode: ProposalCreationMode.LISTED_BODIES,
                    proposalCreationBodies: [],
                },
            });

            const transactionData = '0xfbd56e4100000000000000000000000000000000000000000000000000000000000000e';
            const slotFunction = jest.fn(() => transactionData);
            getSlotFunctionSpy.mockReturnValue(slotFunction);

            const metadataCid = 'test-cid';
            const dao = generateDao();
            const plugin = generateDaoPlugin({ subdomain: 'spp' });
            const setupData = [generatePluginSetupData()];

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
