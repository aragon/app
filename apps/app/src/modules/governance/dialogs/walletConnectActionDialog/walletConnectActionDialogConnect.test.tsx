import { Dialog, GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import {
    WalletConnectUnsupportedNetworkError,
    WalletConnectUsedUriError,
} from '../../api/walletConnectService';
import {
    type IWalletConnectActionDialogConnectProps,
    WalletConnectActionDialogConnect,
} from './walletConnectActionDialogConnect';

describe('<WalletConnectActionDialogConnect /> component', () => {
    const createTestComponent = (
        props?: Partial<IWalletConnectActionDialogConnectProps>,
    ) => {
        const completeProps: IWalletConnectActionDialogConnectProps = {
            onFormSubmit: jest.fn(),
            onCancel: jest.fn(),
            status: 'idle',
            network: Network.ETHEREUM_SEPOLIA,
            ...props,
        };

        return (
            <GukModulesProvider>
                <Dialog.Root open={true}>
                    <WalletConnectActionDialogConnect {...completeProps} />
                </Dialog.Root>
            </GukModulesProvider>
        );
    };

    it('explains that the dApp does not support the network of the account', () => {
        const error = new WalletConnectUnsupportedNetworkError();
        render(createTestComponent({ status: 'error', error }));
        expect(
            screen.getByText(
                /app.governance.walletConnectActionDialog.connect.unsupportedNetwork/,
            ),
        ).toBeInTheDocument();
    });

    it('explains that the URI was already used', () => {
        const error = new WalletConnectUsedUriError();
        render(createTestComponent({ status: 'error', error }));
        expect(
            screen.getByText(
                'app.governance.walletConnectActionDialog.connect.usedUri',
            ),
        ).toBeInTheDocument();
    });

    it('renders no error message for unknown errors', () => {
        const error = new Error('unknown');
        render(createTestComponent({ status: 'error', error }));
        expect(
            screen.queryByText(
                /app.governance.walletConnectActionDialog.connect.(unsupportedNetwork|usedUri)/,
            ),
        ).not.toBeInTheDocument();
    });
});
