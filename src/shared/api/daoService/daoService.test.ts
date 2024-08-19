import { generateProposal } from '@/modules/governance/testUtils';
import { generateDao, generateDaoSettings, generatePaginatedResponse } from '@/shared/testUtils';
import { daoService } from './daoService';

describe('dao service', () => {
    const requestSpy = jest.spyOn(daoService, 'request');

    afterEach(() => {
        requestSpy.mockReset();
    });

    it('getDao fetches the specified DAO', async () => {
        const dao = generateDao();
        const params = { urlParams: { id: 'dao-test' } };

        requestSpy.mockResolvedValue(dao);
        const result = await daoService.getDao(params);

        expect(requestSpy).toHaveBeenCalledWith(daoService['urls'].dao, params);
        expect(result).toEqual(dao);
    });

    it('getDaoSettings fetches the settings of the specified DAO', async () => {
        const settings = generateDaoSettings();
        const params = { urlParams: { daoId: 'dao-test' } };

        requestSpy.mockResolvedValue(settings);
        const result = await daoService.getDaoSettings(params);

        expect(requestSpy).toHaveBeenCalledWith(daoService['urls'].daoSettings, params);
        expect(result).toEqual(settings);
    });

    it('getProposalListByMemberAddress fetches a paginated list of proposals for a given member address', async () => {
        const proposals = [
            generateProposal({ id: 'proposal-0x1' }),
            generateProposal({ id: 'proposal-0x2' }),
            generateProposal({ id: 'proposal-0x3' }),
        ];
        const proposalListByMemberResponse = generatePaginatedResponse({ data: proposals });
        const params = { queryParams: { creatorAddress: '0xCreator', daoId: '0xDao', pageSize: 3 } };

        requestSpy.mockResolvedValue(proposalListByMemberResponse);
        const result = await daoService.getProposalListByMemberAddress(params);

        expect(requestSpy).toHaveBeenCalledWith(daoService['urls'].proposalListByMemberAddress, {
            queryParams: params.queryParams,
        });
        expect(result).toEqual(proposalListByMemberResponse);
    });
});
