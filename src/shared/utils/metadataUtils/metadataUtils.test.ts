import { governanceService } from '@/modules/governance/api/governanceService';
import { generateProposal } from '@/modules/governance/testUtils';
import { daoService } from '@/shared/api/daoService';
import { generateDao } from '@/shared/testUtils';
import { ipfsUtils } from '../ipfsUtils';
import { metadataUtils } from './metadataUtils';

describe('metadata utils', () => {
    const getDaoSpy = jest.spyOn(daoService, 'getDao');
    const cidToSrcSpy = jest.spyOn(ipfsUtils, 'cidToSrc');
    const getMemberSpy = jest.spyOn(governanceService, 'getMember');
    const getProposalBySlugSpy = jest.spyOn(governanceService, 'getProposalBySlug');

    afterEach(() => {
        getDaoSpy.mockReset();
        cidToSrcSpy.mockReset();
        getMemberSpy.mockReset();
        getProposalBySlugSpy.mockReset();
    });

    describe('generateDaoMetadata', () => {
        it('fetches the DAO with the given id and returns the relative title and description metadata', async () => {
            const id = 'eth-mainnet-my-dao';
            const dao = generateDao({ name: 'My DAO', description: 'Description' });
            getDaoSpy.mockResolvedValue(dao);

            const metadata = await metadataUtils.generateDaoMetadata({ params: Promise.resolve({ id }) });
            expect(metadata.title).toEqual(`${dao.name} | Governed on Aragon`);
            expect(metadata.description).toEqual(dao.description);
        });

        it('processes the DAO avatar to return a full IPFS url', async () => {
            const dao = generateDao({ avatar: 'cidTest' });
            const ipfsUrl = `https://ipfs.com/ipfs/${dao.avatar!}`;
            getDaoSpy.mockResolvedValue(dao);
            cidToSrcSpy.mockReturnValue(ipfsUrl);

            const metadata = await metadataUtils.generateDaoMetadata({ params: Promise.resolve({ id: 'test' }) });
            expect(cidToSrcSpy).toHaveBeenCalledWith(dao.avatar);
            expect(metadata.openGraph?.images).toEqual([ipfsUrl]);
        });

        it('returns undefined OG images when DAO has no avatar', async () => {
            const dao = generateDao({ avatar: undefined });
            getDaoSpy.mockResolvedValue(dao);

            const metadata = await metadataUtils.generateDaoMetadata({ params: Promise.resolve({ id: 'test' }) });
            expect(metadata.openGraph?.images).toBeUndefined();
        });
    });

    describe('generateProposalMetadata', () => {
        it('fetches proposal and returns expected metadata including dao avatar', async () => {
            const id = 'dao-id';
            const proposalSlug = 'proposal-slug';
            const proposal = generateProposal({
                title: 'A Big Change',
                description: 'We propose doing something big.',
            });
            const dao = generateDao({ avatar: 'cid123' });
            const ipfsUrl = `https://ipfs.com/ipfs/${dao.avatar!}`;

            getProposalBySlugSpy.mockResolvedValue(proposal);
            getDaoSpy.mockResolvedValue(dao);
            cidToSrcSpy.mockReturnValue(ipfsUrl);

            const metadata = await metadataUtils.generateProposalMetadata({
                params: Promise.resolve({ id, proposalSlug }),
            });

            expect(getProposalBySlugSpy).toHaveBeenCalledWith({
                urlParams: { slug: proposalSlug },
                queryParams: { daoId: id },
            });

            expect(getDaoSpy).toHaveBeenCalledWith({ urlParams: { id } });
            expect(cidToSrcSpy).toHaveBeenCalledWith(dao.avatar);

            const expectedTitle = `${proposalSlug} - ${proposal.title}`;
            expect(metadata.title).toEqual(expectedTitle);
            expect(metadata.description).toEqual(proposal.description);
            expect(metadata.openGraph).toMatchObject({
                title: expectedTitle,
                description: proposal.description,
                type: 'article',
                images: [ipfsUrl],
            });
        });

        it('returns undefined description when unavailabe and undefined OG images when DAO has no avatar', async () => {
            const id = 'dao-id';
            const proposalSlug = 'no-desc';
            const proposal = generateProposal({
                title: 'No Description',
                description: undefined,
            });
            const dao = generateDao({ avatar: undefined });

            getProposalBySlugSpy.mockResolvedValue(proposal);
            getDaoSpy.mockResolvedValue(dao);

            const metadata = await metadataUtils.generateProposalMetadata({
                params: Promise.resolve({ id, proposalSlug }),
            });

            expect(metadata.description).toBe('');
            expect(metadata.openGraph?.description).toBe('');
            expect(metadata.openGraph?.images).toBeUndefined();
        });
    });
});
