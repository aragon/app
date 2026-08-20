import { renderHook, waitFor } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import { generateSafeInfo, ReactQueryWrapper } from '@/shared/testUtils';
import { safeService } from '../../safeService';
import { useSafeInfo } from './useSafeInfo';

describe('useSafeInfo query', () => {
    const getSafeInfoSpy = jest.spyOn(safeService, 'getSafeInfo');

    afterEach(() => {
        getSafeInfoSpy.mockReset();
    });

    it('fetches the owners and threshold of the specified safe', async () => {
        const urlParams = {
            network: Network.ETHEREUM_MAINNET,
            address: '0xSafeAddress',
        };
        const safeInfo = generateSafeInfo({
            owners: ['0xOwnerOne', '0xOwnerTwo'],
            threshold: 2,
        });
        getSafeInfoSpy.mockResolvedValue(safeInfo);

        const { result } = renderHook(() => useSafeInfo({ urlParams }), {
            wrapper: ReactQueryWrapper,
        });

        await waitFor(() => expect(result.current.data).toEqual(safeInfo));
    });
});
