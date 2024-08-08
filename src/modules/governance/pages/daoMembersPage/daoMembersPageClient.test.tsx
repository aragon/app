import { render, screen } from '@testing-library/react';
import { DaoMembersPageClient, type IDaoMembersPageClientProps } from './daoMembersPageClient';

jest.mock('../../components/daoMemberList', () => ({
    DaoMemberList: () => <div data-testid="member-list-mock" />,
}));

jest.mock('@/modules/settings/components/daoMembersInfo', () => ({
    DaoMembersInfo: () => <div data-testid="members-info-mock" />,
}));

describe('<DaoMembersPageClient /> component', () => {
    const createTestComponent = (props?: Partial<IDaoMembersPageClientProps>) => {
        const completeProps: IDaoMembersPageClientProps = {
            initialParams: { queryParams: { daoId: 'test-id' } },
            ...props,
        };

        return <DaoMembersPageClient {...completeProps} />;
    };

    it('renders the page title, members list and members page details', () => {
        render(createTestComponent());

        expect(screen.getByText(/daoMembersPage.main.title/)).toBeInTheDocument();
        expect(screen.getByText(/daoMembersPage.aside.details.title/)).toBeInTheDocument();
        expect(screen.getByTestId('member-list-mock')).toBeInTheDocument();
        expect(screen.getByTestId('members-info-mock')).toBeInTheDocument();
    });
});
