import * as useMemberListData from '@/modules/governance/hooks/useMemberListData';
import { generateMember } from '@/modules/governance/testUtils';
import { generateDaoPlugin } from '@/shared/testUtils';
import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { DaoMemberListDefault, type IDaoMemberListDefaultProps } from './daoMemberListDefault';

describe('<DaoMemberListDefault /> component', () => {
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

    const createTestComponent = (props?: Partial<IDaoMemberListDefaultProps>) => {
        const completeProps: IDaoMemberListDefaultProps = {
            initialParams: { queryParams: { daoId: 'dao-id', pluginAddress: '0x123' } },
            plugin: generateDaoPlugin(),
            ...props,
        };

        return (
            <GukModulesProvider>
                <DaoMemberListDefault {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('fetches and renders the multisig member list', () => {
        const members = [generateMember({ address: '0x123' }), generateMember({ address: '0x456', ens: 'member-1' })];
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
        expect(screen.getByText(members[1].ens!)).toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('does not render the data-list pagination when hidePagination is set to true', () => {
        const hidePagination = true;
        useMemberListDataSpy.mockReturnValue({
            memberList: [generateMember()],
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
