import { renderHook } from '@testing-library/react';
import * as wagmi from 'wagmi';
import { useToken } from './useToken';

describe('useToken hook', () => {
    const useReadContractsSpy = jest.spyOn(wagmi, 'useReadContracts');

    afterEach(() => {
        useReadContractsSpy.mockReset();
    });

    it('returns token data when successful', () => {
        const mockReturn = { name: 'MockToken', symbol: 'MTK', decimals: 18, totalSupply: '100000000' };
        const mockData = [mockReturn.name, mockReturn.symbol, mockReturn.decimals, mockReturn.totalSupply];

        useReadContractsSpy.mockReturnValue({
            data: mockData,
            isError: null,
            isLoading: false,
        } as unknown as wagmi.UseReadContractsReturnType);

        const { result } = renderHook(() => useToken({ address: '0x111', chainId: 1 }));

        expect(result.current.token).toEqual(mockReturn);
        expect(result.current.isError).toBeNull();
        expect(result.current.isLoading).toBe(false);
    });

    it('returns null data and error when errored', () => {
        useReadContractsSpy.mockReturnValue({
            data: [],
            isError: true,
            isLoading: false,
        } as unknown as wagmi.UseReadContractsReturnType);

        const { result } = renderHook(() => useToken({ address: '0x000', chainId: 42 }));

        expect(result.current.token).toBeNull();
        expect(result.current.isError).toBe(true);
        expect(result.current.isLoading).toBe(false);
    });

    it('returns null data when loading', () => {
        useReadContractsSpy.mockReturnValue({
            data: undefined,
            isError: null,
            isLoading: true,
        } as unknown as wagmi.UseReadContractsReturnType);

        const { result } = renderHook(() => useToken({ address: '0x123', chainId: 1 }));

        expect(result.current.token).toBeNull();
        expect(result.current.isError).toBeNull();
        expect(result.current.isLoading).toBe(true);
    });
});
