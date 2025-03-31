import { renderHook } from '@testing-library/react';
import * as wagmi from 'wagmi';
import { useERC20VotesTokenCheck } from './useERC20VotesTokenCheck';

describe('useERC20VotesTokenCheck hook', () => {
    const useReadContractsSpy = jest.spyOn(wagmi, 'useReadContracts');

    afterEach(() => {
        useReadContractsSpy.mockReset();
    });

    it('returns positive isGovernanceCompatible and isDelegationCompatible flags when ERC20Votes checks pass', () => {
        const governanceContractsSuccessResponse = [
            { result: 0, status: 'success' },
            { result: 0, status: 'success' },
            { result: 0, status: 'success' },
        ];
        const delegationContractsSuccessResponse = [
            { result: '0x0000000000000000000000000000000000000000', status: 'success' },
        ];

        useReadContractsSpy
            .mockReturnValueOnce({
                data: governanceContractsSuccessResponse,
                isError: false,
                isLoading: false,
            } as unknown as wagmi.UseReadContractsReturnType)
            .mockReturnValueOnce({
                data: delegationContractsSuccessResponse,
                isError: false,
                isLoading: false,
            } as unknown as wagmi.UseReadContractsReturnType);

        const { result } = renderHook(() => useERC20VotesTokenCheck({ address: '0x123', chainId: 123 }));

        expect(result.current.isGovernanceCompatible).toEqual(true);
        expect(result.current.isDelegationCompatible).toEqual(true);
        expect(result.current.isError).toBe(false);
        expect(result.current.isLoading).toBe(false);
    });

    it('returns negative isGovernanceCompatible flag when governance checks fail', () => {
        const governanceContractsFailureResponse = [
            { result: 0, status: 'success' },
            { result: 0, status: 'failure' },
            { result: 0, status: 'success' },
        ];
        const delegationContractsSuccessResponse = [
            { result: '0x0000000000000000000000000000000000000000', status: 'success' },
        ];

        useReadContractsSpy
            .mockReturnValueOnce({
                data: governanceContractsFailureResponse,
                isError: false,
                isLoading: false,
            } as unknown as wagmi.UseReadContractsReturnType)
            .mockReturnValueOnce({
                data: delegationContractsSuccessResponse,
                isError: false,
                isLoading: false,
            } as unknown as wagmi.UseReadContractsReturnType);

        const { result } = renderHook(() => useERC20VotesTokenCheck({ address: '0x123', chainId: 123 }));

        expect(result.current.isGovernanceCompatible).toBe(false);
        expect(result.current.isDelegationCompatible).toBe(true);
        expect(result.current.isError).toBe(false);
        expect(result.current.isLoading).toBe(false);
    });

    it('returns negative isDelegationCompatible flag when delegation checks fail', () => {
        const governanceContractsSuccessResponse = [
            { result: 0, status: 'success' },
            { result: 0, status: 'success' },
            { result: 0, status: 'success' },
        ];
        const delegationContractsFailureResponse = [{ result: null, status: 'failure' }];

        useReadContractsSpy
            .mockReturnValueOnce({
                data: governanceContractsSuccessResponse,
                isError: false,
                isLoading: false,
            } as unknown as wagmi.UseReadContractsReturnType)
            .mockReturnValueOnce({
                data: delegationContractsFailureResponse,
                isError: false,
                isLoading: false,
            } as unknown as wagmi.UseReadContractsReturnType);

        const { result } = renderHook(() => useERC20VotesTokenCheck({ address: '0x123', chainId: 123 }));

        expect(result.current.isGovernanceCompatible).toEqual(true);
        expect(result.current.isDelegationCompatible).toEqual(false);
        expect(result.current.isError).toBe(false);
        expect(result.current.isLoading).toBe(false);
    });
});
