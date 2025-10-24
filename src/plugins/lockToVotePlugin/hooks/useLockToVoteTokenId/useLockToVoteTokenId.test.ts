import { renderHook, waitFor } from '@testing-library/react';
import * as Wagmi from 'wagmi';
import { useLockToVoteTokenId } from './useLockToVoteTokenId';

describe('useLockToVoteTokenId hook', () => {
    const useReadContractSpy = jest.spyOn(Wagmi, 'useReadContract');

    afterEach(() => {
        useReadContractSpy.mockReset();
    });

    it('returns tokenId when user has a lock', async () => {
        const mockTokenId = BigInt(42);
        const mockBalance = BigInt(1);

        useReadContractSpy
            .mockReturnValueOnce({
                data: mockBalance,
                isLoading: false,
                refetch: jest.fn(),
            } as any)
            .mockReturnValueOnce({
                data: mockTokenId,
                isLoading: false,
                refetch: jest.fn(),
            } as any);

        const { result } = renderHook(() =>
            useLockToVoteTokenId({
                escrowAddress: '0x123',
                userAddress: '0xabc',
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
            .mockReturnValueOnce({
                data: mockBalance,
                isLoading: false,
                refetch: jest.fn(),
            } as any)
            .mockReturnValueOnce({
                data: undefined,
                isLoading: false,
                refetch: jest.fn(),
            } as any);

        const { result } = renderHook(() =>
            useLockToVoteTokenId({
                escrowAddress: '0x123',
                userAddress: '0xabc',
                chainId: 1,
            }),
        );

        await waitFor(() => {
            expect(result.current.tokenId).toBeUndefined();
            expect(result.current.isLoading).toBe(false);
        });
    });

    it('respects enabled flag', () => {
        useReadContractSpy.mockReturnValue({
            data: undefined,
            isLoading: false,
            refetch: jest.fn(),
        } as any);

        renderHook(() =>
            useLockToVoteTokenId({
                escrowAddress: '0x123',
                userAddress: '0xabc',
                chainId: 1,
                enabled: false,
            }),
        );

        expect(useReadContractSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                query: expect.objectContaining({ enabled: false }),
            }),
        );
    });

    it('handles loading state correctly', () => {
        useReadContractSpy
            .mockReturnValueOnce({
                data: undefined,
                isLoading: true,
                refetch: jest.fn(),
            } as any)
            .mockReturnValueOnce({
                data: undefined,
                isLoading: false,
                refetch: jest.fn(),
            } as any);

        const { result } = renderHook(() =>
            useLockToVoteTokenId({
                escrowAddress: '0x123',
                userAddress: '0xabc',
                chainId: 1,
            }),
        );

        expect(result.current.isLoading).toBe(true);
    });
});
