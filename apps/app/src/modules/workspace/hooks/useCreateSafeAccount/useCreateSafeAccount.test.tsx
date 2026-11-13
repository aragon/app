import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import * as NextNavigation from 'next/navigation';
import * as useConnectedWalletGuardHook from '@/modules/application/hooks/useConnectedWalletGuard';
import { SafeDialogId } from '@/modules/safe/constants/safeDialogId';
import type { ISafeCreateDialogParams } from '@/modules/safe/dialogs/safeCreateDialog';
import { Network } from '@/shared/api/daoService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import { generateDialogContext, ReactQueryWrapper } from '@/shared/testUtils';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import {
    type IWorkspace,
    WorkspaceAccountType,
    workspaceService,
    workspaceServiceKeys,
} from '../../api/workspaceService';
import { useCreateSafeAccount } from './useCreateSafeAccount';

describe('useCreateSafeAccount hook', () => {
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const useConnectedWalletGuardSpy = jest.spyOn(
        useConnectedWalletGuardHook,
        'useConnectedWalletGuard',
    );

    const useParamsSpy = jest.spyOn(NextNavigation, 'useParams');
    const addWorkspaceAccountSpy = jest.spyOn(
        workspaceService,
        'addWorkspaceAccount',
    );

    const safeAddress = '0x3c66f458e159c671e908E51fABf869556c488a82';
    const queryClient = new QueryClient();
    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    beforeEach(() => {
        useParamsSpy.mockReturnValue({ workspaceId: 'my-workspace' });
        addWorkspaceAccountSpy.mockResolvedValue({} as IWorkspace);
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
        useConnectedWalletGuardSpy.mockReset();
        useParamsSpy.mockReset();
        addWorkspaceAccountSpy.mockReset();
        invalidateQueriesSpy.mockClear();
    });

    const renderCreateSafe = (isConnected = true) => {
        const open = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ open }));
        useConnectedWalletGuardSpy.mockReturnValue({
            check: (params) =>
                isConnected ? params?.onSuccess?.() : undefined,
            result: isConnected,
        });

        const { result } = renderHook(() => useCreateSafeAccount(), {
            wrapper: ({ children }) => (
                <ReactQueryWrapper client={queryClient}>
                    {children}
                </ReactQueryWrapper>
            ),
        });
        result.current.createSafe();

        return { open };
    };

    const getDialogParams = (open: jest.Mock) =>
        (open.mock.calls[0][1] as { params: ISafeCreateDialogParams }).params;

    it('opens the create Safe dialog when the wallet is connected', () => {
        const { open } = renderCreateSafe();

        expect(open).toHaveBeenCalledWith(
            SafeDialogId.CREATE,
            expect.anything(),
        );
    });

    it('does not open the create Safe dialog before the wallet is connected', () => {
        const { open } = renderCreateSafe(false);

        expect(open).not.toHaveBeenCalled();
    });

    it('stores the new Safe in the workspace of the route', async () => {
        const { open } = renderCreateSafe();

        getDialogParams(open).onCreated({
            network: Network.ETHEREUM_SEPOLIA,
            address: safeAddress,
            name: 'Treasury',
        });

        await waitFor(() =>
            expect(addWorkspaceAccountSpy).toHaveBeenCalledWith({
                urlParams: { id: 'my-workspace' },
                body: {
                    account: {
                        id: `${Network.ETHEREUM_SEPOLIA}-${safeAddress}`,
                        type: WorkspaceAccountType.SAFE,
                        address: safeAddress,
                        network: Network.ETHEREUM_SEPOLIA,
                        metadata: { name: 'Treasury' },
                    },
                },
            }),
        );
        await waitFor(() =>
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: workspaceServiceKeys.workspace({
                    urlParams: { id: 'my-workspace' },
                }),
            }),
        );
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: workspaceServiceKeys.workspaceList(),
        });
    });

    it('logs the error when the Safe cannot be stored in the workspace', async () => {
        const error = new Error('storage is full');
        const logErrorSpy = jest
            .spyOn(monitoringUtils, 'logError')
            .mockImplementation(jest.fn());
        addWorkspaceAccountSpy.mockRejectedValue(error);
        const { open } = renderCreateSafe();

        getDialogParams(open).onCreated({
            network: Network.ETHEREUM_SEPOLIA,
            address: safeAddress,
        });

        await waitFor(() =>
            expect(logErrorSpy).toHaveBeenCalledWith(error, {
                context: {
                    workspaceId: 'my-workspace',
                    network: Network.ETHEREUM_SEPOLIA,
                    address: safeAddress,
                },
            }),
        );
        logErrorSpy.mockRestore();
    });
});
