import { governanceService } from '@/modules/governance/api/governanceService';
import { generateProposal } from '@/modules/governance/testUtils';
import { daoService, Network } from '@/shared/api/daoService';
import { generateDao } from '@/shared/testUtils';
import * as WagmiActions from 'wagmi/actions';
import { ipfsUtils } from '../../../../shared/utils/ipfsUtils';
import { governanceMetadataUtils } from './governanceMetadataUtils';

describe('governanceMetadata utils', () => {
    const getDaoSpy = jest.spyOn(daoService, 'getDao');
    const cidToSrcSpy = jest.spyOn(ipfsUtils, 'cidToSrc');
    const getProposalBySlugSpy = jest.spyOn(governanceService, 'getProposalBySlug');
    const getEnsAddressSpy = jest.spyOn(WagmiActions, 'getEnsAddress');

    afterEach(() => {
        getDaoSpy.mockReset();
        cidToSrcSpy.mockReset();
        getProposalBySlugSpy.mockReset();
        getEnsAddressSpy.mockReset();
    });

    describe('generateProposalMetadata', () => {
        it('fetches proposal and returns expected metadata including dao avatar', async () => {
            const daoEns = 'test.dao.eth';
            const daoAddress = '0x12345';
            const proposalSlug = 'proposal-slug';
            const proposal = generateProposal({
                title: 'A Big Change',
                summary: 'We propose doing something big.',
            });
            const dao = generateDao({ avatar: 'cid123' });
            const ipfsUrl = `https://ipfs.com/ipfs/${dao.avatar!}`;
            const expectedDaoId = `${Network.ETHEREUM_MAINNET}-${daoAddress}`;

            getProposalBySlugSpy.mockResolvedValue(proposal);
            getDaoSpy.mockResolvedValue(dao);
            cidToSrcSpy.mockReturnValue(ipfsUrl);
            getEnsAddressSpy.mockResolvedValue(daoAddress);

            const metadata = await governanceMetadataUtils.generateProposalMetadata({
                params: Promise.resolve({ addressOrEns: daoEns, network: Network.ETHEREUM_MAINNET, proposalSlug }),
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
