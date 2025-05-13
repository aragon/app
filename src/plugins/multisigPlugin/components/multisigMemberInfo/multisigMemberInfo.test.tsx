import * as governanceService from '@/modules/governance/api/governanceService';
import { generateMember } from '@/modules/governance/testUtils';
import * as daoService from '@/shared/api/daoService';
import { Network } from '@/shared/api/daoService';
import {
    generateDao,
    generateDaoPlugin,
    generatePaginatedResponse,
    generatePaginatedResponseMetadata,
    generateReactQueryInfiniteResultSuccess,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { generateMultisigPluginSettings } from '../../testUtils';
import { type IMultisigMemberInfoProps, MultisigMemberInfo } from './multisigMemberInfo';

describe('<MultisigMemberInfo /> component', () => {
    const useMemberListSpy = jest.spyOn(governanceService, 'useMemberList');
    const useDaoSpy = jest.spyOn(daoService, 'useDao');

    beforeEach(() => {
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
    });

    afterEach(() => {
        useMemberListSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IMultisigMemberInfoProps>) => {
        const completeProps: IMultisigMemberInfoProps = {
            daoId: 'test-id',
            plugin: generateDaoPlugin({ settings: generateMultisigPluginSettings() }),
            ...props,
        };

        return (
            <GukModulesProvider>
                <MultisigMemberInfo {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the component with the correct eligible voters and members info', () => {
        render(createTestComponent());
        expect(screen.getByText(/multisigMembersInfo.eligibleVoters/)).toBeInTheDocument();
        expect(screen.getByText(/multisigMembersInfo.membersLabel/)).toBeInTheDocument();
    });

    it('displays the correct number of members', () => {
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
        const daoNetwork = Network.ETHEREUM_MAINNET;
        const daoAddress = '0x12345';
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao({ address: daoAddress, network: daoNetwork }) }),
        );

        render(createTestComponent({ daoId: 'dao-with-links' }));

        const linkElement = screen.getByRole('link');
        expect(linkElement).toHaveAttribute('href', `/dao/${daoNetwork}/${daoAddress}/members`);
    });
});
