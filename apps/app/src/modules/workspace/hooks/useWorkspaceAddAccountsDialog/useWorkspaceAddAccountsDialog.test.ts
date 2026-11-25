import { renderHook } from '@testing-library/react';
import { ApplicationDialogId } from '@/modules/application/constants/applicationDialogId';
import * as useWalletConnectedModule from '@/modules/application/hooks/useWalletConnected';
import * as dialogProvider from '@/shared/components/dialogProvider';
import { generateDialogContext } from '@/shared/testUtils';
import { WorkspaceDialogId } from '../../constants/workspaceDialogId';
import { useWorkspaceAddAccountsDialog } from './useWorkspaceAddAccountsDialog';

describe('useWorkspaceAddAccountsDialog hook', () => {
    const open = jest.fn();
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const useWalletConnectedSpy = jest.spyOn(
        useWalletConnectedModule,
        'useWalletConnected',
    );

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue(generateDialogContext({ open }));
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
        useWalletConnectedSpy.mockReset();
        open.mockReset();
    });

    it('opens the add accounts dialog when a wallet is connected', () => {
        useWalletConnectedSpy.mockReturnValue(true);
        const { result } = renderHook(() =>
            useWorkspaceAddAccountsDialog('demo'),
        );

        result.current();

        expect(open).toHaveBeenCalledWith(WorkspaceDialogId.ADD_ACCOUNTS, {
            params: { workspaceId: 'demo' },
        });
    });

    it('asks to connect a wallet first, then opens the dialog', () => {
        useWalletConnectedSpy.mockReturnValue(false);
        const { result } = renderHook(() =>
            useWorkspaceAddAccountsDialog('demo'),
        );

        result.current();

        expect(open).toHaveBeenCalledTimes(1);
        expect(open).toHaveBeenCalledWith(
            ApplicationDialogId.CONNECT_WALLET,
            expect.anything(),
        );

        const [, { params }] = open.mock.calls[0];
        params.onSuccess();

        expect(open).toHaveBeenLastCalledWith(WorkspaceDialogId.ADD_ACCOUNTS, {
            params: { workspaceId: 'demo' },
        });
    });
});
