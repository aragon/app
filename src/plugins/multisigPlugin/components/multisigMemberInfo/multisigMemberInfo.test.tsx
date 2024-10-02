import {
    generatePaginatedResponse,
    generatePaginatedResponseMetadata,
    generateReactQueryInfiniteResultSuccess,
} from '@/shared/testUtils';
import { OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import * as governanceService from '../../../../modules/governance/api/governanceService';
import { generateMember } from '../../../../modules/governance/testUtils';
import { type IMultisigMemberInfoProps, MultisigMemberInfo } from './multisigMemberInfo';

// Needed to spy usage of useMemberList hook
jest.mock('../../../../modules/governance/api/governanceService', () => ({
    __esModule: true,
    ...jest.requireActual('../../../../modules/governance/api/governanceService'),
}));

describe('<MultisigMemberInfo /> component', () => {
    const useMemberListSpy = jest.spyOn(governanceService, 'useMemberList');

    afterEach(() => {
        useMemberListSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IMultisigMemberInfoProps>) => {
        const completeProps: IMultisigMemberInfoProps = {
            daoId: 'test-id',
            pluginAddress: '0x123',
            ...props,
        };

        return (
            <OdsModulesProvider>
                <MultisigMemberInfo {...completeProps} />
            </OdsModulesProvider>
        );
    };

    it('renders the component with the correct eligible voters and members info', () => {
        render(createTestComponent());
        expect(screen.getByText(/multisigMembersInfo.eligibleVoters/)).toBeInTheDocument();
        expect(screen.getByText(/multisigMembersInfo.membersLabel/)).toBeInTheDocument();
    });

    it('displays the correct number of members', async () => {
        const members = [
            generateMember({ address: '0x123' }),
            generateMember({ address: '0x123' }),
            generateMember({ address: '0x123' }),
        ];
        const membersMetadata = generatePaginatedResponseMetadata({
            pageSize: 20,
            totalRecords: members.length,
        });
        const membersResponse = generatePaginatedResponse({ data: members, metadata: membersMetadata });

        useMemberListSpy.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({ data: { pages: [membersResponse], pageParams: [] } }),
        );

        render(createTestComponent());

        expect(screen.getByText(/multisigMembersInfo.membersCount \(count=3\)/)).toBeInTheDocument();
    });

    it('contains a link to the members page', () => {
        const members = [generateMember({ address: '0x123' })];
        const membersMetadata = generatePaginatedResponseMetadata({
            pageSize: 20,
            totalRecords: members.length,
        });
        const membersResponse = generatePaginatedResponse({ data: members, metadata: membersMetadata });

        useMemberListSpy.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({ data: { pages: [membersResponse], pageParams: [] } }),
        );
        render(createTestComponent({ daoId: 'dao-with-links' }));
        const linkElement = screen.getByRole('link');
        expect(linkElement).toHaveAttribute('href', '/dao/dao-with-links/members');
    });
});
