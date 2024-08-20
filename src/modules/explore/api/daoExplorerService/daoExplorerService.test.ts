import { generateDao, generatePaginatedResponse } from '@/shared/testUtils';
import { daoExplorerService } from './daoExplorerService';

describe('daoExplorer service', () => {
    const requestSpy = jest.spyOn(daoExplorerService, 'request');

    afterEach(() => {
        requestSpy.mockReset();
    });

    it('getDaoList fetches a list of DAOs', async () => {
        const daos = [generateDao({ address: '0x123' }), generateDao({ address: '0x456' })];
        const params = { queryParams: {} };

        requestSpy.mockResolvedValue(daos);
        const result = await daoExplorerService.getDaoList(params);

        expect(requestSpy).toHaveBeenCalledWith(daoExplorerService['urls'].daos, params);
        expect(result).toEqual(daos);
    });

    it('getDaoListByMember fetches a paginated list of DAOs for a given member address', async () => {
        const daoList = [generateDao({ id: '0x1' }), generateDao({ id: '0x2' }), generateDao({ id: '0x3' })];
        const daoListByMemberResponse = generatePaginatedResponse({ data: daoList });
        const params = { urlParams: { address: 'testAddress' }, queryParams: { pageSize: 3 } };

        requestSpy.mockResolvedValue(daoListByMemberResponse);
        const result = await daoExplorerService.getDaoListByMemberAddress(params);

        expect(requestSpy).toHaveBeenCalledWith(daoExplorerService['urls'].daoListByMemberAddress, params);
        expect(result).toEqual(daoListByMemberResponse);
    });
});
