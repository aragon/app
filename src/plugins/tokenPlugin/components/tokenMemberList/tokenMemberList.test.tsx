import * as useMemberListData from '@/modules/governance/hooks/useMemberListData';
import { OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { generateTokenMember } from '../../testUtils/generators/tokenMember';
import { TokenMemberList, type ITokenMemberListProps } from './tokenMemberList';

describe('<TokenMemberList /> component', () => {
    const useMemberListDataSpy = jest.spyOn(useMemberListData, 'useMemberListData');

    beforeEach(() => {
        useMemberListDataSpy.mockReturnValue({
            memberList: [],
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

    it.only('fetches and renders the token member list', () => {
        const members = [
            generateTokenMember({ address: '0x123', votingPower: '472797978938797846531' }),
            generateTokenMember({ address: '0x456', ens: 'member-1', votingPower: '0' }),
        ];
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
        expect(screen.getByText(members[0].address)).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 2, name: /472.8 Voting Power/ })).toBeInTheDocument();
        expect(screen.getByText(members[1].ens!)).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 2, name: /0 Voting Power/ })).toBeInTheDocument();
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
    });

    it('renders the children property', () => {
        const children = 'test-children';
        render(createTestComponent({ children }));
        expect(screen.getByText(children)).toBeInTheDocument();
    });
});
