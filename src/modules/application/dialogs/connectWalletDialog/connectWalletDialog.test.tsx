import * as useDialogContext from '@/shared/components/dialogProvider';
import { generateDialogContext } from '@/shared/testUtils';
import * as AppKit from '@reown/appkit/react';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as Wagmi from 'wagmi';
import { ConnectWalletDialog, type IConnectWalletDialogProps } from './connectWalletDialog';

describe('<ConnectWalletDialog /> component', () => {
    const useDialogContextSpy = jest.spyOn(useDialogContext, 'useDialogContext');
    const useAppKitSpy = jest.spyOn(AppKit, 'useAppKit');
    const useAppKitStateSpy = jest.spyOn(AppKit, 'useAppKitState');
    const useAccountSpy = jest.spyOn(Wagmi, 'useAccount');

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue(generateDialogContext());
        useAppKitSpy.mockReturnValue({ open: jest.fn(), close: jest.fn() });
        useAppKitStateSpy.mockReturnValue({ open: false, loading: false, initialized: true });
        useAccountSpy.mockReturnValue({} as Wagmi.UseAccountReturnType);
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
        useAppKitSpy.mockReset();
        useAppKitStateSpy.mockReset();
        useAccountSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IConnectWalletDialogProps>) => {
        const completeProps: IConnectWalletDialogProps = {
            location: { id: 'test' },
            ...props,
        };

        return <ConnectWalletDialog {...completeProps} />;
    };

    it('renders some information about Aragon app', () => {
        render(createTestComponent());
        expect(screen.getByRole('img', { name: 'Aragon logo' })).toBeInTheDocument();
        expect(screen.getByText(/connectWalletDialog.connect/)).toBeInTheDocument();
        expect(screen.getByText(/connectWalletDialog.feature.permissions/)).toBeInTheDocument();
        expect(screen.getByText(/connectWalletDialog.feature.stats/)).toBeInTheDocument();

        const auditLink = screen.getByRole('link', { name: /connectWalletDialog.feature.smartContracts/ });
        expect(auditLink.getAttribute('href')).toMatch(/connectWalletDialog.auditLink/);
    });

    it('renders a cancel button to close the dialog', async () => {
        const close = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ close }));
        render(createTestComponent());
        const cancelButton = screen.getByRole('button', { name: /connectWalletDialog.action.cancel/ });
        expect(cancelButton).toBeInTheDocument();

        await userEvent.click(cancelButton);
        expect(close).toHaveBeenCalled();
    });

    it('renders a connect button to trigger the wallet connection', async () => {
        const openWeb3Modal = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext());
        useAppKitSpy.mockReturnValue({ open: openWeb3Modal, close: jest.fn() });
        render(createTestComponent());
        const connectButton = screen.getByRole('button', { name: /connectWalletDialog.action.connect/ });
        expect(connectButton).toBeInTheDocument();

        await userEvent.click(connectButton);
        expect(openWeb3Modal).toHaveBeenCalled();
    });
});
