import * as useMemberListData from '@/modules/governance/hooks/useMemberListData';
import { OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { generateTokenMember } from '../../testUtils';
import type { ITokenMember } from '../../types';
import { TokenMemberList, type ITokenMemberListProps } from './tokenMemberList';

jest.mock('./tokenMemberListItem', () => ({
    TokenMemberListItem: (props: { member: ITokenMember }) => (
        <div data-testid="member-mock">{props.member.address}</div>
    ),
}));

describe('<TokenMemberList /> component', () => {
    const useMemberListDataSpy = jest.spyOn(useMemberListData, 'useMemberListData');

    beforeEach(() => {
        useMemberListDataSpy.mockReturnValue({
            memberList: undefined,
            onLoadMore: jest.fn(),
            state: 'idle',
            pageSize: 10,
            itemsCount: 0,
            emptyState: { heading: '', description: '' },
            errorState: { heading: '', description: '' },
        });
    });

    afterEach(() => {
        useMemberListDataSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ITokenMemberListProps>) => {
        const completeProps: ITokenMemberListProps = {
            initialParams: { queryParams: { daoId: 'dao-id' } },
            ...props,
        };

        return (
            <OdsModulesProvider>
                <TokenMemberList {...completeProps} />
            </OdsModulesProvider>
        );
    };

    it('fetches and renders the token member list', () => {
        const members = [generateTokenMember({ address: '0x123' }), generateTokenMember({ address: '0x456' })];
        useMemberListDataSpy.mockReturnValue({
            memberList: members,
            onLoadMore: jest.fn(),
            state: 'idle',
            pageSize: 10,
            itemsCount: members.length,
            emptyState: { heading: '', description: '' },
            errorState: { heading: '', description: '' },
        });
        render(createTestComponent());
        expect(screen.getAllByTestId('member-mock')).toHaveLength(2);
        expect(screen.getByText(members[0].address)).toBeInTheDocument();
        expect(screen.getByText(members[1].address)).toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('does not render the data-list pagination when hidePagination is set to true', () => {
        const hidePagination = true;
        useMemberListDataSpy.mockReturnValue({
            memberList: [generateTokenMember()],
            onLoadMore: jest.fn(),
            state: 'idle',
            pageSize: 10,
            itemsCount: 0,
            emptyState: { heading: '', description: '' },
            errorState: { heading: '', description: '' },
        });
        render(createTestComponent({ hidePagination }));
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('renders the children property', () => {
        const children = 'test-children';
        render(createTestComponent({ children }));
        expect(screen.getByText(children)).toBeInTheDocument();
    });
});
