import {
    generateDaoPlugin,
    generatePaginatedResponse,
    generatePaginatedResponseMetadata,
    generateReactQueryInfiniteResultSuccess,
} from '@/shared/testUtils';
import { OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import * as governanceService from '../../../../modules/governance/api/governanceService';
import { generateMember } from '../../../../modules/governance/testUtils';
import { AdminMemberInfo, type IAdminMemberInfoProps } from './adminMemberInfo';

// Needed to spy usage of useMemberList hook
jest.mock('../../../../modules/governance/api/governanceService', () => ({
    __esModule: true,
    ...jest.requireActual('../../../../modules/governance/api/governanceService'),
}));

describe('<AdminMemberInfo /> component', () => {
    const useMemberListSpy = jest.spyOn(governanceService, 'useMemberList');

    afterEach(() => {
        useMemberListSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IAdminMemberInfoProps>) => {
        const completeProps: IAdminMemberInfoProps = {
            daoId: 'test-id',
            plugin: generateDaoPlugin(),
            ...props,
        };

        return (
            <OdsModulesProvider>
                <AdminMemberInfo {...completeProps} />
            </OdsModulesProvider>
        );
    };

    it('renders the correct member info for the admin plugin', async () => {
        const members = [generateMember({ address: '0x123' }), generateMember({ address: '0x456' })];
        const membersMetadata = generatePaginatedResponseMetadata({ pageSize: 20, totalRecords: members.length });
        const membersResponse = generatePaginatedResponse({ data: members, metadata: membersMetadata });
        const result = generateReactQueryInfiniteResultSuccess({ data: { pages: [membersResponse], pageParams: [] } });

        useMemberListSpy.mockReturnValue(result);
        render(createTestComponent());

        expect(screen.getByText(/adminMemberInfo.admins/)).toBeInTheDocument();
        expect(screen.getByText(/adminMemberInfo.membersCount \(count=2\)/)).toBeInTheDocument();
    });
});
