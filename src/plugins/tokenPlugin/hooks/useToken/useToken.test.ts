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
        const mockReturn = {
            decimals: 18,
            name: 'MockToken',
            symbol: 'MTK',
            totalSupply: '1000000000000000000',
        };

        const mockData: [number, string, string, string] = [
            mockReturn.decimals,
            mockReturn.name,
            mockReturn.symbol,
            mockReturn.totalSupply,
        ];

        const mockAddress: Hash = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

        useReadContractsSpy.mockReturnValue({
            data: mockData,
            error: null,
            isLoading: false,
        } as unknown as wagmi.UseReadContractsReturnType<[number, string, string, string], false, unknown>);

        const { result } = renderHook(() => useToken({ address: mockAddress, chainId: 1 }));

        expect(result.current.data).toEqual(mockReturn);
        expect(result.current.error).toBeNull();
        expect(result.current.isLoading).toBe(false);
    });

    it('returns null data and error when errored', () => {
        const error = new Error('Something went wrong');
        const mockAddress: Hash = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';

        useReadContractsSpy.mockReturnValue({
            data: [] as [],
            error,
            isLoading: false,
        } as unknown as wagmi.UseReadContractsReturnType<[], false, unknown>);

        const { result } = renderHook(() => useToken({ address: mockAddress, chainId: 10 }));

        expect(result.current.data).toBeNull();
        expect(result.current.error).toBe(error);
        expect(result.current.isLoading).toBe(false);
    });

    it('returns null data when loading', () => {
        const mockAddress: Hash = '0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef';

        useReadContractsSpy.mockReturnValue({
            data: undefined,
            error: null,
            isLoading: true,
        } as unknown as wagmi.UseReadContractsReturnType<[number, string, string, bigint], false, unknown>);

        const { result } = renderHook(() => useToken({ address: mockAddress }));

        expect(result.current.data).toBeNull();
        expect(result.current.error).toBeNull();
        expect(result.current.isLoading).toBe(true);
    });
});
