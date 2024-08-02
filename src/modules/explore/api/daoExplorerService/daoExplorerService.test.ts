import { generateDao } from '@/shared/testUtils';
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
});
