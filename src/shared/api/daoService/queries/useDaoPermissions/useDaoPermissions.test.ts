import { renderHook, waitFor } from '@testing-library/react';
import { generateDaoPermission, generatePaginatedResponse, ReactQueryWrapper } from '@/shared/testUtils';
import { daoService } from '../../daoService';
import { Network } from '../../domain';
import { useDaoPermissions } from './useDaoPermissions';

describe('useDaoPermissions query', () => {
    const getDaoPermissionsSpy = jest.spyOn(daoService, 'getDaoPermissions');

    afterEach(() => {
        getDaoPermissionsSpy.mockReset();
    });

    it('fetches the DAO permissions for the specified network and DAO address', async () => {
        const params = {
            urlParams: {
                network: Network.ETHEREUM_MAINNET,
                daoAddress: '0xDaoAddress',
            },
            queryParams: { page: 1, pageSize: 10 },
        };
        const permissions = [generateDaoPermission(), generateDaoPermission({ permissionId: '0xOtherId' })];
        const paginatedResponse = generatePaginatedResponse({
            data: permissions,
        });
        getDaoPermissionsSpy.mockResolvedValue(paginatedResponse);
        const { result } = renderHook(() => useDaoPermissions(params), {
            wrapper: ReactQueryWrapper,
        });
        await waitFor(() => expect(result.current.data?.pages[0]).toEqual(paginatedResponse));
    });
});
