import { Network } from '@/shared/api/daoService';
import { generateMember, generateProposal, generateVote } from '../../testUtils';
import { governanceService } from './governanceService';

describe('governance service', () => {
    const requestSpy = jest.spyOn(governanceService, 'request');

    afterEach(() => {
        requestSpy.mockReset();
    });

    it('getMemberList fetches the members of the specified DAO', async () => {
        const members = [generateMember({ address: '0x123' }), generateMember({ address: '0x456' })];
        const params = { queryParams: { daoId: 'dao-id-test', pluginAddress: '0x123' } };

        requestSpy.mockResolvedValue(members);
        const result = await governanceService.getMemberList(params);

        expect(requestSpy).toHaveBeenCalledWith(governanceService['urls'].members, params);
        expect(result).toEqual(members);
    });

    it('getMember fetches the member of the specified DAO by address', async () => {
        const member = generateMember({ address: '0x123' });
        const params = { urlParams: { address: member.address }, queryParams: { daoId: 'dao-id-test' } };

        requestSpy.mockResolvedValue(member);
        const result = await governanceService.getMember(params);

        expect(requestSpy).toHaveBeenCalledWith(governanceService['urls'].member, params);
        expect(result).toEqual(member);
    });

    it('getProposalList fetches proposals of the specified DAO', async () => {
        const proposals = [generateProposal({ id: '0' }), generateProposal({ id: '1' })];
        const params = { queryParams: { daoId: 'dao-id-test', pluginAddress: '0x123' } };

        requestSpy.mockResolvedValue(proposals);
        const result = await governanceService.getProposalList(params);

        expect(requestSpy).toHaveBeenCalledWith(governanceService['urls'].proposals, params);
        expect(result).toEqual(proposals);
    });

    it('getProposalBySlug fetches the proposal with the correct slug and incremental ID', async () => {
        const proposal = generateProposal({ id: '001', incrementalId: 1 });
        const proposalParams = {
            urlParams: { slug: proposal.id },
            queryParams: { daoId: 'test-id' },
        };

        requestSpy.mockResolvedValue(proposal);
        const result = await governanceService.getProposalBySlug(proposalParams);

        expect(requestSpy).toHaveBeenCalledWith(governanceService['urls'].proposalBySlug, proposalParams);
        expect(result).toEqual(proposal);
    });

    it('getCanVote fetches if the member can vote on the specified proposal', async () => {
        const canVote = true;
        const params = { urlParams: { id: 'proposal-id' }, queryParams: { userAddress: '0x123' } };

        requestSpy.mockResolvedValue(canVote);
        const result = await governanceService.getCanVote(params);

        expect(requestSpy).toHaveBeenCalledWith(governanceService['urls'].canVote, params);
        expect(result).toEqual(canVote);
    });

    it('getCanCreateProposal fetches if the member can create a proposal on the specified plugin', async () => {
        const canCreateProposal = true;
        const params = {
            queryParams: { memberAddress: '0x123', pluginAddress: '0x456', network: Network.BASE_MAINNET },
        };

        requestSpy.mockResolvedValue(canCreateProposal);
        const result = await governanceService.getCanCreateProposal(params);

        expect(requestSpy).toHaveBeenCalledWith(governanceService['urls'].canCreateProposal, params);
        expect(result).toEqual(canCreateProposal);
    });

    it('getVoteList fetches the votes of a specific proposal', async () => {
        const votes = [generateVote({ transactionHash: '0' }), generateVote({ transactionHash: '1' })];
        const params = { queryParams: { proposalId: 'proposal-id', pluginAddress: '0x123' } };

        requestSpy.mockResolvedValue(votes);
        const result = await governanceService.getVoteList(params);

        expect(requestSpy).toHaveBeenCalledWith(governanceService['urls'].votes, params);
        expect(result).toEqual(votes);
    });
});
