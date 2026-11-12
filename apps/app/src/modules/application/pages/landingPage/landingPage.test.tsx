import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import * as NextNavigation from 'next/navigation';
import * as connectedWalletGuard from '@/modules/application/hooks/useConnectedWalletGuard';
import * as walletAccountHook from '@/modules/application/hooks/useWalletAccount';
import {
    workspaceService,
    workspaceServiceKeys,
} from '@/modules/workspace/api/workspaceService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { LandingPage } from './landingPage';

describe('<LandingPage /> component', () => {
    const push = jest.fn();
    const replace = jest.fn();
    const check = jest.fn();
    const useRouterSpy = jest.spyOn(NextNavigation, 'useRouter');
    const walletGuardSpy = jest.spyOn(
        connectedWalletGuard,
        'useConnectedWalletGuard',
    );
    const walletAccountSpy = jest.spyOn(walletAccountHook, 'useWalletAccount');
    const activateSessionRegistrySpy = jest.spyOn(
        workspaceService,
        'activateSessionWorkspaceRegistry',
    );

    beforeEach(() => {
        useRouterSpy.mockReturnValue({
            push,
            replace,
        } as unknown as AppRouterInstance);
        walletGuardSpy.mockReturnValue({ check, result: false });
        walletAccountSpy.mockReturnValue({
            address: undefined,
            chainId: undefined,
            isConnecting: false,
            isReconnecting: false,
        });
        activateSessionRegistrySpy.mockResolvedValue();
    });

    afterEach(() => {
        push.mockReset();
        replace.mockReset();
        check.mockReset();
        useRouterSpy.mockReset();
        walletGuardSpy.mockReset();
        walletAccountSpy.mockReset();
        activateSessionRegistrySpy.mockReset();
    });
    const createTestComponent = (client = new QueryClient()) => (
        <ReactQueryWrapper client={client}>
            <GukModulesProvider queryClient={client}>
                <LandingPage />
            </GukModulesProvider>
        </ReactQueryWrapper>
    );

    it('resets the session fixture before opening the demo workspace', async () => {
        const queryClient = new QueryClient();
        queryClient.setQueryData(workspaceServiceKeys.workspaceList(), [
            { id: 'persistent' },
        ]);
        render(createTestComponent(queryClient));

        const demoLink = screen.getAllByRole('link', {
            name: /landingPage\.demo\.action$/,
        })[0];
        expect(demoLink).toHaveAttribute(
            'href',
            '/workspace/aragon-demo/all/overview',
        );
        await userEvent.click(demoLink);

        await waitFor(() => {
            expect(activateSessionRegistrySpy).toHaveBeenCalledTimes(1);
            expect(
                queryClient.getQueryData(workspaceServiceKeys.workspaceList()),
            ).toBeUndefined();
            expect(push).toHaveBeenCalledWith(
                '/workspace/aragon-demo/all/overview',
            );
        });
    });

    it('keeps coming-soon sign-in options disabled without a not-allowed cursor', () => {
        render(createTestComponent());

        for (const name of [
            /landingPage\.signIn\.email$/,
            /landingPage\.signIn\.google$/,
            /landingPage\.signIn\.passkey$/,
        ]) {
            const button = screen.getByRole('button', { name });

            expect(button).toBeDisabled();
            expect(button).not.toHaveClass('cursor-not-allowed');
        }
    });

    it('opens the existing workspace when the wallet is already connected', async () => {
        walletGuardSpy.mockReturnValue({ check, result: true });

        render(createTestComponent());

        await waitFor(() => expect(replace).toHaveBeenCalledWith('/workspace'));
    });

    it('shows workspace progress while restoring a connected wallet', () => {
        walletAccountSpy.mockReturnValue({
            address: '0x123',
            chainId: 1,
            isConnecting: false,
            isReconnecting: true,
        });

        render(createTestComponent());

        expect(screen.getByRole('status')).toHaveTextContent(
            /landingPage\.openingWorkspace$/,
        );
        expect(
            screen.queryByRole('button', {
                name: /landingPage\.signIn\.walletAction$/,
            }),
        ).not.toBeInTheDocument();
    });

    it('checks the connected wallet before opening the workspace', async () => {
        walletGuardSpy.mockImplementation((params) => ({
            check: () => params?.onSuccess?.(),
            result: false,
        }));
        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', {
                name: /landingPage\.signIn\.walletAction$/,
            }),
        );

        expect(push).toHaveBeenCalledWith('/workspace');
    });
});
