import { renderHook } from '@testing-library/react';
import * as wagmi from 'wagmi';
import { useToken } from './useToken';

describe('useToken hook', () => {
    const useReadContractsSpy = jest.spyOn(wagmi, 'useReadContracts');

    afterEach(() => {
        useReadContractsSpy.mockReset();
    });

    it('returns token data when successful', () => {
        const token = {
            name: 'MockToken',
            symbol: 'MTK',
            decimals: 18,
            totalSupply: '100000000',
        };

        useReadContractsSpy.mockReturnValue({
            data: [token.name, token.symbol, token.decimals, token.totalSupply],
            isError: false,
            isLoading: false,
        } as unknown as wagmi.UseReadContractsReturnType);

        const { result } = renderHook(() =>
            useToken({ address: '0x111', chainId: 1 }),
        );

        expect(result.current.data).toEqual(token);
        expect(result.current.isError).toBeFalsy();
        expect(result.current.isLoading).toBeFalsy();
    });

    it('returns null data and error when errored', () => {
        useReadContractsSpy.mockReturnValue({
            data: null,
            isError: true,
            isLoading: false,
        } as unknown as wagmi.UseReadContractsReturnType);

        const { result } = renderHook(() =>
            useToken({ address: '0x000', chainId: 42 }),
        );

        expect(result.current.data).toBeNull();
        expect(result.current.isError).toBeTruthy();
        expect(result.current.isLoading).toBeFalsy();
    });

    it('returns null data when loading', () => {
        useReadContractsSpy.mockReturnValue({
            data: null,
            isError: false,
            isLoading: true,
        } as unknown as wagmi.UseReadContractsReturnType);

        const { result } = renderHook(() =>
            useToken({ address: '0x123', chainId: 1 }),
        );

        expect(result.current.data).toBeNull();
        expect(result.current.isError).toBeFalsy();
        expect(result.current.isLoading).toBeTruthy();
    });
});
