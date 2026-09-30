import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type FC, type ReactNode } from 'react';
import type { Address } from 'viem';
import * as walletAccountApi from '@/modules/application/hooks/useWalletAccount';
import { governanceService } from '@/modules/governance/api/governanceService';
import { PluginInterfaceType } from '@/shared/api/daoService';
import { generateDaoPlugin, ReactQueryWrapper } from '@/shared/testUtils';
import { useSafeProcessPermissionCheckProposalCreation } from './useSafeProcessPermissionCheckProposalCreation';

describe('useSafeProcessPermissionCheckProposalCreation', () => {
    const connectedAddress = `0x${'f'.repeat(40)}` as Address;
    const safeAddress = `0x${'5'.repeat(40)}`;

    const useWalletAccountSpy = jest.spyOn(
        walletAccountApi,
        'useWalletAccount',
    );
    const getCanCreateProposalSpy = jest.spyOn(
        governanceService,
        'getCanCreateProposal',
    );

    const connectWallet = (address?: Address) => {
        useWalletAccountSpy.mockReturnValue({
            address,
            chainId: 1,
            isConnecting: false,
            isReconnecting: false,
        });
    };

    beforeEach(() => {
        connectWallet(connectedAddress);
    });

    afterEach(() => {
        useWalletAccountSpy.mockReset();
        getCanCreateProposalSpy.mockReset();
    });

    const createSharedWrapper = (): FC<{ children?: ReactNode }> => {
        const client = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        return ({ children }) =>
            createElement(ReactQueryWrapper, { client, children });
    };

    const renderGuard = (
        daoId: string,
        wrapper: FC<{ children?: ReactNode }>,
    ) =>
        renderHook(
            () =>
                useSafeProcessPermissionCheckProposalCreation({
                    daoId,
                    plugin: generateDaoPlugin({
                        address: safeAddress,
                        interfaceType: PluginInterfaceType.SAFE,
                        isProcess: true,
                        isBody: false,
                    }),
                }),
            { wrapper },
        );

    it('scopes permission to the DAO so the same Safe on two DAOs does not reuse the first answer', async () => {
        const daoIdAllowed = `ethereum-mainnet-0x${'a'.repeat(40)}`;
        const daoIdDenied = `ethereum-mainnet-0x${'b'.repeat(40)}`;
        const allowedDaoAddress = `0x${'a'.repeat(40)}`;

        getCanCreateProposalSpy.mockImplementation(async (params) => ({
            status: params.queryParams.daoAddress === allowedDaoAddress,
        }));

        const wrapper = createSharedWrapper();

        const allowed = renderGuard(daoIdAllowed, wrapper);
        await waitFor(() =>
            expect(allowed.result.current.hasPermission).toBe(true),
        );

        const denied = renderGuard(daoIdDenied, wrapper);
        await waitFor(() =>
            expect(denied.result.current.isLoading).toBe(false),
        );
        expect(denied.result.current.hasPermission).toBe(false);
    });

    it('fails closed while the backend answer is still pending', () => {
        const { promise } = Promise.withResolvers<{ status: boolean }>();
        getCanCreateProposalSpy.mockReturnValue(promise);

        const { result } = renderGuard(
            `ethereum-mainnet-0x${'a'.repeat(40)}`,
            createSharedWrapper(),
        );

        expect(result.current.hasPermission).toBe(false);
        expect(result.current.isLoading).toBe(true);
    });

    it('fails closed when the backend query errors', async () => {
        getCanCreateProposalSpy.mockRejectedValue(new Error('backend down'));

        const { result } = renderGuard(
            `ethereum-mainnet-0x${'a'.repeat(40)}`,
            createSharedWrapper(),
        );

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.hasPermission).toBe(false);
    });

    it('fails closed and never queries the backend when the wallet is disconnected', () => {
        connectWallet(undefined);
        getCanCreateProposalSpy.mockResolvedValue({ status: true });

        const { result } = renderGuard(
            `ethereum-mainnet-0x${'a'.repeat(40)}`,
            createSharedWrapper(),
        );

        expect(result.current.hasPermission).toBe(false);
        expect(result.current.isLoading).toBe(false);
        expect(getCanCreateProposalSpy).not.toHaveBeenCalled();
    });
});
