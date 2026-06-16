import * as AppKit from '@reown/appkit/react';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as NextNavigation from 'next/navigation';
import * as UseWalletConnected from '@/modules/application/hooks/useWalletConnected';
import { Network } from '@/shared/api/daoService';
import * as useDialogContext from '@/shared/components/dialogProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { generateDialogContext } from '@/shared/testUtils';
import {
    ConnectWalletDialog,
    type IConnectWalletDialogProps,
} from './connectWalletDialog';

describe('<ConnectWalletDialog /> component', () => {
    const useDialogContextSpy = jest.spyOn(
        useDialogContext,
        'useDialogContext',
    );
    const useAppKitSpy = jest.spyOn(AppKit, 'useAppKit');
    const useAppKitStateSpy = jest.spyOn(AppKit, 'useAppKitState');
    const useAppKitNetworkSpy = jest.spyOn(AppKit, 'useAppKitNetwork');
    const useParamsSpy = jest.spyOn(NextNavigation, 'useParams');
    const useWalletConnectedSpy = jest.spyOn(
        UseWalletConnected,
        'useWalletConnected',
    );

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue(generateDialogContext());
        useAppKitSpy.mockReturnValue({ open: jest.fn(), close: jest.fn() });
        useAppKitStateSpy.mockReturnValue({
            open: false,
            loading: false,
            initialized: true,
            connectingWallet: undefined,
        });
        useAppKitNetworkSpy.mockReturnValue({
            switchNetwork: jest.fn(),
            caipNetwork: undefined,
            chainId: undefined,
            caipNetworkId: undefined,
            approvedCaipNetworkIds: undefined,
            supportsAllNetworks: false,
        });
        useParamsSpy.mockReturnValue({});
        useWalletConnectedSpy.mockReturnValue(false);
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
        useAppKitSpy.mockReset();
        useAppKitStateSpy.mockReset();
        useAppKitNetworkSpy.mockReset();
        useParamsSpy.mockReset();
        useWalletConnectedSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IConnectWalletDialogProps>,
    ) => {
        const completeProps: IConnectWalletDialogProps = {
            location: { id: 'test' },
            ...props,
        };

        return <ConnectWalletDialog {...completeProps} />;
    };

    it('renders some information about Aragon app', () => {
        render(createTestComponent());
        expect(
            screen.getByRole('img', { name: 'Aragon logo' }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/connectWalletDialog.connect/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/connectWalletDialog.feature.permissions/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/connectWalletDialog.feature.stats/),
        ).toBeInTheDocument();

        const auditLink = screen.getByRole('link', {
            name: /connectWalletDialog.feature.smartContracts/,
        });
        expect(auditLink.getAttribute('href')).toMatch(
            /connectWalletDialog.auditLink/,
        );
    });

    it('renders a cancel button to close the dialog', async () => {
        const close = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ close }));
        render(createTestComponent());
        const cancelButton = screen.getByRole('button', {
            name: /connectWalletDialog.action.cancel/,
        });
        expect(cancelButton).toBeInTheDocument();

        await userEvent.click(cancelButton);
        expect(close).toHaveBeenCalled();
    });

    it('renders a connect button that opens the AppKit Connect view', async () => {
        const openWeb3Modal = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext());
        useAppKitSpy.mockReturnValue({ open: openWeb3Modal, close: jest.fn() });
        render(createTestComponent());
        const connectButton = screen.getByRole('button', {
            name: /connectWalletDialog.action.connect/,
        });
        expect(connectButton).toBeInTheDocument();

        await userEvent.click(connectButton);
        expect(openWeb3Modal).toHaveBeenCalledWith({ view: 'Connect' });
    });

    it('pins the AppKit active network to the DAO network from the URL before opening the modal', async () => {
        const openWeb3Modal = jest.fn();
        const switchNetwork = jest.fn();
        useAppKitSpy.mockReturnValue({ open: openWeb3Modal, close: jest.fn() });
        useAppKitNetworkSpy.mockReturnValue({
            switchNetwork,
            caipNetwork: undefined,
            chainId: undefined,
            caipNetworkId: undefined,
            approvedCaipNetworkIds: undefined,
            supportsAllNetworks: false,
        });
        useParamsSpy.mockReturnValue({ network: Network.ETHEREUM_MAINNET });
        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', {
                name: /connectWalletDialog.action.connect/,
            }),
        );
        expect(switchNetwork).toHaveBeenCalledWith(
            networkDefinitions[Network.ETHEREUM_MAINNET],
        );
        expect(openWeb3Modal).toHaveBeenCalledWith({ view: 'Connect' });
    });

    it('does not switch network when no DAO network is in the URL', async () => {
        const switchNetwork = jest.fn();
        useAppKitNetworkSpy.mockReturnValue({
            switchNetwork,
            caipNetwork: undefined,
            chainId: undefined,
            caipNetworkId: undefined,
            approvedCaipNetworkIds: undefined,
            supportsAllNetworks: false,
        });
        useParamsSpy.mockReturnValue({});
        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', {
                name: /connectWalletDialog.action.connect/,
            }),
        );
        expect(switchNetwork).not.toHaveBeenCalled();
    });

    it('closes the dialog and calls onSuccess when the wallet connects', () => {
        const close = jest.fn();
        const onSuccess = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ close }));
        useWalletConnectedSpy.mockReturnValue(true);
        render(
            createTestComponent({
                location: { id: 'test', params: { onSuccess } },
            }),
        );
        expect(onSuccess).toHaveBeenCalledTimes(1);
        expect(close).toHaveBeenCalledWith('test');
    });
});
