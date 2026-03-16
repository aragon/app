import { renderHook } from '@testing-library/react';
import * as wagmi from 'wagmi';
import { Network } from '@/shared/api/daoService';
import { useTokenLockAndWrapOnboardingCheck } from './useTokenLockAndWrapOnboardingCheck';

describe('useTokenLockAndWrapOnboardingCheck', () => {
    const useReadContractsSpy = jest.spyOn(wagmi, 'useReadContracts');

    afterEach(() => {
        useReadContractsSpy.mockReset();
    });

    it('returns shouldTrigger=true when getVotes=0n and balanceOf>0n', () => {
        useReadContractsSpy.mockReturnValue({
            data: [
                { result: BigInt(0), status: 'success' },
                { result: BigInt(100), status: 'success' },
            ],
            isLoading: false,
            isError: false,
        } as unknown as wagmi.UseReadContractsReturnType);

        const { result } = renderHook(() =>
            useTokenLockAndWrapOnboardingCheck({
                governanceTokenAddress: '0x123',
                underlyingTokenAddress: '0x456',
                userAddress: '0x789',
                network: Network.ETHEREUM_MAINNET,
            }),
        );

        expect(result.current.shouldTrigger).toBe(true);
        expect(result.current.isLoading).toBe(false);
    });

    it('returns shouldTrigger=false when getVotes>0n', () => {
        useReadContractsSpy.mockReturnValue({
            data: [
                { result: BigInt(50), status: 'success' },
                { result: BigInt(100), status: 'success' },
            ],
            isLoading: false,
            isError: false,
        } as unknown as wagmi.UseReadContractsReturnType);

        const { result } = renderHook(() =>
            useTokenLockAndWrapOnboardingCheck({
                governanceTokenAddress: '0x123',
                underlyingTokenAddress: '0x456',
                userAddress: '0x789',
                network: Network.ETHEREUM_MAINNET,
            }),
        );

        expect(result.current.shouldTrigger).toBe(false);
    });

    it('returns shouldTrigger=false when balanceOf=0n', () => {
        useReadContractsSpy.mockReturnValue({
            data: [
                { result: BigInt(0), status: 'success' },
                { result: BigInt(0), status: 'success' },
            ],
            isLoading: false,
            isError: false,
        } as unknown as wagmi.UseReadContractsReturnType);

        const { result } = renderHook(() =>
            useTokenLockAndWrapOnboardingCheck({
                governanceTokenAddress: '0x123',
                underlyingTokenAddress: '0x456',
                userAddress: '0x789',
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
            useTokenLockAndWrapOnboardingCheck({
                governanceTokenAddress: '0x123',
                underlyingTokenAddress: '0x456',
                userAddress: '0x789',
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
            useTokenLockAndWrapOnboardingCheck({
                governanceTokenAddress: '0x123',
                underlyingTokenAddress: '0x456',
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
