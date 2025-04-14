import { governanceService } from '@/modules/governance/api/governanceService';
import { generateProposal } from '@/modules/governance/testUtils';
import { daoService } from '@/shared/api/daoService';
import { generateDao } from '@/shared/testUtils';
import { ipfsUtils } from '../../../../shared/utils/ipfsUtils';
import { governanceMetadataUtils } from './governanceMetadataUtils';

describe('governanceMetadata utils', () => {
    const getDaoSpy = jest.spyOn(daoService, 'getDao');
    const cidToSrcSpy = jest.spyOn(ipfsUtils, 'cidToSrc');
    const getProposalBySlugSpy = jest.spyOn(governanceService, 'getProposalBySlug');

    afterEach(() => {
        getDaoSpy.mockReset();
        cidToSrcSpy.mockReset();
        getProposalBySlugSpy.mockReset();
    });

    describe('generateProposalMetadata', () => {
        it('fetches proposal and returns expected metadata including dao avatar', async () => {
            const id = 'dao-id';
            const proposalSlug = 'proposal-slug';
            const pluginAddress = '0x123';
            const proposal = generateProposal({
                title: 'A Big Change',
                summary: 'We propose doing something big.',
            });
            const dao = generateDao({ avatar: 'cid123' });
            const ipfsUrl = `https://ipfs.com/ipfs/${dao.avatar!}`;

            getProposalBySlugSpy.mockResolvedValue(proposal);
            getDaoSpy.mockResolvedValue(dao);
            cidToSrcSpy.mockReturnValue(ipfsUrl);

            const metadata = await governanceMetadataUtils.generateProposalMetadata({
                params: Promise.resolve({ id, pluginAddress, proposalSlug }),
            });

            expect(getProposalBySlugSpy).toHaveBeenCalledWith({
                urlParams: { slug: proposalSlug },
                queryParams: { daoId: id },
            });

            expect(getDaoSpy).toHaveBeenCalledWith({ urlParams: { id } });
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
