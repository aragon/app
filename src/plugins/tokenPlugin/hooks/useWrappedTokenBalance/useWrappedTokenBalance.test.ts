import { renderHook } from '@testing-library/react';
import * as wagmi from 'wagmi';
import { Network } from '@/shared/api/daoService';
import { generateTokenPluginSettingsToken } from '../../testUtils';
import { useWrappedTokenBalance } from './useWrappedTokenBalance';

describe('useWrappedTokenBalance hook', () => {
    const useReadContractSpy = jest.spyOn(wagmi, 'useReadContract');

    afterEach(() => {
        useReadContractSpy.mockReset();
    });

    it('returns wrapped token balance from blockchain', () => {
        const mockBalance = BigInt('1000000000000000000'); // 1 token with 18 decimals
        const mockRefetch = jest.fn();
        useReadContractSpy.mockReturnValue({
            data: mockBalance,
            refetch: mockRefetch,
            isError: false,
            isLoading: false,
        } as unknown as wagmi.UseReadContractReturnType);

        const token = generateTokenPluginSettingsToken({ network: Network.ETHEREUM_MAINNET });
        const { result } = renderHook(() =>
            useWrappedTokenBalance({
                userAddress: '0x1234567890123456789012345678901234567890',
                token,
            })
        );

        expect(result.current.balance).toBe(mockBalance);
        expect(result.current.refetch).toBe(mockRefetch);
    });

    it('returns BigInt(0) when balance is undefined', () => {
        const mockRefetch = jest.fn();
        useReadContractSpy.mockReturnValue({
            data: undefined,
            refetch: mockRefetch,
            isError: false,
            isLoading: false,
        } as unknown as wagmi.UseReadContractReturnType);

        const token = generateTokenPluginSettingsToken({ network: Network.ETHEREUM_MAINNET });
        const { result } = renderHook(() =>
            useWrappedTokenBalance({
                userAddress: '0x1234567890123456789012345678901234567890',
                token,
            })
        );

        expect(result.current.balance).toBe(BigInt(0));
    });

    it('disables query when userAddress is undefined', () => {
        const mockRefetch = jest.fn();
        useReadContractSpy.mockReturnValue({
            data: undefined,
            refetch: mockRefetch,
            isError: false,
            isLoading: false,
        } as unknown as wagmi.UseReadContractReturnType);

        const token = generateTokenPluginSettingsToken({ network: Network.ETHEREUM_MAINNET });
        renderHook(() =>
            useWrappedTokenBalance({
                userAddress: undefined,
                token,
            })
        );

        expect(useReadContractSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                query: { enabled: false },
            })
        );
    });

    it('uses correct token address and chain ID', () => {
        const mockRefetch = jest.fn();
        useReadContractSpy.mockReturnValue({
            data: BigInt(0),
            refetch: mockRefetch,
            isError: false,
            isLoading: false,
        } as unknown as wagmi.UseReadContractReturnType);

        const token = generateTokenPluginSettingsToken({
            address: '0xTokenAddress',
            network: Network.ETHEREUM_MAINNET,
        });

        renderHook(() =>
            useWrappedTokenBalance({
                userAddress: '0xUserAddress',
                token,
            })
        );

        expect(useReadContractSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                address: '0xTokenAddress',
                functionName: 'balanceOf',
                args: ['0xUserAddress'],
                chainId: 1, // Ethereum Mainnet
            })
        );
    });

    it('uses Sepolia chain ID for Sepolia network', () => {
        const mockRefetch = jest.fn();
        useReadContractSpy.mockReturnValue({
            data: BigInt(0),
            refetch: mockRefetch,
            isError: false,
            isLoading: false,
        } as unknown as wagmi.UseReadContractReturnType);

        const token = generateTokenPluginSettingsToken({
            network: Network.ETHEREUM_SEPOLIA,
        });

        renderHook(() =>
            useWrappedTokenBalance({
                userAddress: '0xUserAddress',
                token,
            })
        );

        expect(useReadContractSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                chainId: 11_155_111, // Sepolia
            })
        );
    });

    it('calls balanceOf with correct ABI', () => {
        const mockRefetch = jest.fn();
        useReadContractSpy.mockReturnValue({
            data: BigInt(0),
            refetch: mockRefetch,
            isError: false,
            isLoading: false,
        } as unknown as wagmi.UseReadContractReturnType);

        const token = generateTokenPluginSettingsToken();

        renderHook(() =>
            useWrappedTokenBalance({
                userAddress: '0xUserAddress',
                token,
            })
        );

        const callArgs = useReadContractSpy.mock.calls[0][0];
        expect(callArgs?.functionName).toBe('balanceOf');
        expect(callArgs?.abi).toBeDefined();
    });
});
