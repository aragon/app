import { renderHook } from '@testing-library/react';
import * as wagmi from 'wagmi';
import { useTokenTotalSupply } from './useTokenTotalSupply';

describe('useTokenTotalSupply hook', () => {
    const useReadContractSpy = jest.spyOn(wagmi, 'useReadContract');

    afterEach(() => {
        useReadContractSpy.mockReset();
    });

    it('returns total supply when successful', () => {
        const totalSupply = BigInt(1_000_000);

        useReadContractSpy.mockReturnValue({
            data: totalSupply,
            isError: false,
            isLoading: false,
        } as unknown as wagmi.UseReadContractReturnType);

        const { result } = renderHook(() =>
            useTokenTotalSupply({ address: '0x111', chainId: 1 }),
        );

        expect(result.current.data).toEqual(totalSupply);
        expect(result.current.error).toBeUndefined();
        expect(result.current.isError).toBeFalsy();
        expect(result.current.isLoading).toBeFalsy();
    });

    it('returns error message when errored', () => {
        useReadContractSpy.mockReturnValue({
            data: undefined,
            isError: true,
            isLoading: false,
        } as unknown as wagmi.UseReadContractReturnType);

        const { result } = renderHook(() =>
            useTokenTotalSupply({ address: '0x000', chainId: 42 }),
        );

        expect(result.current.data).toBeUndefined();
        expect(result.current.error).toMatch(/useTokenTotalSupply\.error/);
        expect(result.current.isError).toBeTruthy();
        expect(result.current.isLoading).toBeFalsy();
    });

    it('returns loading state when loading', () => {
        useReadContractSpy.mockReturnValue({
            data: undefined,
            isError: false,
            isLoading: true,
        } as unknown as wagmi.UseReadContractReturnType);

        const { result } = renderHook(() =>
            useTokenTotalSupply({ address: '0x123', chainId: 1 }),
        );

        expect(result.current.data).toBeUndefined();
        expect(result.current.error).toBeUndefined();
        expect(result.current.isError).toBeFalsy();
        expect(result.current.isLoading).toBeTruthy();
    });
});
