import { generateDao, ReactQueryWrapper } from '@/shared/testUtils';
import { renderHook, waitFor } from '@testing-library/react';
import { daoService } from '../../daoService';
import type { IGetDaoByEnsUrlParams } from '../../daoService.api';
import { Network } from '../../domain';
import { useDaoByEns } from './useDaoByEns';

describe('useDaoByEns query', () => {
    const getDaoByEnsSpy = jest.spyOn(daoService, 'getDaoByEns');

    afterEach(() => {
        getDaoByEnsSpy.mockReset();
    });

    it('fetches the specified DAO by ENS', async () => {
        const params: IGetDaoByEnsUrlParams = { ens: 'test.dao.eth', network: Network.ETHEREUM_MAINNET };
        const dao = generateDao();
        getDaoByEnsSpy.mockResolvedValue(dao);
        const { result } = renderHook(() => useDaoByEns({ urlParams: params }), { wrapper: ReactQueryWrapper });
        await waitFor(() => expect(result.current.data).toEqual(dao));
    });
});
