import * as useDialogContext from '@/shared/components/dialogProvider';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as web3Modal from '@web3modal/wagmi/react';
import * as wagmi from 'wagmi';
import { ConnectWalletDialog, type IConnectWalletDialogProps } from './connectWalletDialog';

jest.mock('@web3modal/wagmi/react', () => ({
    useWeb3Modal: jest.fn(),
    useWeb3ModalState: jest.fn(),
}));

describe('<ConnectWalletDialog /> component', () => {
    const useDialogContextSpy = jest.spyOn(useDialogContext, 'useDialogContext');
    const useWeb3ModalSpy = jest.spyOn(web3Modal, 'useWeb3Modal');
    const useWeb3ModalState = jest.spyOn(web3Modal, 'useWeb3ModalState');
    const useAccountSpy = jest.spyOn(wagmi, 'useAccount');

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue({ open: jest.fn(), close: jest.fn(), updateOptions: jest.fn() });
        useWeb3ModalSpy.mockReturnValue({ open: jest.fn(), close: jest.fn() });
        useWeb3ModalState.mockReturnValue({ open: false, loading: false });
        useAccountSpy.mockReturnValue({} as wagmi.UseAccountReturnType);
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
        useWeb3ModalSpy.mockReset();
        useWeb3ModalState.mockReset();
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
        expect(screen.getByText(/connectWalletDialog.app/)).toBeInTheDocument();
        expect(screen.getByText(/connectWalletDialog.connect/)).toBeInTheDocument();
        expect(screen.getByText(/connectWalletDialog.feature.permissions/)).toBeInTheDocument();
        expect(screen.getByText(/connectWalletDialog.feature.stats/)).toBeInTheDocument();

        const auditLink = screen.getByRole('link', { name: /connectWalletDialog.feature.smartContracts/ });
        expect(auditLink.getAttribute('href')).toMatch(/connectWalletDialog.auditLink/);
    });

    it('renders a cancel button to close the dialog', async () => {
        const close = jest.fn();
        useDialogContextSpy.mockReturnValue({ close, open: jest.fn(), updateOptions: jest.fn() });
        render(createTestComponent());
        const cancelButton = screen.getByRole('button', { name: /connectWalletDialog.action.cancel/ });
        expect(cancelButton).toBeInTheDocument();

        await userEvent.click(cancelButton);
        expect(close).toHaveBeenCalled();
    });

    it('renders a connect button to close current dialog and trigger the wallet connection', async () => {
        const close = jest.fn();
        const openWeb3Modal = jest.fn();
        useDialogContextSpy.mockReturnValue({ close, open: jest.fn(), updateOptions: jest.fn() });
        useWeb3ModalSpy.mockReturnValue({ open: openWeb3Modal, close: jest.fn() });
        render(createTestComponent());
        const connectButton = screen.getByRole('button', { name: /connectWalletDialog.action.connect/ });
        expect(connectButton).toBeInTheDocument();

        await userEvent.click(connectButton);
        expect(openWeb3Modal).toHaveBeenCalled();
    });
});
