import { renderHook } from '@testing-library/react';
import * as wagmi from 'wagmi';
import { useGovernanceTokenVotesCheck } from './useGovernanceTokenVotesCheck';

describe('useGovernanceTokenVotesCheck hook', () => {
    const useReadContractsSpy = jest.spyOn(wagmi, 'useReadContracts');

    afterEach(() => {
        useReadContractsSpy.mockReset();
    });

    it('returns positive result when votes checks pass', () => {
        const governanceContractsSuccessResponse = [
            { result: 0, status: 'success' },
            { result: 0, status: 'success' },
            { result: 0, status: 'success' },
        ];

        useReadContractsSpy.mockReturnValue({
            data: governanceContractsSuccessResponse,
            isError: false,
            isLoading: false,
        } as unknown as wagmi.UseReadContractsReturnType);

        const { result } = renderHook(() => useGovernanceTokenVotesCheck({ address: '0x123', chainId: 123 }));

        expect(result.current.data).toBeTruthy();
        expect(result.current.isError).toBeFalsy();
        expect(result.current.isLoading).toBeFalsy();
    });

    it('returns negative result flag when one of the votes checks fails', () => {
        const governanceContractsFailureResponse = [
            { result: 0, status: 'success' },
            { result: 0, status: 'failure' },
            { result: 0, status: 'success' },
        ];

        useReadContractsSpy.mockReturnValueOnce({
            data: governanceContractsFailureResponse,
            isError: false,
            isLoading: false,
        } as unknown as wagmi.UseReadContractsReturnType);

        const { result } = renderHook(() => useGovernanceTokenVotesCheck({ address: '0x123', chainId: 123 }));

        expect(result.current.data).toBeFalsy();
        expect(result.current.isError).toBe(false);
        expect(result.current.isLoading).toBe(false);
    });
});
