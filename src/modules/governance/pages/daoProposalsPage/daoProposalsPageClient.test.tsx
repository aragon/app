import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import * as NextNavigation from 'next/navigation';
import { DaoProposalsPageClient, type IDaoProposalsPageClientProps } from './daoProposalsPageClient';

jest.mock('../../components/daoProposalList', () => ({
    DaoProposalList: () => <div data-testid="proposal-list-mock" />,
}));

jest.mock('@/modules/settings/components/daoGovernanceInfo', () => ({
    DaoGovernanceInfo: () => <div data-testid="governance-info-mock" />,
}));

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

describe('<DaoProposalsPageClient /> component', () => {
    const useRouterSpy = jest.spyOn(NextNavigation, 'useRouter');

    beforeEach(() => {
        useRouterSpy.mockReturnValue({ push: jest.fn() } as unknown as AppRouterInstance);
    });

    afterEach(() => {
        useRouterSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IDaoProposalsPageClientProps>) => {
        const completeProps: IDaoProposalsPageClientProps = {
            initialParams: { queryParams: { daoId: 'test-id' } },
            ...props,
        };

        return <DaoProposalsPageClient {...completeProps} />;
    };

    it('renders the page title, proposals list and proposals page details', () => {
        render(createTestComponent());
        expect(screen.getByText(/daoProposalsPage.main.title/)).toBeInTheDocument();
        expect(screen.getByText(/daoProposalsPage.aside.details.title/)).toBeInTheDocument();
        expect(screen.getByTestId('proposal-list-mock')).toBeInTheDocument();
        expect(screen.getByTestId('governance-info-mock')).toBeInTheDocument();
    });

    it('renders the create proposal button with navigation functionality', async () => {
        const mockPush = jest.fn();
        useRouterSpy.mockReturnValue({ push: mockPush } as unknown as AppRouterInstance);
        render(createTestComponent());
        const createProposalButton = screen.getByText(/app.governance.daoProposalsPage.main.action/);
        expect(createProposalButton).toBeInTheDocument();

        await userEvent.click(createProposalButton);
        expect(mockPush).toHaveBeenCalled();
    });
});
