import { renderHook } from '@testing-library/react';
import { zeroAddress } from 'viem';
import * as wagmi from 'wagmi';
import { Network } from '@/shared/api/daoService';
import { useTokenDelegationOnboardingCheck } from './useTokenDelegationOnboardingCheck';

describe('useTokenDelegationOnboardingCheck', () => {
    const useReadContractsSpy = jest.spyOn(wagmi, 'useReadContracts');

    afterEach(() => {
        useReadContractsSpy.mockReset();
    });

    it('returns shouldTrigger=true when delegate is zeroAddress and balance > 0', () => {
        useReadContractsSpy.mockReturnValue({
            data: [
                { result: zeroAddress, status: 'success' },
                { result: BigInt(100), status: 'success' },
            ],
            isLoading: false,
            isError: false,
        } as unknown as wagmi.UseReadContractsReturnType);

        const { result } = renderHook(() =>
            useTokenDelegationOnboardingCheck({
                tokenAddress: '0x123',
                userAddress: '0x456',
                network: Network.ETHEREUM_MAINNET,
            }),
        );

        expect(result.current.shouldTrigger).toBe(true);
        expect(result.current.isLoading).toBe(false);
    });

    it('returns shouldTrigger=false when delegate is set (non-zero)', () => {
        useReadContractsSpy.mockReturnValue({
            data: [
                { result: '0xdeadbeef', status: 'success' },
                { result: BigInt(100), status: 'success' },
            ],
            isLoading: false,
            isError: false,
        } as unknown as wagmi.UseReadContractsReturnType);

        const { result } = renderHook(() =>
            useTokenDelegationOnboardingCheck({
                tokenAddress: '0x123',
                userAddress: '0x456',
                network: Network.ETHEREUM_MAINNET,
            }),
        );

        expect(result.current.shouldTrigger).toBe(false);
    });

    it('returns shouldTrigger=false when balance is 0', () => {
        useReadContractsSpy.mockReturnValue({
            data: [
                { result: zeroAddress, status: 'success' },
                { result: BigInt(0), status: 'success' },
            ],
            isLoading: false,
            isError: false,
        } as unknown as wagmi.UseReadContractsReturnType);

        const { result } = renderHook(() =>
            useTokenDelegationOnboardingCheck({
                tokenAddress: '0x123',
                userAddress: '0x456',
                network: Network.ETHEREUM_MAINNET,
            }),
        );

        expect(result.current.shouldTrigger).toBe(false);
    });

    it('returns shouldTrigger=false and isLoading=true while loading', () => {
        useReadContractsSpy.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        } as unknown as wagmi.UseReadContractsReturnType);

        const { result } = renderHook(() =>
            useTokenDelegationOnboardingCheck({
                tokenAddress: '0x123',
                userAddress: '0x456',
                network: Network.ETHEREUM_MAINNET,
            }),
        );

        expect(result.current.shouldTrigger).toBe(false);
        expect(result.current.isLoading).toBe(true);
    });

    it('disables queries when userAddress is not provided', () => {
        useReadContractsSpy.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        } as unknown as wagmi.UseReadContractsReturnType);

        renderHook(() =>
            useTokenDelegationOnboardingCheck({
                tokenAddress: '0x123',
                network: Network.ETHEREUM_MAINNET,
            }),
        );

        expect(useReadContractsSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                query: { enabled: false },
            }),
        );
    });
});
