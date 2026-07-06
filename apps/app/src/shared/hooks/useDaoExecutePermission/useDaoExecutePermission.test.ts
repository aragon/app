import { renderHook } from '@testing-library/react';
import { keccak256, toBytes } from 'viem';
import * as wagmi from 'wagmi';
import * as useWalletAccountModule from '@/modules/application/hooks/useWalletAccount';
import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { generateDao } from '@/shared/testUtils';
import { useDaoExecutePermission } from './useDaoExecutePermission';

describe('useDaoExecutePermission hook', () => {
    const useReadContractSpy = jest.spyOn(wagmi, 'useReadContract');
    const useWalletAccountSpy = jest.spyOn(
        useWalletAccountModule,
        'useWalletAccount',
    );

    const walletAddress = '0xabc0000000000000000000000000000000000001';

    beforeEach(() => {
        useWalletAccountSpy.mockReturnValue({
            address: walletAddress,
            chainId: 1,
            isReconnecting: false,
        });
        useReadContractSpy.mockReturnValue({
            data: undefined,
            isLoading: false,
        } as unknown as wagmi.UseReadContractReturnType);
    });

    afterEach(() => {
        useReadContractSpy.mockReset();
        useWalletAccountSpy.mockReset();
    });

    it('returns hasPermission true when the contract returns true', () => {
        useReadContractSpy.mockReturnValue({
            data: true,
            isLoading: false,
        } as unknown as wagmi.UseReadContractReturnType);

        const dao = generateDao();
        const { result } = renderHook(() => useDaoExecutePermission({ dao }));

        expect(result.current.hasPermission).toBeTruthy();
        expect(result.current.isLoading).toBeFalsy();
    });

    it('returns hasPermission false when the contract returns false', () => {
        useReadContractSpy.mockReturnValue({
            data: false,
            isLoading: false,
        } as unknown as wagmi.UseReadContractReturnType);

        const dao = generateDao();
        const { result } = renderHook(() => useDaoExecutePermission({ dao }));

        expect(result.current.hasPermission).toBeFalsy();
    });

    it('forwards the loading state', () => {
        useReadContractSpy.mockReturnValue({
            data: undefined,
            isLoading: true,
        } as unknown as wagmi.UseReadContractReturnType);

        const dao = generateDao();
        const { result } = renderHook(() => useDaoExecutePermission({ dao }));

        expect(result.current.isLoading).toBeTruthy();
        expect(result.current.hasPermission).toBeFalsy();
    });

    it('disables the query when no wallet is connected', () => {
        useWalletAccountSpy.mockReturnValue({
            address: undefined,
            chainId: undefined,
            isReconnecting: false,
        });

        const dao = generateDao();
        renderHook(() => useDaoExecutePermission({ dao }));

        expect(useReadContractSpy).toHaveBeenCalledWith(
            expect.objectContaining({ query: { enabled: false } }),
        );
    });

    it('disables the query when no DAO is provided', () => {
        renderHook(() => useDaoExecutePermission({ dao: undefined }));

        expect(useReadContractSpy).toHaveBeenCalledWith(
            expect.objectContaining({ query: { enabled: false } }),
        );
    });

    it('checks EXECUTE_PERMISSION where the target is the DAO itself on the DAO chain', () => {
        const dao = generateDao({
            address: '0xda0000000000000000000000000000000000beef',
            network: Network.ETHEREUM_MAINNET,
        });
        renderHook(() => useDaoExecutePermission({ dao }));

        expect(useReadContractSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                address: dao.address,
                functionName: 'hasPermission',
                chainId: networkDefinitions[Network.ETHEREUM_MAINNET].id,
                args: [
                    dao.address,
                    walletAddress,
                    keccak256(toBytes('EXECUTE_PERMISSION')),
                    '0x',
                ],
            }),
        );
    });
});
