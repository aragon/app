import { Network } from '@/shared/api/daoService';
import { renderHook } from '@testing-library/react';
import * as wagmi from 'wagmi';
import { useTokenCurrentDelegate } from './useTokenCurrentDelegate';

describe('useTokenCurrentDelegate hook', () => {
    const useReadContractSpy = jest.spyOn(wagmi, 'useReadContract');

    afterEach(() => {
        useReadContractSpy.mockReset();
    });

    it('returns current delegate address when contract call succeeds', () => {
        const mockDelegate = '0xabcdef123456789';
        useReadContractSpy.mockReturnValue({
            data: mockDelegate,
            isError: false,
            isLoading: false,
        } as unknown as wagmi.UseReadContractReturnType);

        const { result } = renderHook(() =>
            useTokenCurrentDelegate({
                tokenAddress: '0x123',
                userAddress: '0x456',
                network: Network.ETHEREUM_MAINNET,
            }),
        );

        expect(result.current.data).toBe(mockDelegate);
    });

    it('returns null when contract returns undefined data', () => {
        useReadContractSpy.mockReturnValue({
            data: undefined,
            isError: false,
            isLoading: false,
        } as unknown as wagmi.UseReadContractReturnType);

        const { result } = renderHook(() =>
            useTokenCurrentDelegate({
                tokenAddress: '0x123',
                userAddress: '0x456',
                network: Network.ETHEREUM_MAINNET,
            }),
        );

        expect(result.current.data).toBe(undefined);
    });

    it('disables query when tokenAddress is missing', () => {
        useReadContractSpy.mockReturnValue({
            data: undefined,
            isError: false,
            isLoading: false,
        } as unknown as wagmi.UseReadContractReturnType);

        renderHook(() =>
            useTokenCurrentDelegate({
                userAddress: '0x456',
                network: Network.ETHEREUM_MAINNET,
            }),
        );

        expect(useReadContractSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                query: { enabled: false },
            }),
        );
    });

    it('disables query when userAddress is missing', () => {
        useReadContractSpy.mockReturnValue({
            data: undefined,
            isError: false,
            isLoading: false,
        } as unknown as wagmi.UseReadContractReturnType);

        renderHook(() =>
            useTokenCurrentDelegate({
                tokenAddress: '0x123',
                network: Network.ETHEREUM_MAINNET,
            }),
        );

        expect(useReadContractSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                query: { enabled: false },
            }),
        );
    });
});
