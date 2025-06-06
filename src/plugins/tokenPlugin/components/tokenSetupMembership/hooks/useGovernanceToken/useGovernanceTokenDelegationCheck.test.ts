import { renderHook } from '@testing-library/react';
import * as wagmi from 'wagmi';
import { useGovernanceTokenDelegationCheck } from './useGovernanceTokenDelegationCheck';

describe('useGovernanceTokenDelegationCheck hook', () => {
    const useReadContractSpy = jest.spyOn(wagmi, 'useReadContract');

    afterEach(() => {
        useReadContractSpy.mockReset();
    });

    it('returns positive result when delegation check pass', () => {
        useReadContractSpy.mockReturnValue({
            data: BigInt(0),
            isError: false,
            isLoading: false,
        } as unknown as wagmi.UseReadContractReturnType);

        const { result } = renderHook(() => useGovernanceTokenDelegationCheck({ address: '0x123', chainId: 123 }));

        expect(result.current.data).toBeTruthy();
        expect(result.current.isError).toBeFalsy();
        expect(result.current.isLoading).toBeFalsy();
    });

    it('returns negative result but no error state when ERC20 check fails', () => {
        useReadContractSpy.mockReturnValueOnce({
            data: null,
            isError: true,
            isLoading: false,
        } as unknown as wagmi.UseReadContractReturnType);

        const { result } = renderHook(() => useGovernanceTokenDelegationCheck({ address: '0x123', chainId: 123 }));

        expect(result.current.data).toBeFalsy();
        expect(result.current.isError).toBeFalsy();
        expect(result.current.isLoading).toBeFalsy();
    });
});
