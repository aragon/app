import { renderHook } from '@testing-library/react';
import { ApplicationDialogId } from '@/modules/application/constants/applicationDialogId';
import * as useWalletConnectedModule from '@/modules/application/hooks/useWalletConnected';
import * as dialogProvider from '@/shared/components/dialogProvider';
import { generateDialogContext } from '@/shared/testUtils';
import { WorkspaceDialogId } from '../../constants/workspaceDialogId';
import { useWorkspaceCreateAccountDialog } from './useWorkspaceCreateAccountDialog';

describe('useWorkspaceCreateAccountDialog hook', () => {
    const open = jest.fn();
    const onCreated = jest.fn();
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

    it('asks for a wallet, then opens the dialog with the callback', () => {
        useWalletConnectedSpy.mockReturnValue(false);
        const { result } = renderHook(() => useWorkspaceCreateAccountDialog());

        result.current({ onCreated });

        expect(open).toHaveBeenCalledTimes(1);
        expect(open).toHaveBeenCalledWith(
            ApplicationDialogId.CONNECT_WALLET,
            expect.anything(),
        );

        const [, { params }] = open.mock.calls[0];
        params.onSuccess();

        expect(open).toHaveBeenLastCalledWith(
            WorkspaceDialogId.CREATE_ACCOUNT,
            {
                params: { onCreated },
                stack: undefined,
            },
        );
    });

    it('opens stacked when asked', () => {
        useWalletConnectedSpy.mockReturnValue(true);
        const { result } = renderHook(() => useWorkspaceCreateAccountDialog());

        result.current({ onCreated }, { stack: true });

        expect(open).toHaveBeenCalledWith(WorkspaceDialogId.CREATE_ACCOUNT, {
            params: { onCreated },
            stack: true,
        });
    });
});
