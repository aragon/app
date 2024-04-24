import { generateDao } from '@/shared/testUtils';
import { daoService } from './daoService';

describe('dao service', () => {
    const requestSpy = jest.spyOn(daoService, 'request');

    afterEach(() => {
        requestSpy.mockReset();
    });

    it('getDao fetches the specified DAO', async () => {
        const dao = generateDao();
        const params = { urlParams: { slug: 'dao-test' } };

        requestSpy.mockResolvedValue(dao);
        const result = await daoService.getDao(params);

        expect(requestSpy).toHaveBeenCalledWith(daoService['urls'].dao, params);
        expect(result).toEqual(dao);
    });
});
