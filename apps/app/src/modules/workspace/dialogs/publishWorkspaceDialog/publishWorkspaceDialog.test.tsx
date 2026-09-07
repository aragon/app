import { Dialog, GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as useWalletAccountHook from '@/modules/application/hooks/useWalletAccount';
import { Network } from '@/shared/api/daoService';
import * as blockNavigationContext from '@/shared/components/blockNavigationContext';
import * as dialogProvider from '@/shared/components/dialogProvider';
import { generateDialogContext, ReactQueryWrapper } from '@/shared/testUtils';
import { workspaceService } from '../../api/workspaceService';
import type { ICreateWorkspaceFormData } from '../../components/createWorkspaceForm';
import {
    type IPublishWorkspaceDialogProps,
    PublishWorkspaceDialog,
} from './publishWorkspaceDialog';

describe('<PublishWorkspaceDialog /> component', () => {
    const setIsBlockedSpy = jest.fn();
    const closeSpy = jest.fn();

    const useBlockNavigationContextSpy = jest.spyOn(
        blockNavigationContext,
        'useBlockNavigationContext',
    );
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const useWalletAccountSpy = jest.spyOn(
        useWalletAccountHook,
        'useWalletAccount',
    );

    // Re-created on every test so that the spy calls through to the real registry by default.
    let createWorkspaceSpy: jest.SpyInstance<
        ReturnType<typeof workspaceService.createWorkspace>
    >;

    beforeEach(() => {
        createWorkspaceSpy = jest.spyOn(workspaceService, 'createWorkspace');

        useBlockNavigationContextSpy.mockReturnValue({
            isBlocked: true,
            setIsBlocked: setIsBlockedSpy,
        });
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ close: closeSpy }),
        );
        useWalletAccountSpy.mockReturnValue({
            address: '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419',
            chainId: 1,
            isConnecting: false,
            isReconnecting: false,
        });
    });

    afterEach(() => {
        useBlockNavigationContextSpy.mockReset();
        useDialogContextSpy.mockReset();
        useWalletAccountSpy.mockReset();
        createWorkspaceSpy.mockRestore();
        setIsBlockedSpy.mockClear();
        closeSpy.mockClear();
        localStorage.clear();
    });

    const buildValues = (
        values?: Partial<ICreateWorkspaceFormData>,
    ): ICreateWorkspaceFormData => ({
        name: 'Demo Workspace',
        description: 'A demo workspace',
        resources: [],
        targets: [],
        accounts: [
            {
                address: '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5',
                network: Network.ETHEREUM_SEPOLIA,
            },
        ],
        ...values,
    });

    const createTestComponent = (
        props?: Partial<IPublishWorkspaceDialogProps>,
    ) => {
        const completeProps: IPublishWorkspaceDialogProps = {
            location: {
                id: 'PUBLISH_WORKSPACE',
                params: { values: buildValues() },
            },
            ...props,
        };

        return (
            <ReactQueryWrapper>
                <GukModulesProvider>
                    <Dialog.Root open={true}>
                        <PublishWorkspaceDialog {...completeProps} />
                    </Dialog.Root>
                </GukModulesProvider>
            </ReactQueryWrapper>
        );
    };

    const getSubmitButton = () =>
        screen.getByRole('button', {
            name: /publishWorkspaceDialog.button.submit/,
        });

    it('does not unblock the navigation before the workspace is created', () => {
        render(createTestComponent());

        expect(getSubmitButton()).toBeInTheDocument();
        expect(setIsBlockedSpy).not.toHaveBeenCalledWith(false);
    });

    it('unblocks the navigation and displays the success link once the workspace is created', async () => {
        render(createTestComponent());

        await userEvent.click(getSubmitButton());

        const successLink = await screen.findByRole('link', {
            name: /publishWorkspaceDialog.button.success/,
        });

        expect(successLink).toHaveAttribute(
            'href',
            '/workspace/demo-workspace',
        );
        expect(setIsBlockedSpy).toHaveBeenCalledWith(false);
    });

    it('closes the dialog when navigating to the created workspace', async () => {
        render(createTestComponent());

        await userEvent.click(getSubmitButton());
        await userEvent.click(
            await screen.findByRole('link', {
                name: /publishWorkspaceDialog.button.success/,
            }),
        );

        expect(closeSpy).toHaveBeenCalledWith('PUBLISH_WORKSPACE');
    });

    it('keeps the navigation blocked and offers a retry when the creation fails', async () => {
        createWorkspaceSpy.mockRejectedValue(new Error('failed'));
        render(createTestComponent());

        await userEvent.click(getSubmitButton());

        await waitFor(() =>
            expect(
                screen.getByRole('button', {
                    name: /publishWorkspaceDialog.button.retry/,
                }),
            ).toBeInTheDocument(),
        );
        expect(setIsBlockedSpy).not.toHaveBeenCalledWith(false);
    });
});
