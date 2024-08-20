import { generateDao, generateDaoSettings } from '@/shared/testUtils';
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
});
