import { renderHook } from '@testing-library/react';
import { keccak256, toBytes } from 'viem';
import * as wagmi from 'wagmi';
import * as useWalletAccountModule from '@/modules/application/hooks/useWalletAccount';
import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import { useWorkspaceAccountsExecutePermission } from './useWorkspaceAccountsExecutePermission';

describe('useWorkspaceAccountsExecutePermission hook', () => {
    const useReadContractsSpy = jest.spyOn(wagmi, 'useReadContracts');
    const useWalletAccountSpy = jest.spyOn(
        useWalletAccountModule,
        'useWalletAccount',
    );

    const walletAddress = '0xabc0000000000000000000000000000000000001';

    const buildAccount = (
        account?: Partial<IWorkspaceAccount>,
    ): IWorkspaceAccount => ({
        id: `${Network.ETHEREUM_MAINNET}-0xda0000000000000000000000000000000000beef`,
        type: WorkspaceAccountType.DAO,
        address: '0xda0000000000000000000000000000000000beef',
        network: Network.ETHEREUM_MAINNET,
        ...account,
    });

    /**
     * A resolved read, as wagmi reports one.
     */
    const successRead = (result: boolean) => ({ status: 'success', result });

    /**
     * A read that could not run, e.g. because the RPC rejected it.
     */
    const failedRead = () => ({
        status: 'failure',
        error: new Error('rpc unavailable'),
    });

    const mockReadContracts = (
        result?: Partial<{ data: unknown; isLoading: boolean }>,
    ) =>
        useReadContractsSpy.mockReturnValue({
            data: undefined,
            isLoading: false,
            ...result,
        } as unknown as wagmi.UseReadContractsReturnType);

    beforeEach(() => {
        useWalletAccountSpy.mockReturnValue({
            address: walletAddress,
            chainId: 1,
            isConnecting: false,
            isReconnecting: false,
        });
        mockReadContracts();
    });

    afterEach(() => {
        useReadContractsSpy.mockReset();
        useWalletAccountSpy.mockReset();
    });

    it('reports the permission of every account keyed by account ID', () => {
        const first = buildAccount({ id: 'first' });
        const second = buildAccount({ id: 'second' });
        mockReadContracts({ data: [successRead(true), successRead(false)] });

        const { result } = renderHook(() =>
            useWorkspaceAccountsExecutePermission([first, second]),
        );

        expect(result.current.permissions).toEqual({
            first: true,
            second: false,
        });
    });

    it('checks EXECUTE_PERMISSION on each account, on the chain of that account', () => {
        const mainnetAccount = buildAccount({ id: 'mainnet' });
        const sepoliaAccount = buildAccount({
            id: 'sepolia',
            address: '0xda0000000000000000000000000000000000cafe',
            network: Network.ETHEREUM_SEPOLIA,
        });

        renderHook(() =>
            useWorkspaceAccountsExecutePermission([
                mainnetAccount,
                sepoliaAccount,
            ]),
        );

        expect(useReadContractsSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                contracts: [
                    expect.objectContaining({
                        address: mainnetAccount.address,
                        functionName: 'hasPermission',
                        chainId:
                            networkDefinitions[Network.ETHEREUM_MAINNET].id,
                        args: [
                            mainnetAccount.address,
                            walletAddress,
                            keccak256(toBytes('EXECUTE_PERMISSION')),
                            '0x',
                        ],
                    }),
                    expect.objectContaining({
                        address: sepoliaAccount.address,
                        chainId:
                            networkDefinitions[Network.ETHEREUM_SEPOLIA].id,
                        args: [
                            sepoliaAccount.address,
                            walletAddress,
                            keccak256(toBytes('EXECUTE_PERMISSION')),
                            '0x',
                        ],
                    }),
                ],
            }),
        );
    });

    // Until the Safe owner and proposer checks land, see the TODO on the hook.
    it('reports a Safe account as not executable without reading any contract for it', () => {
        const daoAccount = buildAccount({ id: 'dao' });
        const safeAccount = buildAccount({
            id: 'safe',
            type: WorkspaceAccountType.SAFE,
            address: '0x5afe000000000000000000000000000000000001',
        });
        mockReadContracts({ data: [successRead(true)] });

        const { result } = renderHook(() =>
            useWorkspaceAccountsExecutePermission([daoAccount, safeAccount]),
        );

        expect(result.current.permissions).toEqual({ dao: true, safe: false });
        expect(useReadContractsSpy).toHaveBeenCalledWith(
            expect.objectContaining({ contracts: [expect.anything()] }),
        );
    });

    it('reports an account whose read has not resolved as not executable', () => {
        const account = buildAccount({ id: 'pending' });

        const { result } = renderHook(() =>
            useWorkspaceAccountsExecutePermission([account]),
        );

        expect(result.current.permissions).toEqual({ pending: false });
    });

    // Fails closed as `useDaoExecutePermission` does: the create action this gates leads to a wizard that re-reads
    // the permission and redirects away on a denial, so an account that cannot be read must not offer the action.
    it('reports an account whose read could not run as not executable', () => {
        const account = buildAccount({ id: 'unreadable' });
        mockReadContracts({ data: [failedRead()] });

        const { result } = renderHook(() =>
            useWorkspaceAccountsExecutePermission([account]),
        );

        expect(result.current.permissions).toEqual({ unreadable: false });
    });

    it('reports both a denied and an unreadable account of one batch as not executable', () => {
        const denied = buildAccount({ id: 'denied' });
        const unreadable = buildAccount({
            id: 'unreadable',
            address: '0xda0000000000000000000000000000000000cafe',
        });
        mockReadContracts({ data: [successRead(false), failedRead()] });

        const { result } = renderHook(() =>
            useWorkspaceAccountsExecutePermission([denied, unreadable]),
        );

        expect(result.current.permissions).toEqual({
            denied: false,
            unreadable: false,
        });
    });

    it('disables the query and reports no pending state when no wallet is connected', () => {
        useWalletAccountSpy.mockReturnValue({
            address: undefined,
            chainId: undefined,
            isConnecting: false,
            isReconnecting: false,
        });
        mockReadContracts({ isLoading: true });

        const { result } = renderHook(() =>
            useWorkspaceAccountsExecutePermission([buildAccount()]),
        );

        expect(useReadContractsSpy).toHaveBeenCalledWith(
            expect.objectContaining({ query: { enabled: false } }),
        );
        expect(result.current.isPending).toBeFalsy();
    });

    it('disables the query when there is no DAO account to check', () => {
        renderHook(() =>
            useWorkspaceAccountsExecutePermission([
                buildAccount({ type: WorkspaceAccountType.SAFE }),
            ]),
        );

        expect(useReadContractsSpy).toHaveBeenCalledWith(
            expect.objectContaining({ query: { enabled: false } }),
        );
    });

    it('forwards the loading state of an enabled read', () => {
        mockReadContracts({ isLoading: true });

        const { result } = renderHook(() =>
            useWorkspaceAccountsExecutePermission([buildAccount()]),
        );

        expect(result.current.isPending).toBeTruthy();
    });

    it('returns no permissions when called without accounts', () => {
        const { result } = renderHook(() =>
            useWorkspaceAccountsExecutePermission(),
        );

        expect(result.current.permissions).toEqual({});
        expect(result.current.isPending).toBeFalsy();
    });
});
