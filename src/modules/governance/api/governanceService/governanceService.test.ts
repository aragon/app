import { generateMember } from '../../testUtils';
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
});
