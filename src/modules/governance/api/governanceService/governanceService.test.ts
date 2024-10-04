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

    it('getProposal fetches the proposal with the specified ID', async () => {
        const proposal = generateProposal({ id: '001' });
        const params = { urlParams: { id: proposal.id } };

        requestSpy.mockResolvedValue(proposal);
        const result = await governanceService.getProposal(params);

        expect(requestSpy).toHaveBeenCalledWith(governanceService['urls'].proposal, params);
        expect(result).toEqual(proposal);
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
