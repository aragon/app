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

    it('getDaoListByMember fetches a paginated list of DAOs for a given member address', async () => {
        const daoList = [generateDao({ id: '0x1' }), generateDao({ id: '0x2' }), generateDao({ id: '0x3' })];
        const daoListByMemberResponse = generatePaginatedResponse({ data: daoList });
        const params = { urlParams: { address: 'testAddress' }, queryParams: { pageSize: 3 } };

        requestSpy.mockResolvedValue(daoListByMemberResponse);
        const result = await daoService.getDaoListByMemberAddress(params);

        expect(requestSpy).toHaveBeenCalledWith(daoService['urls'].daoListByMemberAddress, params);
        expect(result).toEqual(daoListByMemberResponse);
    });
});
