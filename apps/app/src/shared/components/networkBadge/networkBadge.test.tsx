import { render, screen } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { type INetworkBadgeProps, NetworkBadge } from './networkBadge';

describe('<NetworkBadge /> component', () => {
    const createTestComponent = (props?: Partial<INetworkBadgeProps>) => {
        const completeProps: INetworkBadgeProps = {
            network: Network.ETHEREUM_SEPOLIA,
            ...props,
        };

        return <NetworkBadge {...completeProps} />;
    };

    it('renders the logo of the network, named and titled by the network name', () => {
        render(createTestComponent({ network: Network.BASE_MAINNET }));

        const { name, logo } = networkDefinitions[Network.BASE_MAINNET];
        const badge = screen.getByRole('img', { name });
        expect(badge).toHaveAttribute('src', logo);
        expect(badge).toHaveAttribute('title', name);
    });
});
