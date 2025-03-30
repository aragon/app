import { renderHook } from '@testing-library/react';
import * as wagmi from 'wagmi';
import { useERC20VotingTokenCheck } from './useERC20VotingTokenCheck';

describe('useERC20VotingTokenCheck hook', () => {
    const useReadContractsSpy = jest.spyOn(wagmi, 'useReadContracts');

    const successCaseResponse = [
        { result: 0, status: 'success' },
        { result: 0, status: 'success' },
        { result: 0, status: 'success' },
        { result: '0x0000000000000000000000000000000000000000', status: 'success' },
    ];

    afterEach(() => {
        useReadContractsSpy.mockReset();
    });

    it('returns positive isGovernanceCompatible and isDelegationCompatible flags when ERC20Votes checks pass', () => {
        useReadContractsSpy.mockReturnValue({
            data: successCaseResponse,
            isError: false,
            isLoading: false,
        } as unknown as wagmi.UseReadContractsReturnType);

        const { result } = renderHook(() => useERC20VotingTokenCheck({ address: '0x123', chainId: 123 }));

        expect(result.current.isGovernanceCompatible).toEqual(true);
        expect(result.current.isDelegationCompatible).toEqual(true);
        expect(result.current.isError).toBe(false);
        expect(result.current.isLoading).toBe(false);
    });

    it('returns negative isGovernanceCompatible flag when governance checks fail', () => {
        const governanceFailureResponse = successCaseResponse.map((item, index) =>
            index === 1 ? { ...item, status: 'failure' } : item,
        );
        useReadContractsSpy.mockReturnValue({
            data: governanceFailureResponse,
            isError: true,
            isLoading: false,
        } as unknown as wagmi.UseReadContractsReturnType);

        const { result } = renderHook(() => useERC20VotingTokenCheck({ address: '0x123', chainId: 123 }));

        expect(result.current.isGovernanceCompatible).toBe(false);
        expect(result.current.isDelegationCompatible).toBe(true);
        expect(result.current.isError).toBe(true);
        expect(result.current.isLoading).toBe(false);
    });

    it('returns negative isDelegationCompatible flag when delegation checks fail', () => {
        const delegationFailureResponse = successCaseResponse.map((item, index) =>
            index === 3 ? { ...item, status: 'failure' } : item,
        );
        useReadContractsSpy.mockReturnValue({
            data: delegationFailureResponse,
            isError: true,
            isLoading: false,
        } as unknown as wagmi.UseReadContractsReturnType);

        const { result } = renderHook(() => useERC20VotingTokenCheck({ address: '0x123', chainId: 123 }));

        expect(result.current.isGovernanceCompatible).toEqual(true);
        expect(result.current.isDelegationCompatible).toEqual(false);
        expect(result.current.isError).toBe(true);
        expect(result.current.isLoading).toBe(false);
    });
});
