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

        useReadContractsSpy
            .mockReturnValueOnce({
                isError: false,
                isLoading: false,
            } as unknown as wagmi.UseReadContractsReturnType)
            .mockReturnValueOnce({
                data: [
                    { status: 'success', result: mockReturn.name },
                    { status: 'success', result: mockReturn.symbol },
                    { status: 'success', result: mockReturn.decimals },
                    { status: 'success', result: mockReturn.totalSupply },
                ],
                isError: false,
                isLoading: false,
            } as unknown as wagmi.UseReadContractsReturnType);

        const { result } = renderHook(() => useToken({ address: '0x111', chainId: 1 }));

        expect(result.current.token).toEqual(mockReturn);
        expect(result.current.isError).toBe(false);
        expect(result.current.isLoading).toBe(false);
    });

    it('returns null data and error when errored', () => {
        useReadContractsSpy
            .mockReturnValueOnce({
                isError: true,
                isLoading: false,
            } as unknown as wagmi.UseReadContractsReturnType)
            .mockReturnValueOnce({
                data: [],
                isError: false,
                isLoading: false,
            } as unknown as wagmi.UseReadContractsReturnType);

        const { result } = renderHook(() => useToken({ address: '0x000', chainId: 42 }));

        expect(result.current.token).toBeNull();
        expect(result.current.isError).toBe(true);
        expect(result.current.isLoading).toBe(false);
    });

    it('returns null data when loading', () => {
        useReadContractsSpy
            .mockReturnValueOnce({
                isError: false,
                isLoading: true,
            } as unknown as wagmi.UseReadContractsReturnType)
            .mockReturnValueOnce({
                data: undefined,
                isError: false,
                isLoading: false,
            } as unknown as wagmi.UseReadContractsReturnType);

        const { result } = renderHook(() => useToken({ address: '0x123', chainId: 1 }));

        expect(result.current.token).toBeNull();
        expect(result.current.isError).toBe(false);
        expect(result.current.isLoading).toBe(true);
    });
});
