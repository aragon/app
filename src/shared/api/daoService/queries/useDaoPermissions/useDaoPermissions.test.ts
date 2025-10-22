import { ReactQueryWrapper, generateDaoPermission } from '@/shared/testUtils';
import { renderHook, waitFor } from '@testing-library/react';
import { daoService } from '../../daoService';
import { Network } from '../../domain';
import { useDaoPermissions } from './useDaoPermissions';

describe('useDaoPermissions query', () => {
    const getDaoPermissionsSpy = jest.spyOn(daoService, 'getDaoPermissions');

    afterEach(() => {
        getDaoPermissionsSpy.mockReset();
    });

    it('fetches the DAO permissions for the specified network and DAO address', async () => {
        const params = { network: Network.ETHEREUM_MAINNET, daoAddress: '0xDaoAddress' };
        const permissions = [generateDaoPermission(), generateDaoPermission({ permissionId: '0xOtherId' })];
        getDaoPermissionsSpy.mockResolvedValue(permissions);
        const { result } = renderHook(() => useDaoPermissions({ urlParams: params }), {
            wrapper: ReactQueryWrapper,
        });
        await waitFor(() => expect(result.current.data).toEqual(permissions));
    });
});
