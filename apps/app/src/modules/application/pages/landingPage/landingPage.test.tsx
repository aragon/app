import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import * as NextNavigation from 'next/navigation';
import * as connectedWalletGuard from '@/modules/application/hooks/useConnectedWalletGuard';
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

    beforeEach(() => {
        useRouterSpy.mockReturnValue({
            push,
            replace,
        } as unknown as AppRouterInstance);
        walletGuardSpy.mockReturnValue({ check, result: false });
    });

    afterEach(() => {
        push.mockReset();
        replace.mockReset();
        check.mockReset();
        useRouterSpy.mockReset();
        walletGuardSpy.mockReset();
    });

    it('links to Explore and the demo workspace', () => {
        render(
            <GukModulesProvider>
                <LandingPage />
            </GukModulesProvider>,
        );

        expect(
            screen.getAllByRole('link', {
                name: /landingPage\.exploreDaos$/,
            })[0],
        ).toHaveAttribute('href', '/explore');
        expect(
            screen.getAllByRole('link', {
                name: /landingPage\.demo\.action$/,
            })[0],
        ).toHaveAttribute('href', '/demo');
    });

    it('opens the existing workspace when the wallet is already connected', async () => {
        walletGuardSpy.mockReturnValue({ check, result: true });

        render(
            <GukModulesProvider>
                <LandingPage />
            </GukModulesProvider>,
        );

        await waitFor(() => expect(replace).toHaveBeenCalledWith('/workspace'));
    });

    it('checks the connected wallet before opening the workspace', async () => {
        walletGuardSpy.mockImplementation((params) => ({
            check: () => params?.onSuccess?.(),
            result: false,
        }));
        render(
            <GukModulesProvider>
                <LandingPage />
            </GukModulesProvider>,
        );

        await userEvent.click(
            screen.getByRole('button', {
                name: /landingPage\.signIn\.walletAction$/,
            }),
        );

        expect(push).toHaveBeenCalledWith('/workspace');
    });
});
