import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import * as Wagmi from 'wagmi';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { networkUtils } from '@/shared/utils/networkUtils';
import {
    type IWorkspaceAccountInfo,
    WorkspaceAccountInfoStatus,
    WorkspaceAccountInfoType,
    workspaceQueryService,
} from '../../api/workspaceQueryService';
import { WorkspaceAccountType } from '../../api/workspaceService';
import { useWorkspaceAccountLookup } from './useWorkspaceAccountLookup';

describe('useWorkspaceAccountLookup hook', () => {
    const address = '0x1F01e6fe406295c9fe42189A2ef999636a04132a';

    const useEnsAddressSpy = jest.spyOn(Wagmi, 'useEnsAddress');
    const getAccountsSpy = jest.spyOn(workspaceQueryService, 'getAccounts');

    const buildInfo = (
        info: Partial<IWorkspaceAccountInfo>,
    ): IWorkspaceAccountInfo => ({
        network: Network.ETHEREUM_MAINNET,
        address,
        type: WorkspaceAccountInfoType.UNKNOWN,
        status: WorkspaceAccountInfoStatus.UNSUPPORTED,
        indexed: false,
        ...info,
    });

    beforeEach(() => {
        useEnsAddressSpy.mockReturnValue({
            data: undefined,
            isLoading: false,
        } as unknown as ReturnType<typeof Wagmi.useEnsAddress>);
        getAccountsSpy.mockResolvedValue([
            buildInfo({
                network: Network.ETHEREUM_SEPOLIA,
                type: WorkspaceAccountInfoType.SAFE,
                status: WorkspaceAccountInfoStatus.AVAILABLE,
            }),
            buildInfo({
                network: Network.BASE_MAINNET,
                type: WorkspaceAccountInfoType.DAO,
                status: WorkspaceAccountInfoStatus.AVAILABLE,
                name: 'Base DAO',
            }),
            buildInfo({ network: Network.ETHEREUM_MAINNET }),
        ]);
    });

    afterEach(() => {
        useEnsAddressSpy.mockReset();
        getAccountsSpy.mockReset();
    });

    const renderLookup = (value?: string) =>
        renderHook(() => useWorkspaceAccountLookup(value), {
            wrapper: ReactQueryWrapper,
        });

    it('looks an address up on every supported network', async () => {
        const { result } = renderLookup(address);

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(getAccountsSpy).toHaveBeenCalledWith({
            body: {
                accounts: networkUtils
                    .getSupportedNetworks()
                    .map((network) => ({ network, address })),
            },
        });
    });

    it('returns one result per network the address is a DAO or a Safe on', async () => {
        const { result } = renderLookup(address);

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.results).toEqual([
            {
                account: {
                    id: `${Network.ETHEREUM_SEPOLIA}-${address}`,
                    type: WorkspaceAccountType.SAFE,
                    address,
                    network: Network.ETHEREUM_SEPOLIA,
                },
                accountInfo: expect.objectContaining({
                    network: Network.ETHEREUM_SEPOLIA,
                }),
            },
            {
                account: {
                    id: `${Network.BASE_MAINNET}-${address}`,
                    type: WorkspaceAccountType.DAO,
                    address,
                    network: Network.BASE_MAINNET,
                },
                accountInfo: expect.objectContaining({ name: 'Base DAO' }),
            },
        ]);
        expect(result.current.isNotFound).toBe(false);
    });

    it('resolves an ENS name on Ethereum before looking it up', async () => {
        useEnsAddressSpy.mockReturnValue({
            data: address,
            isLoading: false,
        } as unknown as ReturnType<typeof Wagmi.useEnsAddress>);
        const { result } = renderLookup('vitalik.eth');

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(useEnsAddressSpy).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'vitalik.eth', chainId: 1 }),
        );
        expect(getAccountsSpy).toHaveBeenCalled();
        expect(result.current.results).toHaveLength(2);
    });

    it('reports an address that is no account anywhere as not found', async () => {
        getAccountsSpy.mockResolvedValue([buildInfo({})]);
        const { result } = renderLookup(address);

        await waitFor(() => expect(result.current.isNotFound).toBe(true));
        expect(result.current.results).toEqual([]);
    });

    it('looks nothing up for a value that is neither an address nor an ENS name', () => {
        const { result } = renderLookup('hello');

        expect(getAccountsSpy).not.toHaveBeenCalled();
        expect(result.current.results).toEqual([]);
        expect(result.current.isNotFound).toBe(false);
    });

    it('reports an ENS name that resolves to no address as not found', () => {
        useEnsAddressSpy.mockReturnValue({
            data: null,
            isLoading: false,
            isSuccess: true,
        } as unknown as ReturnType<typeof Wagmi.useEnsAddress>);
        const { result } = renderLookup('nobody.eth');

        expect(result.current.isNotFound).toBe(true);
        expect(getAccountsSpy).not.toHaveBeenCalled();
    });

    it('normalizes an ENS name before resolving it', () => {
        renderLookup('Vitalik.ETH');

        expect(useEnsAddressSpy).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'vitalik.eth' }),
        );
    });

    it('looks a lowercase address up, and keeps it, checksummed', async () => {
        const { result } = renderLookup(address.toLowerCase());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(getAccountsSpy).toHaveBeenCalledWith({
            body: {
                accounts: networkUtils
                    .getSupportedNetworks()
                    .map((network) => ({ network, address })),
            },
        });
        expect(result.current.results[0].account.address).toEqual(address);
    });

    it('reports a failed account lookup as an error, not as not found', async () => {
        getAccountsSpy.mockRejectedValue(new Error('error'));
        const client = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        const { result } = renderHook(
            () => useWorkspaceAccountLookup(address),
            {
                wrapper: ({ children }) => (
                    <ReactQueryWrapper client={client}>
                        {children}
                    </ReactQueryWrapper>
                ),
            },
        );

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(result.current.isLoading).toBe(false);
        expect(result.current.isNotFound).toBe(false);
    });

    it('reports a failed ENS resolution as an error', () => {
        useEnsAddressSpy.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
        } as unknown as ReturnType<typeof Wagmi.useEnsAddress>);
        const { result } = renderLookup('vitalik.eth');

        expect(result.current.isError).toBe(true);
        expect(result.current.isNotFound).toBe(false);
    });
});
