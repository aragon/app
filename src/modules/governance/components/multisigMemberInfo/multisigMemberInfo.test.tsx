import { generatePaginatedResponse } from '@/shared/testUtils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { governanceService } from '../../api/governanceService';
import { generateMember } from '../../testUtils';
import { type IMultisigMemberInfoProps, MultisigMemberInfo } from './multisigMemberInfo';

describe('<MultisigMemberInfo /> component', () => {
    const useMemberListSpy = jest.spyOn(governanceService, 'getMemberList');

    afterEach(() => {
        useMemberListSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IMultisigMemberInfoProps>) => {
        const client = new QueryClient();
        const completeProps: IMultisigMemberInfoProps = {
            daoId: 'test-id',
            ...props,
        };

        return (
            <QueryClientProvider client={client}>
                <MultisigMemberInfo {...completeProps} />
            </QueryClientProvider>
        );
    };

    it('renders the component with the correct eligible voters and members info', () => {
        render(createTestComponent());
        expect(screen.getByText('app.plugins.multisig.multisigMembersInfo.eligibleVoters')).toBeInTheDocument();
        expect(screen.getByText('app.plugins.multisig.multisigMembersInfo.members')).toBeInTheDocument();
    });

    it('displays the correct number of members', async () => {
        const membersResult = generatePaginatedResponse({ data: [generateMember()] });
        const mockMembers = {
            ...membersResult,
            metadata: {
                ...membersResult.metadata,
                totalRecords: 3,
            },
        };

        useMemberListSpy.mockResolvedValue(mockMembers);

        render(createTestComponent());

        await waitFor(() => {
            expect(
                screen.getByText('app.plugins.multisig.multisigMembersInfo.membersCount (count=3)'),
            ).toBeInTheDocument();
        });
    });

    it('contains a link to the members page with correct description', () => {
        render(createTestComponent());
        const linkElement = screen.getByRole('link');
        expect(linkElement).toHaveAttribute('href', './members');
    });
});
