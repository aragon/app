import { generateDao, generateDaoPermission } from '@/shared/testUtils';
import { pluginsService } from '../pluginsService';
import { daoService } from './daoService';
import type { Network } from './domain';

describe('dao service', () => {
    const requestSpy = jest.spyOn(daoService, 'request');
    const getPluginsByDaoSpy = jest.spyOn(pluginsService, 'getPluginsByDao');

    beforeEach(() => {
        getPluginsByDaoSpy.mockResolvedValue([]);
    });

    afterEach(() => {
        requestSpy.mockReset();
        getPluginsByDaoSpy.mockReset();
    });

    it('getDao fetches the specified DAO', async () => {
        const dao = generateDao();
        const params = { urlParams: { id: 'dao-test' } };

        requestSpy.mockResolvedValue(dao);
        const result = await daoService.getDao(params);

        expect(requestSpy).toHaveBeenCalledWith(daoService.urls.dao, params);
        expect(result).toEqual(dao);
    });

    it('getDaoByEns fetches the specified DAO by ENS', async () => {
        const dao = generateDao();
        const params = { urlParams: { network: 'network-test' as Network, ens: 'ens-test' } };

        requestSpy.mockResolvedValue(dao);
        const result = await daoService.getDaoByEns(params);

        expect(requestSpy).toHaveBeenCalledWith(daoService.urls.daoByEns, params);
        expect(result).toEqual(dao);
    });

    it('getDaoPermissions fetches permissions for the specified DAO', async () => {
        const permissions = [generateDaoPermission(), generateDaoPermission({ permissionId: '0xOtherId' })];
        const paginatedResponse = {
            data: permissions,
            metadata: { page: 1, pageSize: 10, total: 2 },
        };
        const params = {
            urlParams: { network: 'network-test' as Network, daoAddress: '0xDaoAddress' },
            queryParams: { page: 1, pageSize: 10 },
        };

        requestSpy.mockResolvedValue(paginatedResponse);
        const result = await daoService.getDaoPermissions(params);

        expect(requestSpy).toHaveBeenCalledWith(daoService.urls.daoPermissions, params);
        expect(result).toEqual(paginatedResponse);
    });
});
