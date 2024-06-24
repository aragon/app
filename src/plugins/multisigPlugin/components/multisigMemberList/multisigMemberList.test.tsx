import * as useMemberListData from '@/modules/governance/hooks/useMemberListData';
import { generateMember } from '@/modules/governance/testUtils';
import { OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { MultisigMemberList, type IMultisigMemberListProps } from './multisigMemberList';

describe('<MultisigMemberList /> component', () => {
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

    const createTestComponent = (props?: Partial<IMultisigMemberListProps>) => {
        const completeProps: IMultisigMemberListProps = {
            initialParams: { queryParams: { daoId: 'dao-id' } },
            ...props,
        };

        return (
            <OdsModulesProvider>
                <MultisigMemberList {...completeProps} />
            </OdsModulesProvider>
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
    });

    it('renders the children property', () => {
        const children = 'test-children';
        render(createTestComponent({ children }));
        expect(screen.getByText(children)).toBeInTheDocument();
    });
});
