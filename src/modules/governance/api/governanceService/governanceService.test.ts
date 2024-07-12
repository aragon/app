import { generateMember, generateProposal } from '../../testUtils';
import { governanceService } from './governanceService';

describe('governance service', () => {
    const requestSpy = jest.spyOn(governanceService, 'request');

    afterEach(() => {
        requestSpy.mockReset();
    });

    it('getMemberList fetches the members of the specified DAO', async () => {
        const members = [generateMember({ address: '0x123' }), generateMember({ address: '0x456' })];
        const params = { queryParams: { daoId: 'dao-id-test' } };

        requestSpy.mockResolvedValue(members);
        const result = await governanceService.getMemberList(params);

        expect(requestSpy).toHaveBeenCalledWith(governanceService['urls'].members, params);
        expect(result).toEqual(members);
    });

    it('getProposalList fetches proposals of the specified DAO', async () => {
        const proposals = [generateProposal({ id: '0' }), generateProposal({ id: '1' })];
        const params = { queryParams: { daoId: 'dao-id-test' } };

        requestSpy.mockResolvedValue(proposals);
        const result = await governanceService.getProposalList(params);

        expect(requestSpy).toHaveBeenCalledWith(governanceService['urls'].proposals, params);
        expect(result).toEqual(proposals);
    });

    it('getMember fetches the members of the specified DAO by address', async () => {
        const member = generateMember({ address: '0x123' });
        const params = { urlParams: { address: member.address }, queryParams: { daoId: 'dao-id-test' } };

        requestSpy.mockResolvedValue(member);
        const result = await governanceService.getMember(params);

        expect(requestSpy).toHaveBeenCalledWith(governanceService['urls'].member, params);
        expect(result).toEqual(member);
    });
});
