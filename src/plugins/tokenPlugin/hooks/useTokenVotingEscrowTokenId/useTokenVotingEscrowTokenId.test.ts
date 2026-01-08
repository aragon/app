import { renderHook, waitFor } from '@testing-library/react';
import type { Hex } from 'viem';
import * as Wagmi from 'wagmi';
import { useTokenVotingEscrowTokenId } from './useTokenVotingEscrowTokenId';

describe('useTokenExitQueueTokenId hook', () => {
    const useReadContractSpy: jest.SpyInstance<
        ReturnType<typeof Wagmi.useReadContract>,
        Parameters<typeof Wagmi.useReadContract>
    > = jest.spyOn(Wagmi, 'useReadContract');

    const createUseReadContractResult = ({
        data,
        isLoading = false,
    }: {
        data: unknown;
        isLoading?: boolean;
    }) =>
        ({
            data,
            isLoading,
            refetch: jest.fn(),
        }) as unknown as ReturnType<typeof Wagmi.useReadContract>;

    afterEach(() => {
        useReadContractSpy.mockReset();
    });

    it('returns tokenId when user has a lock', async () => {
        const mockTokenId = BigInt(42);
        const mockBalance = BigInt(1);

        useReadContractSpy
            .mockReturnValueOnce(
                createUseReadContractResult({ data: mockBalance }),
            )
            .mockReturnValueOnce(
                createUseReadContractResult({ data: mockTokenId }),
            );

        const { result } = renderHook(() =>
            useTokenVotingEscrowTokenId({
                escrowAddress: '0x123' as Hex,
                userAddress: '0xabc' as Hex,
                chainId: 1,
            }),
        );

        await waitFor(() => {
            expect(result.current.tokenId).toBe(mockTokenId);
            expect(result.current.isLoading).toBe(false);
        });
    });

    it('returns undefined tokenId when user has no locks', async () => {
        const mockBalance = BigInt(0);

        useReadContractSpy
            .mockReturnValueOnce(
                createUseReadContractResult({ data: mockBalance }),
            )
            .mockReturnValueOnce(
                createUseReadContractResult({ data: undefined }),
            );

        const { result } = renderHook(() =>
            useTokenVotingEscrowTokenId({
                escrowAddress: '0x123' as Hex,
                userAddress: '0xabc' as Hex,
                chainId: 1,
            }),
        );

        await waitFor(() => {
            expect(result.current.tokenId).toBeUndefined();
            expect(result.current.isLoading).toBe(false);
        });
    });

    it('respects enabled flag', () => {
        useReadContractSpy.mockReturnValue(
            createUseReadContractResult({ data: undefined }),
        );

        renderHook(() =>
            useTokenVotingEscrowTokenId({
                escrowAddress: '0x123' as Hex,
                userAddress: '0xabc' as Hex,
                chainId: 1,
                enabled: false,
            }),
        );

        const firstCallArgs = useReadContractSpy.mock.calls[0]?.[0];
        expect(firstCallArgs?.query?.enabled).toBe(false);
    });

    it('handles loading state correctly', () => {
        useReadContractSpy
            .mockReturnValueOnce(
                createUseReadContractResult({
                    data: undefined,
                    isLoading: true,
                }),
            )
            .mockReturnValueOnce(
                createUseReadContractResult({ data: undefined }),
            );

        const { result } = renderHook(() =>
            useTokenVotingEscrowTokenId({
                escrowAddress: '0x123' as Hex,
                userAddress: '0xabc' as Hex,
                chainId: 1,
            }),
        );

        expect(result.current.isLoading).toBe(true);
    });
});
