import { render, screen } from '@testing-library/react';
import {
    type INetworkSwitchAlertProps,
    NetworkSwitchAlert,
} from './networkSwitchAlert';

describe('<NetworkSwitchAlert /> component', () => {
    const createTestComponent = (props?: Partial<INetworkSwitchAlertProps>) => {
        const completeProps: INetworkSwitchAlertProps = {
            isCrossNetworkTransaction: true,
            networkName: 'Ethereum',
            ...props,
        };

        return <NetworkSwitchAlert {...completeProps} />;
    };

    it('renders the alert when the transaction is cross-network and the network name is defined', () => {
        render(createTestComponent());
        expect(
            screen.getByText(/networkSwitchAlert.title/),
        ).toBeInTheDocument();
        expect(screen.getByText(/networkSwitchAlert.body/)).toBeInTheDocument();
    });

    it('renders nothing when the transaction is not cross-network', () => {
        const { container } = render(
            createTestComponent({ isCrossNetworkTransaction: false }),
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing when the network name is undefined', () => {
        const { container } = render(
            createTestComponent({ networkName: undefined }),
        );
        expect(container).toBeEmptyDOMElement();
    });
});
