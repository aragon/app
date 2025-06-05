import { renderHook } from '@testing-library/react';
import * as wagmi from 'wagmi';
import { useToken } from './useToken';

describe('useToken hook', () => {
    const useReadContractsSpy = jest.spyOn(wagmi, 'useReadContracts');

    afterEach(() => {
        useReadContractsSpy.mockReset();
    });

    it('returns token data when successful', () => {
        const token = { name: 'MockToken', symbol: 'MTK', decimals: 18, totalSupply: '100000000' };

        useReadContractsSpy.mockReturnValue({
            data: [
                { status: 'success', result: token.name },
                { status: 'success', result: token.symbol },
                { status: 'success', result: token.decimals },
                { status: 'success', result: token.totalSupply },
            ],
            isError: false,
            isLoading: false,
        } as unknown as wagmi.UseReadContractsReturnType);

        const { result } = renderHook(() => useToken({ address: '0x111', chainId: 1 }));

        expect(result.current.data).toEqual(token);
        expect(result.current.isError).toBe(false);
        expect(result.current.isLoading).toBe(false);
    });

    it('returns null data and error when errored', () => {
        useReadContractsSpy.mockReturnValue({
            data: null,
            isError: true,
            isLoading: false,
        } as unknown as wagmi.UseReadContractsReturnType);

        const { result } = renderHook(() => useToken({ address: '0x000', chainId: 42 }));

        expect(result.current.data).toBeNull();
        expect(result.current.isError).toBe(true);
        expect(result.current.isLoading).toBe(false);
    });

    it('returns null data when loading', () => {
        useReadContractsSpy.mockReturnValue({
            data: null,
            isError: false,
            isLoading: true,
        } as unknown as wagmi.UseReadContractsReturnType);

        const { result } = renderHook(() => useToken({ address: '0x123', chainId: 1 }));

        expect(result.current.data).toBeNull();
        expect(result.current.isError).toBe(false);
        expect(result.current.isLoading).toBe(true);
    });
});
