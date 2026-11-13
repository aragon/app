import { Dialog, GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as useWalletAccountHook from '@/modules/application/hooks/useWalletAccount';
import { Network } from '@/shared/api/daoService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import { generateDialogContext, ReactQueryWrapper } from '@/shared/testUtils';
import { SafeDialogId } from '../../constants/safeDialogId';
import {
    type ISafeCreateDialogParams,
    SafeCreateDialog,
} from './safeCreateDialog';

describe('<SafeCreateDialog /> component', () => {
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const useWalletAccountSpy = jest.spyOn(
        useWalletAccountHook,
        'useWalletAccount',
    );

    const wallet = '0x0000000000000000000000000000000000000011';
    const secondOwner = '0x0000000000000000000000000000000000000012';
    const continueLabel = 'app.safe.safeCreateDialog.action.continue';
    const cancelLabel = 'app.safe.safeCreateDialog.action.cancel';

    beforeEach(() => {
        useWalletAccountSpy.mockReturnValue({
            address: wallet,
            chainId: 11_155_111,
            isConnecting: false,
            isReconnecting: false,
        });
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
        useWalletAccountSpy.mockReset();
    });

    const renderDialog = (params?: Partial<ISafeCreateDialogParams>) => {
        const dialogContext = generateDialogContext();
        useDialogContextSpy.mockReturnValue(dialogContext);
        const dialogParams = { onCreated: jest.fn(), ...params };

        render(
            <ReactQueryWrapper>
                <GukModulesProvider>
                    <Dialog.Root open={true}>
                        <SafeCreateDialog
                            location={{
                                id: SafeDialogId.CREATE,
                                params: dialogParams,
                            }}
                        />
                    </Dialog.Root>
                </GukModulesProvider>
            </ReactQueryWrapper>,
        );

        return { ...dialogContext, ...dialogParams };
    };

    it('opens the deploy dialog with the wallet as the only owner and one approval', async () => {
        const { open, onCreated } = renderDialog();

        await userEvent.click(
            screen.getByRole('button', { name: continueLabel }),
        );

        await waitFor(() =>
            expect(open).toHaveBeenCalledWith(SafeDialogId.DEPLOY_TRANSACTION, {
                stack: true,
                onClose: expect.any(Function) as unknown,
                params: {
                    network: Network.ETHEREUM_SEPOLIA,
                    name: undefined,
                    owners: [wallet],
                    threshold: 1,
                    onCreated,
                },
            }),
        );
    });

    it('passes the name of the Safe when one is typed', async () => {
        const { open } = renderDialog();

        await userEvent.type(
            screen.getByLabelText(/app.safe.safeCreateDialog.name.label/),
            'Treasury',
        );
        await userEvent.click(
            screen.getByRole('button', { name: continueLabel }),
        );

        await waitFor(() =>
            expect(open).toHaveBeenCalledWith(
                SafeDialogId.DEPLOY_TRANSACTION,
                expect.objectContaining({
                    params: expect.objectContaining({
                        name: 'Treasury',
                    }) as unknown,
                }),
            ),
        );
    });

    it('passes no name when only spaces are typed', async () => {
        const { open } = renderDialog();

        await userEvent.type(
            screen.getByLabelText(/app.safe.safeCreateDialog.name.label/),
            '   ',
        );
        await userEvent.click(
            screen.getByRole('button', { name: continueLabel }),
        );

        await waitFor(() =>
            expect(open).toHaveBeenCalledWith(
                SafeDialogId.DEPLOY_TRANSACTION,
                expect.objectContaining({
                    params: expect.objectContaining({
                        name: undefined,
                    }) as unknown,
                }),
            ),
        );
    });

    it('keeps the deploy dialog open on Escape so a deployed Safe is not lost', async () => {
        const { open, close } = renderDialog();

        await userEvent.click(
            screen.getByRole('button', { name: continueLabel }),
        );
        await waitFor(() => expect(open).toHaveBeenCalled());
        const { onClose } = (open as jest.Mock).mock.calls[0][1] as {
            onClose: () => void;
        };
        onClose();

        expect(close).not.toHaveBeenCalled();
    });

    const addOwner = async (address: string) => {
        await userEvent.click(
            screen.getByRole('button', {
                name: /addressesInput.container.add/,
            }),
        );
        const inputs = screen.getAllByPlaceholderText(
            /addressesInput.item.input.placeholder/,
        );
        await userEvent.type(inputs.at(-1)!, address);
    };

    it('does not continue when an owner is removed below the approvals', async () => {
        const { open } = renderDialog();
        await addOwner(secondOwner);

        const approvals = screen.getByRole('textbox', {
            name: /app.safe.safeCreateDialog.threshold.label/,
        });
        await userEvent.clear(approvals);
        await userEvent.type(approvals, '2');
        const removeButtons = screen.getAllByRole('button', {
            name: /addressesInput.item.remove/,
        });
        await userEvent.click(removeButtons.at(-1)!);
        await userEvent.click(
            screen.getByRole('button', { name: continueLabel }),
        );

        expect(open).not.toHaveBeenCalled();
    });

    it('does not continue when the same owner is listed twice', async () => {
        const { open } = renderDialog();
        await addOwner(wallet);

        await userEvent.click(
            screen.getByRole('button', { name: continueLabel }),
        );

        expect(open).not.toHaveBeenCalled();
    });

    it('does not continue when an owner is not a valid address', async () => {
        const { open } = renderDialog();
        await addOwner('0x123');

        await userEvent.click(
            screen.getByRole('button', { name: continueLabel }),
        );

        expect(open).not.toHaveBeenCalled();
    });

    it('closes only itself on cancel', async () => {
        const { close } = renderDialog();

        await userEvent.click(
            screen.getByRole('button', { name: cancelLabel }),
        );

        expect(close).toHaveBeenCalledWith(SafeDialogId.CREATE);
    });
});
