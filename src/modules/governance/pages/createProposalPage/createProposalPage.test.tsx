import { Network } from '@/shared/api/daoService';
import type * as ReactQuery from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { CreateProposalPage, type ICreateProposalPageProps } from './createProposalPage';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual<typeof ReactQuery>('@tanstack/react-query'),
    HydrationBoundary: (props: { children: ReactNode }) => props.children,
}));

jest.mock('./createProposalPageClient', () => ({
    CreateProposalPageClient: () => <div data-testid="page-client-mock" />,
}));

describe('<CreateProposalPage /> component', () => {
    const createTestComponent = async (props?: Partial<ICreateProposalPageProps>) => {
        const completeProps: ICreateProposalPageProps = {
            params: Promise.resolve({
                addressOrEns: '0x987',
                network: Network.ETHEREUM_MAINNET,
                pluginAddress: '0x123',
            }),
            ...props,
        };

        const Component = await CreateProposalPage(completeProps);

        return Component;
    };

    it('renders the client component', async () => {
        render(await createTestComponent());
        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
    });
});
