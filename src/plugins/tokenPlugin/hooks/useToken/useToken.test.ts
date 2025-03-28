import { renderHook } from '@testing-library/react';
import type { Hash } from 'viem';
import * as wagmi from 'wagmi';
import { useToken } from './useToken';

describe('useToken hook', () => {
    const useReadContractsSpy = jest.spyOn(wagmi, 'useReadContracts');

    afterEach(() => {
        useReadContractsSpy.mockReset();
    });

    it('returns token data when successful', () => {
        const address: Hash = '0x1234567890abcdef1234567890abcdef123456789';
        const chainId = 42;
        const mockReturn = {
            name: 'MockToken',
            symbol: 'MTK',
            decimals: 18,
            totalSupply: '1000000000000000000',
        };
        const mockData: [string, string, number, string] = [
            mockReturn.name,
            mockReturn.symbol,
            mockReturn.decimals,
            mockReturn.totalSupply,
        ];

        useReadContractsSpy.mockReturnValue({
            data: mockData,
            isError: null,
            isLoading: false,
        } as unknown as wagmi.UseReadContractsReturnType<[string, string, number, string], false, unknown>);

        const { result } = renderHook(() => useToken({ address, chainId }));

        expect(result.current.token).toEqual(mockReturn);
        expect(result.current.isError).toBeNull();
        expect(result.current.isLoading).toBe(false);
    });

    it('returns null data and error when errored', () => {
        const address: Hash = '0x1234567890abcdef1234567890abcdef123456789';
        const chainId = 42;

        useReadContractsSpy.mockReturnValue({
            data: [] as [],
            isError: true,
            isLoading: false,
        } as unknown as wagmi.UseReadContractsReturnType<[string, string, number, string], false, unknown>);

        const { result } = renderHook(() => useToken({ address, chainId }));

        expect(result.current.token).toBeNull();
        expect(result.current.isError).toBe(true);
        expect(result.current.isLoading).toBe(false);
    });

    it('returns null data when loading', () => {
        const address: Hash = '0x1234567890abcdef1234567890abcdef123456789';
        const chainId = 42;

        useReadContractsSpy.mockReturnValue({
            data: undefined,
            isError: null,
            isLoading: true,
        } as unknown as wagmi.UseReadContractsReturnType<[string, string, number, string], false, unknown>);

        const { result } = renderHook(() => useToken({ address, chainId }));

        expect(result.current.token).toBeNull();
        expect(result.current.isError).toBeNull();
        expect(result.current.isLoading).toBe(true);
    });
});
