import { renderHook } from '@testing-library/react';
import type { Hash } from 'viem';
import * as wagmi from 'wagmi';
import { useERC20VotingTokenCheck } from './useERC20VotingTokenCheck';

describe('useToken hook', () => {
    const useReadContractsSpy = jest.spyOn(wagmi, 'useReadContracts');

    const successCaseResponse = [
        { result: 0n, status: 'success' },
        { result: 0n, status: 'success' },
        { result: 0n, status: 'success' },
        { result: '0x0000000000000000000000000000000000000000', status: 'success' },
    ];

    afterEach(() => {
        useReadContractsSpy.mockReset();
    });

    it('returns positive isGovernanceCompatible and isDelegationCompatible flags when ERC20Votes checks pass', () => {
        const address: Hash = '0x1234567890abcdef1234567890abcdef123456789';
        const chainId = 42;

        useReadContractsSpy.mockReturnValue({
            data: successCaseResponse,
            error: null,
            isLoading: false,
        } as unknown as wagmi.UseReadContractsReturnType);

        const { result } = renderHook(() => useERC20VotingTokenCheck({ address, chainId }));

        expect(result.current.isGovernanceCompatible).toEqual(true);
        expect(result.current.isDelegationCompatible).toEqual(true);
        expect(result.current.error).toBeNull();
        expect(result.current.isLoading).toBe(false);
    });

    it('returns negative isGovernanceCompatible flag when governance checks fail', () => {
        const address: Hash = '0x1234567890abcdef1234567890abcdef123456789';
        const chainId = 42;

        const governanceFailureResponse = successCaseResponse.map((item, index) =>
            index === 1 ? { ...item, status: 'failure' } : item,
        );
        useReadContractsSpy.mockReturnValue({
            data: governanceFailureResponse,
            error: 'error',
            isLoading: false,
        } as unknown as wagmi.UseReadContractsReturnType);

        const { result } = renderHook(() => useERC20VotingTokenCheck({ address, chainId }));

        expect(result.current.isGovernanceCompatible).toEqual(false);
        expect(result.current.isDelegationCompatible).toEqual(true);
        expect(result.current.error).toBe('error');
        expect(result.current.isLoading).toBe(false);
    });

    it('returns negative isDelegationCompatible flag when delegation checks fail', () => {
        const address: Hash = '0x1234567890abcdef1234567890abcdef123456789';
        const chainId = 42;

        const delegationFailureResponse = successCaseResponse.map((item, index) =>
            index === 3 ? { ...item, status: 'failure' } : item,
        );
        useReadContractsSpy.mockReturnValue({
            data: delegationFailureResponse,
            error: 'error',
            isLoading: false,
        } as unknown as wagmi.UseReadContractsReturnType);

        const { result } = renderHook(() => useERC20VotingTokenCheck({ address, chainId }));

        expect(result.current.isGovernanceCompatible).toEqual(true);
        expect(result.current.isDelegationCompatible).toEqual(false);
        expect(result.current.error).toBe('error');
        expect(result.current.isLoading).toBe(false);
    });
});
