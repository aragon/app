import { renderHook } from '@testing-library/react';
import * as useTokenModule from '../useToken';
import * as useERC20VotesTokenCheckModule from './useERC20VotesTokenCheck';
import { useGovernanceToken } from './useGovernanceToken';

describe('useGovernanceToken hook', () => {
    const useTokenSpy = jest.spyOn(useTokenModule, 'useToken');
    const useERC20VotesTokenCheckSpy = jest.spyOn(useERC20VotesTokenCheckModule, 'useERC20VotesTokenCheck');

    afterEach(() => {
        useTokenSpy.mockReset();
        useERC20VotesTokenCheckSpy.mockReset();
    });

    it('does not trigger ERC20Votes checks if ERC20 check fails', () => {
        // Mock the useToken hook failure
        useTokenSpy.mockReturnValue({
            isLoading: false,
            isError: true,
            token: null,
        });

        // Mock to return default values when not enabled
        useERC20VotesTokenCheckSpy.mockReturnValue({
            isLoading: false,
            isGovernanceCompatible: false,
            isDelegationCompatible: false,
            isError: false,
        });

        const { result } = renderHook(() => useGovernanceToken({ address: '0x123', chainId: 123 }));

        expect(result.current.token).toBe(null);
        expect(result.current.isError).toBe(true);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isGovernanceCompatible).toBe(false);
        expect(result.current.isDelegationCompatible).toBe(false);

        // useERC20VotesTokenCheck not called with enabled: true query param!
        expect(useERC20VotesTokenCheckSpy).toHaveBeenCalledTimes(1);
        expect(useERC20VotesTokenCheckSpy).toHaveBeenCalledWith({ address: '0x123', chainId: 123 }, { enabled: false });
    });

    it('still returns loading state without token while ERC20Votes checks are in progress', () => {
        // Mock the useToken hook success
        useTokenSpy.mockReturnValue({
            isLoading: false,
            isError: false,
            token: {
                name: 'Test Token',
                symbol: 'TT',
                decimals: 18,
                totalSupply: '1000000',
            },
        });

        // Mock ERC20Votes loading state
        useERC20VotesTokenCheckSpy.mockReturnValue({
            isLoading: true,
            isGovernanceCompatible: false,
            isDelegationCompatible: false,
            isError: false,
        });

        const { result } = renderHook(() => useGovernanceToken({ address: '0x123', chainId: 123 }));

        expect(result.current.token).toBe(null);
        expect(result.current.isLoading).toBe(true);
        expect(result.current.isGovernanceCompatible).toBe(false);
        expect(result.current.isDelegationCompatible).toBe(false);
    });

    it('returns both token and governance check flags in success case', () => {
        // Mock the useToken hook success
        useTokenSpy.mockReturnValue({
            isLoading: false,
            isError: false,
            token: {
                name: 'Test Token',
                symbol: 'TT',
                decimals: 18,
                totalSupply: '1000000',
            },
        });

        // Mock ERC20Votes success
        useERC20VotesTokenCheckSpy.mockReturnValue({
            isLoading: false,
            isGovernanceCompatible: true,
            isDelegationCompatible: true,
            isError: false,
        });

        const { result } = renderHook(() => useGovernanceToken({ address: '0x123', chainId: 123 }));

        expect(result.current.token).toEqual({
            name: 'Test Token',
            symbol: 'TT',
            decimals: 18,
            totalSupply: '1000000',
        });
        expect(result.current.isGovernanceCompatible).toBe(true);
        expect(result.current.isDelegationCompatible).toBe(true);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isError).toBe(false);
    });
});
