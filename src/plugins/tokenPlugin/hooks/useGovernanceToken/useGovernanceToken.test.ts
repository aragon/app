import { renderHook } from '@testing-library/react';
import type { Hash } from 'viem';
import * as useTokenModule from '../useToken';
import * as useERC20VotingTokenCheckModule from './useERC20VotingTokenCheck';
import { useGovernanceToken } from './useGovernanceToken';

describe('useGovernanceToken hook', () => {
    const useTokenSpy = jest.spyOn(useTokenModule, 'useToken');
    const useERC20VotingTokenCheckSpy = jest.spyOn(useERC20VotingTokenCheckModule, 'useERC20VotingTokenCheck');

    const tokenAddress: Hash = '0x1234567890abcdef1234567890abcdef123456789';

    afterEach(() => {
        useTokenSpy.mockReset();
        useERC20VotingTokenCheckSpy.mockReset();
    });

    it('does not trigger ERC20Votes checks if ERC20 check fails (and returns token error)', () => {
        // Mock the useToken hook failure
        useTokenSpy.mockReturnValue({
            isLoading: false,
            error: {
                name: 'Error',
                message: 'Test token error',
            },
            token: null,
        });

        // Mock ERC20Votes check to fail
        useERC20VotingTokenCheckSpy.mockReturnValue({
            isLoading: false,
            isGovernanceCompatible: false,
            isDelegationCompatible: false,
            error: null,
        });

        const { result } = renderHook(() => useGovernanceToken({ address: tokenAddress, chainId: 123 }));

        expect(result.current.token).toBe(null);
        expect(result.current.error?.message).toBe('Test token error');
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isGovernanceCompatible).toBe(false);
        expect(result.current.isDelegationCompatible).toBe(false);

        // useERC20VotingTokenCheck not called with enabled: true query param!
        expect(useERC20VotingTokenCheckSpy).toHaveBeenCalledTimes(1);
        expect(useERC20VotingTokenCheckSpy).toHaveBeenCalledWith(
            { address: tokenAddress, chainId: 123 },
            { enabled: false },
        );
    });

    it('still returns loading state without token while ERC20Votes checks are in progress', () => {
        // Mock the useToken hook success
        useTokenSpy.mockReturnValue({
            isLoading: false,
            error: null,
            token: {
                name: 'Test Token',
                symbol: 'TT',
                decimals: 18,
                totalSupply: '1000000',
            },
        });

        // Mock ERC20Votes loading state
        useERC20VotingTokenCheckSpy.mockReturnValue({
            isLoading: true,
            isGovernanceCompatible: false,
            isDelegationCompatible: false,
            error: null,
        });

        const { result } = renderHook(() => useGovernanceToken({ address: tokenAddress, chainId: 123 }));

        expect(result.current.token).toBe(null);
        expect(result.current.isLoading).toBe(true);
        expect(result.current.isGovernanceCompatible).toBe(false);
        expect(result.current.isDelegationCompatible).toBe(false);
    });

    it('returns both token and governance check flags in success case', () => {
        // Mock the useToken hook success
        useTokenSpy.mockReturnValue({
            isLoading: false,
            error: null,
            token: {
                name: 'Test Token',
                symbol: 'TT',
                decimals: 18,
                totalSupply: '1000000',
            },
        });

        // Mock ERC20Votes success
        useERC20VotingTokenCheckSpy.mockReturnValue({
            isLoading: false,
            isGovernanceCompatible: true,
            isDelegationCompatible: true,
            error: null,
        });

        const { result } = renderHook(() => useGovernanceToken({ address: tokenAddress, chainId: 123 }));

        expect(result.current.token).toEqual({
            name: 'Test Token',
            symbol: 'TT',
            decimals: 18,
            totalSupply: '1000000',
        });
        expect(result.current.isGovernanceCompatible).toBe(true);
        expect(result.current.isDelegationCompatible).toBe(true);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe(null);
    });
});
