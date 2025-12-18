import { renderHook } from '@testing-library/react';
import { generateToken } from '@/modules/finance/testUtils';
import * as useToken from '@/shared/hooks/useToken';
import { useGovernanceToken } from './useGovernanceToken';
import * as useGovernanceTokenDelegationCheck from './useGovernanceTokenDelegationCheck';
import * as useGovernanceTokenErc20Check from './useGovernanceTokenErc20Check';
import * as useGovernanceTokenVotesCheck from './useGovernanceTokenVotesCheck';

describe('useGovernanceToken hook', () => {
    const useTokenSpy = jest.spyOn(useToken, 'useToken');
    const useDelegationCheckSpy = jest.spyOn(useGovernanceTokenDelegationCheck, 'useGovernanceTokenDelegationCheck');
    const useErc20CheckSpy = jest.spyOn(useGovernanceTokenErc20Check, 'useGovernanceTokenErc20Check');
    const useVotesCheckSpy = jest.spyOn(useGovernanceTokenVotesCheck, 'useGovernanceTokenVotesCheck');

    beforeEach(() => {
        useTokenSpy.mockReturnValue({ isError: false, isLoading: true, data: null });
        useErc20CheckSpy.mockReturnValue({ isError: false, isLoading: true, data: false });
        useDelegationCheckSpy.mockReturnValue({ isError: false, isLoading: true, data: false });
        useVotesCheckSpy.mockReturnValue({ isError: false, isLoading: true, data: false });
    });

    afterEach(() => {
        useTokenSpy.mockReset();
        useDelegationCheckSpy.mockReset();
        useErc20CheckSpy.mockReset();
        useVotesCheckSpy.mockReset();
    });

    it('does not trigger delegation and votes checks if ERC20 check fails', () => {
        useErc20CheckSpy.mockReturnValue({ isLoading: false, isError: true, data: false });
        const { result } = renderHook(() => useGovernanceToken({ address: '0x123', chainId: 123 }));

        expect(result.current.data.token).toBeNull();
        expect(result.current.data.isDelegationCompatible).toBeFalsy();
        expect(result.current.data.isGovernanceCompatible).toBeFalsy();

        expect(useDelegationCheckSpy).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
        expect(useVotesCheckSpy).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
    });

    it('returns the token and results of the checks', () => {
        const token = generateToken();
        useErc20CheckSpy.mockReturnValue({ isLoading: false, isError: false, data: true });
        useTokenSpy.mockReturnValue({ isLoading: false, isError: false, data: token });
        useDelegationCheckSpy.mockReturnValue({ isLoading: false, isError: false, data: true });
        useVotesCheckSpy.mockReturnValue({ isLoading: false, isError: false, data: true });
        const { result } = renderHook(() => useGovernanceToken({ address: '0x123', chainId: 123 }));

        expect(result.current.data.token).toEqual(token);
        expect(result.current.data.isDelegationCompatible).toBeTruthy();
        expect(result.current.data.isGovernanceCompatible).toBeTruthy();
    });

    it('returns fallback token when ERC20 check succeed but token data fetch does not', () => {
        useTokenSpy.mockReturnValue({ isLoading: false, isError: true, data: null });
        useErc20CheckSpy.mockReturnValue({ isLoading: false, isError: false, data: true });
        const { result } = renderHook(() => useGovernanceToken({ address: '0x123', chainId: 1 }));
        expect(result.current.data.token?.name).toEqual('Unknown');
    });

    it('returns null token when ERC20 check fails', () => {
        useErc20CheckSpy.mockReturnValue({ isLoading: false, isError: true, data: false });
        const { result } = renderHook(() => useGovernanceToken({ address: '0x123', chainId: 1 }));
        expect(result.current.data.token).toBeNull();
    });
});
