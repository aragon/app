import { daoService } from '@/shared/api/daoService/daoService';
import { ReactQueryWrapper, generateDao, generatePaginatedResponse } from '@/shared/testUtils';
import { renderHook, waitFor } from '@testing-library/react';
import { useDaoListByMemberAddress } from './useDaoListByMemberAddress';

describe('useDaoListByMemberAddress query', () => {
    const getDaoListByMemberSpy = jest.spyOn(daoService, 'getDaoListByMemberAddress');

    afterEach(() => {
        getDaoListByMemberSpy.mockReset();
    });

    it('fetches the DAO list for a given member address', async () => {
        const params = { urlParams: { address: 'testAddress' }, queryParams: { pageSize: 3 } };
        const daoList = [generateDao({ id: '0x1' }), generateDao({ id: '0x2' }), generateDao({ id: '0x3' })];
        const daoListByMemberResponse = generatePaginatedResponse({ data: daoList });

        getDaoListByMemberSpy.mockResolvedValue(daoListByMemberResponse);

        const { result } = renderHook(() => useDaoListByMemberAddress(params), { wrapper: ReactQueryWrapper });

        await waitFor(() => expect(result.current.data?.pages[0]).toEqual(daoListByMemberResponse));
    });
});
