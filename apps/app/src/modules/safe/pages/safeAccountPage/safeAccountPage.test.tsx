import type * as ReactQuery from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Network } from '@/shared/api/daoService';
import { type ISafeAccountPageProps, SafeAccountPage } from './safeAccountPage';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual<typeof ReactQuery>('@tanstack/react-query'),
    HydrationBoundary: (props: { children: ReactNode }) => props.children,
}));

jest.mock('./safeAccountPageClient', () => ({
    SafeAccountPageClient: (props: { address: string; network: string }) => (
        <div
            data-address={props.address}
            data-network={props.network}
            data-testid="page-client-mock"
        />
    ),
}));

describe('<SafeAccountPage /> component', () => {
    const createTestComponent = (props?: Partial<ISafeAccountPageProps>) => {
        const completeProps: ISafeAccountPageProps = {
            network: Network.ETHEREUM_MAINNET,
            address: '0x1c8Cae0e29e1a0dc65f0f0E4C74DCE9f9C9F4a2B',
            ...props,
        };

        return <SafeAccountPage {...completeProps} />;
    };

    it('renders the page client component for the given Safe', () => {
        render(createTestComponent());
        const client = screen.getByTestId('page-client-mock');

        expect(client).toBeInTheDocument();
        expect(client.dataset.address).toEqual(
            '0x1c8Cae0e29e1a0dc65f0f0E4C74DCE9f9C9F4a2B',
        );
        expect(client.dataset.network).toEqual(Network.ETHEREUM_MAINNET);
    });
});
