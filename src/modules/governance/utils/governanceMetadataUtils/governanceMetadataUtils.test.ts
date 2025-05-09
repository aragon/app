import { governanceService } from '@/modules/governance/api/governanceService';
import { generateProposal } from '@/modules/governance/testUtils';
import { daoService, Network } from '@/shared/api/daoService';
import { generateDao } from '@/shared/testUtils';
import { daoUtils } from '@/shared/utils/daoUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { governanceMetadataUtils } from './governanceMetadataUtils';

describe('governanceMetadata utils', () => {
    const getDaoSpy = jest.spyOn(daoService, 'getDao');
    const cidToSrcSpy = jest.spyOn(ipfsUtils, 'cidToSrc');
    const getProposalBySlugSpy = jest.spyOn(governanceService, 'getProposalBySlug');
    const resolveDaoIdSpy = jest.spyOn(daoUtils, 'resolveDaoId');

    afterEach(() => {
        getDaoSpy.mockReset();
        cidToSrcSpy.mockReset();
        getProposalBySlugSpy.mockReset();
        resolveDaoIdSpy.mockReset();
    });

    describe('generateProposalMetadata', () => {
        it('fetches proposal and returns expected metadata including dao avatar', async () => {
            const proposalSlug = 'proposal-slug';
            const proposal = generateProposal({
                title: 'A Big Change',
                summary: 'We propose doing something big.',
            });
            const dao = generateDao({ avatar: 'cid123' });
            const ipfsUrl = `https://ipfs.com/ipfs/${dao.avatar!}`;
            const expectedDaoId = `test-dao-id`;

            getProposalBySlugSpy.mockResolvedValue(proposal);
            getDaoSpy.mockResolvedValue(dao);
            cidToSrcSpy.mockReturnValue(ipfsUrl);
            resolveDaoIdSpy.mockResolvedValue(expectedDaoId);

            const metadata = await governanceMetadataUtils.generateProposalMetadata({
                params: Promise.resolve({
                    addressOrEns: 'test.dao.eth',
                    network: Network.ETHEREUM_MAINNET,
                    proposalSlug,
                }),
            });

            expect(getProposalBySlugSpy).toHaveBeenCalledWith({
                urlParams: { slug: proposalSlug },
                queryParams: { daoId: expectedDaoId },
            });

            expect(getDaoSpy).toHaveBeenCalledWith({ urlParams: { id: expectedDaoId } });
            expect(cidToSrcSpy).toHaveBeenCalledWith(dao.avatar);

            const expectedTitle = `${proposalSlug}: ${proposal.title}`;
            expect(metadata.title).toEqual(expectedTitle);
            expect(metadata.description).toEqual(proposal.summary);
            expect(metadata.openGraph).toMatchObject({
                title: expectedTitle,
                description: proposal.summary,
                type: 'article',
                images: [ipfsUrl],
            });
        });
    });
});
