import { generateDao } from '@/shared/testUtils';
import { daoService } from './daoService';
import type { Network } from './domain';

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

    it('getDaoByEns fetches the specified DAO by ENS', async () => {
        const dao = generateDao();
        const params = { urlParams: { network: 'network-test' as Network, ens: 'ens-test' } };

        requestSpy.mockResolvedValue(dao);
        const result = await daoService.getDaoByEns(params);

        expect(requestSpy).toHaveBeenCalledWith(daoService['urls'].daoByEns, params);
        expect(result).toEqual(dao);
    });
});
