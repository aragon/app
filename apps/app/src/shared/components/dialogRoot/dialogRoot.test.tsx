import { invariant } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useState } from 'react';
import * as useWalletAccountHook from '@/modules/application/hooks/useWalletAccount';
import { generateDialogContext } from '@/shared/testUtils';
import { testLogger } from '@/test/utils';
import * as useDialogContext from '../dialogProvider';
import { DialogRoot, type IDialogRootProps } from './dialogRoot';

describe('<DialogRoot /> component', () => {
    const useDialogContextSpy = jest.spyOn(
        useDialogContext,
        'useDialogContext',
    );

    const useWalletAccountSpy = jest.spyOn(
        useWalletAccountHook,
        'useWalletAccount',
    );

    const connectedAccount = {
        address: '0x1234567890123456789012345678901234567890',
        chainId: 1,
        isConnecting: false,
        isReconnecting: false,
    } as const;

    const disconnectedAccount = {
        address: undefined,
        chainId: 1,
        isConnecting: false,
        isReconnecting: false,
    } as const;

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue(generateDialogContext());
        useWalletAccountSpy.mockReturnValue({ ...connectedAccount });
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
        useWalletAccountSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IDialogRootProps>) => {
        const completeProps: IDialogRootProps = {
            dialogs: {},
            ...props,
        };

        return <DialogRoot {...completeProps} />;
    };

    it('renders empty container when no dialog is active', () => {
        const locations = undefined;
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ locations }),
        );
        const { container } = render(createTestComponent());
        expect(container).toBeEmptyDOMElement();
    });

    it('renders the component linked to the current active dialog', () => {
        const dialogId = 'connect-wallet';
        const dialogContent = 'connect-wallet-content';
        const dialogs = { [dialogId]: { Component: () => dialogContent } };
        const locations = [{ id: dialogId }];
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ locations }),
        );
        render(createTestComponent({ dialogs }));
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(dialogContent)).toBeInTheDocument();
    });

    it('renders the specified dialog title and description as hidden', () => {
        const dialogId = 'connect-wallet';
        const hiddenTitle = 'test-title';
        const hiddenDescription = 'test-description';
        const dialogs = {
            [dialogId]: {
                Component: () => 'test',
                hiddenTitle,
                hiddenDescription,
            },
        };
        const locations = [{ id: dialogId }];
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ locations }),
        );
        render(createTestComponent({ dialogs }));
        expect(screen.getByText(hiddenTitle)).toBeInTheDocument();
        expect(screen.getByText(hiddenDescription)).toBeInTheDocument();
    });

    it('calls the close function set on the dialog-provider on dialog close', async () => {
        const dialogId = 'test';
        const dialogs = { [dialogId]: { Component: () => null } };
        const locations = [{ id: dialogId }];
        const close = jest.fn();
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ locations, close }),
        );
        render(createTestComponent({ dialogs }));
        await userEvent.keyboard('{Escape}');
        expect(close).toHaveBeenCalled();
    });

    it('renders an alert dialog when active dialog has the variant property set', () => {
        testLogger.suppressErrors(); // Suppress missing title & description errors
        const dialogId = 'test';
        const variant = 'critical' as const;
        const dialogs = { [dialogId]: { Component: () => 'test', variant } };
        const locations = [{ id: dialogId }];
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ locations }),
        );
        render(createTestComponent({ dialogs }));
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('renders a wallet-requiring dialog while the wallet is connected', () => {
        const dialogId = 'vote';
        const dialogContent = 'vote-content';
        const dialogs = {
            [dialogId]: {
                Component: () => dialogContent,
                requiresWallet: true,
            },
        };
        const locations = [{ id: dialogId }];
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ locations }),
        );
        render(createTestComponent({ dialogs }));
        expect(screen.getByText(dialogContent)).toBeInTheDocument();
    });

    it('unmounts and closes a wallet-requiring dialog when the wallet disconnects', () => {
        const dialogId = 'vote';
        const dialogContent = 'vote-content';
        const dialogs = {
            [dialogId]: {
                Component: () => dialogContent,
                requiresWallet: true,
            },
        };
        const locations = [{ id: dialogId }];
        const close = jest.fn();
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ locations, close }),
        );
        useWalletAccountSpy.mockReturnValue({ ...disconnectedAccount });
        render(createTestComponent({ dialogs }));
        expect(screen.queryByText(dialogContent)).not.toBeInTheDocument();
        expect(close).toHaveBeenCalledWith(dialogId);
    });

    it('keeps dialogs without the requires-wallet flag open when the wallet disconnects', () => {
        const dialogId = 'connect-wallet';
        const dialogContent = 'connect-wallet-content';
        const dialogs = { [dialogId]: { Component: () => dialogContent } };
        const locations = [{ id: dialogId }];
        const close = jest.fn();
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ locations, close }),
        );
        useWalletAccountSpy.mockReturnValue({ ...disconnectedAccount });
        render(createTestComponent({ dialogs }));
        expect(screen.getByText(dialogContent)).toBeInTheDocument();
        expect(close).not.toHaveBeenCalled();
    });

    it('unmounts but does not close a wallet-requiring dialog while reconnecting', () => {
        const dialogId = 'vote';
        const dialogContent = 'vote-content';
        const dialogs = {
            [dialogId]: {
                Component: () => dialogContent,
                requiresWallet: true,
            },
        };
        const locations = [{ id: dialogId }];
        const close = jest.fn();
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ locations, close }),
        );
        useWalletAccountSpy.mockReturnValue({
            ...disconnectedAccount,
            isReconnecting: true,
        });
        render(createTestComponent({ dialogs }));
        expect(screen.queryByText(dialogContent)).not.toBeInTheDocument();
        expect(close).not.toHaveBeenCalled();
    });

    it('unmounts but does not close a wallet-requiring dialog while connecting on a connector switch', () => {
        const dialogId = 'vote';
        const dialogContent = 'vote-content';
        const dialogs = {
            [dialogId]: {
                Component: () => dialogContent,
                requiresWallet: true,
            },
        };
        const locations = [{ id: dialogId }];
        const close = jest.fn();
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ locations, close }),
        );
        useWalletAccountSpy.mockReturnValue({
            ...disconnectedAccount,
            isConnecting: true,
        });
        render(createTestComponent({ dialogs }));
        expect(screen.queryByText(dialogContent)).not.toBeInTheDocument();
        expect(close).not.toHaveBeenCalled();
    });

    it('restores a wallet-requiring dialog once the connector switch completes', () => {
        const dialogId = 'vote';
        const dialogContent = 'vote-content';
        const dialogs = {
            [dialogId]: {
                Component: () => dialogContent,
                requiresWallet: true,
            },
        };
        const locations = [{ id: dialogId }];
        const close = jest.fn();
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ locations, close }),
        );

        useWalletAccountSpy.mockReturnValue({
            ...disconnectedAccount,
            isConnecting: true,
        });
        const { rerender } = render(createTestComponent({ dialogs }));
        expect(screen.queryByText(dialogContent)).not.toBeInTheDocument();

        useWalletAccountSpy.mockReturnValue({ ...connectedAccount });
        rerender(createTestComponent({ dialogs }));

        expect(screen.getByText(dialogContent)).toBeInTheDocument();
        expect(close).not.toHaveBeenCalled();
    });

    it('does not throw when the wallet disconnects while a wallet-requiring dialog is open', () => {
        const dialogId = 'vote';
        const dialogContent = 'vote-content';

        // Mirrors the real wallet-requiring dialogs: address assertion followed by more hooks.
        const VoteDialog: React.FC = () => {
            const { address } = useWalletAccountHook.useWalletAccount();
            invariant(address != null, 'VoteDialog: user must be connected.');
            const [state] = useState(dialogContent);

            return state;
        };

        const dialogs = {
            [dialogId]: { Component: VoteDialog, requiresWallet: true },
        };
        const locations = [{ id: dialogId }];
        const close = jest.fn();
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ locations, close }),
        );

        const { rerender } = render(createTestComponent({ dialogs }));
        expect(screen.getByText(dialogContent)).toBeInTheDocument();

        useWalletAccountSpy.mockReturnValue({ ...disconnectedAccount });

        expect(() => rerender(createTestComponent({ dialogs }))).not.toThrow();
        expect(screen.queryByText(dialogContent)).not.toBeInTheDocument();
        expect(close).toHaveBeenCalledWith(dialogId);
    });
});
