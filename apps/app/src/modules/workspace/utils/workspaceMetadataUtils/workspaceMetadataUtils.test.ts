import { governanceMetadataUtils } from '@/modules/governance/utils/governanceMetadataUtils';
import { Network } from '@/shared/api/daoService';
import { featureFlags } from '@/shared/featureFlags';
import { workspaceMetadataUtils } from './workspaceMetadataUtils';

describe('workspaceMetadataUtils', () => {
    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const accountId = `${Network.ETHEREUM_SEPOLIA}-${address}`;
    const proposalSlug = 'MUL-4';

    const isEnabledSpy = jest.spyOn(featureFlags, 'isEnabled');
    const generateProposalMetadataSpy = jest.spyOn(
        governanceMetadataUtils,
        'generateProposalMetadata',
    );

    beforeEach(() => {
        isEnabledSpy.mockResolvedValue(true);
        generateProposalMetadataSpy.mockResolvedValue({
            title: 'MUL-4: Fund the grants program',
        });
    });

    afterEach(() => {
        isEnabledSpy.mockReset();
        generateProposalMetadataSpy.mockReset();
    });

    const buildParams = (params?: { accountId?: string }) => ({
        params: Promise.resolve({
            workspaceId: 'demo',
            accountId: params?.accountId ?? accountId,
            proposalSlug,
        }),
    });

    it('generates the metadata of the proposal from the account on the route', async () => {
        const metadata = await workspaceMetadataUtils.generateProposalMetadata(
            buildParams(),
        );

        expect(metadata).toEqual({ title: 'MUL-4: Fund the grants program' });

        const generateParams =
            generateProposalMetadataSpy.mock.calls.at(-1)?.[0].params;

        await expect(generateParams).resolves.toEqual({
            network: Network.ETHEREUM_SEPOLIA,
            addressOrEns: address,
            proposalSlug,
        });
    });

    it('passes a mis-cased account through unchanged', async () => {
        await workspaceMetadataUtils.generateProposalMetadata(
            buildParams({ accountId: accountId.toLowerCase() }),
        );

        const generateParams =
            generateProposalMetadataSpy.mock.calls.at(-1)?.[0].params;

        await expect(generateParams).resolves.toEqual({
            network: Network.ETHEREUM_SEPOLIA,
            addressOrEns: address.toLowerCase(),
            proposalSlug,
        });
    });

    it('reads nothing when the workspaces feature is disabled', async () => {
        isEnabledSpy.mockResolvedValue(false);

        const metadata = await workspaceMetadataUtils.generateProposalMetadata(
            buildParams(),
        );

        expect(metadata).toEqual({});
        expect(generateProposalMetadataSpy).not.toHaveBeenCalled();
    });
});
