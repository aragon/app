import { generateDao, generateDaoPermission } from '@/shared/testUtils';
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

    it('getDaoPermissions fetches permissions for the specified DAO', async () => {
        const permissions = [generateDaoPermission(), generateDaoPermission({ permissionId: '0xOtherId' })];
        const params = { urlParams: { network: 'network-test' as Network, daoAddress: '0xDaoAddress' } };

        requestSpy.mockResolvedValue(permissions);
        const result = await daoService.getDaoPermissions(params);

        expect(requestSpy).toHaveBeenCalledWith(daoService['urls'].daoPermissions, params);
        expect(result).toEqual(permissions);
    });
});
