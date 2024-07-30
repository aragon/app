import { generateToken } from '@/modules/finance/testUtils';
import { generateDaoTokenSettings } from '@/plugins/tokenPlugin/testUtils';
import * as daoService from '@/shared/api/daoService';
import * as governanceService from '../../../../modules/governance/api/governanceService';
import {
    generatePaginatedResponse,
    generatePaginatedResponseMetadata,
    generateReactQueryInfiniteResultSuccess,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import { OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { generateMember } from '../../../../modules/governance/testUtils';
import { type ITokenMemberInfoProps, TokenMemberInfo } from './tokenMemberInfo';

// Needed to spy usage of useMemberList hook
jest.mock('../../../../modules/governance/api/governanceService', () => ({
    __esModule: true,
    ...jest.requireActual('../../../../modules/governance/api/governanceService'),
}));

describe('<TokenMemberInfo /> component', () => {
    const useDaoSettingsSpy = jest.spyOn(daoService, 'useDaoSettings');
    const useMemberListSpy = jest.spyOn(governanceService, 'useMemberList');

    beforeEach(() => {
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDaoTokenSettings() }));
    });

    afterEach(() => {
        useDaoSettingsSpy.mockReset();
        useMemberListSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ITokenMemberInfoProps>) => {
        const completeProps: ITokenMemberInfoProps = {
            daoId: 'test-id',
            ...props,
        };

        return (
            <OdsModulesProvider>
                <TokenMemberInfo {...completeProps} />
            </OdsModulesProvider>
        );
    };

    it('renders the component with the correct eligible voters and members info', async () => {
        const baseSettings = generateDaoTokenSettings();
        const baseTokenSettings = generateToken();
        const mockSettings = {
            ...baseSettings,
            settings: {
                ...baseSettings.settings,
                votingMode: 2,
            },
            token: {
                ...baseTokenSettings,
                symbol: 'BTC',
                name: 'Bitcoin',
                totalSupply: 300,
            },
        };

        const members = [
            generateMember({ address: '0x123' }),
            generateMember({ address: '0x123' }),
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

        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: mockSettings }));

        render(createTestComponent());

        expect(screen.getByText('app.plugins.token.tokenMemberInfo.eligibleVoters')).toBeInTheDocument();
        expect(screen.getByText('app.plugins.token.tokenMemberInfo.tokenHolders')).toBeInTheDocument();
        expect(screen.getByText('app.plugins.token.tokenMemberInfo.token')).toBeInTheDocument();
        expect(screen.getByText('app.plugins.token.tokenMemberInfo.tokenLinkDescription')).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.plugins.token.tokenMemberInfo.tokenNameAndSymbol (tokenName=Bitcoin,tokenSymbol=BTC)',
            ),
        ).toBeInTheDocument();
        expect(screen.getByText('app.plugins.token.tokenMemberInfo.distribution')).toBeInTheDocument();
        expect(screen.getByText('app.plugins.token.tokenMemberInfo.tokenDistribution (count=5)')).toBeInTheDocument();
        expect(screen.getByText('app.plugins.token.tokenMemberInfo.supply')).toBeInTheDocument();
        expect(
            screen.getByText('app.plugins.token.tokenMemberInfo.tokenSupply (supply=300,symbol=BTC)'),
        ).toBeInTheDocument();
    });

    it('contains a link to the block explorer', () => {
        const members = [
            generateMember({ address: '0x123' }),
            generateMember({ address: '0x123' }),
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
        const linkElement = screen.getByRole('link', {
            name: 'app.plugins.token.tokenMemberInfo.tokenNameAndSymbol (tokenName=Ethereum,tokenSymbol=ETH) app.plugins.token.tokenMemberInfo.tokenLinkDescription',
        });
        expect(linkElement).toHaveAttribute('href', 'https://etherscan.io/token/0xTestAddress');
    });

    it('contains a link to the members page', () => {
        const baseSettings = generateDaoTokenSettings();
        const baseTokenSettings = generateToken();
        const mockSettings = {
            ...baseSettings,
            settings: {
                ...baseSettings.settings,
                votingMode: 2,
            },
            token: {
                ...baseTokenSettings,
                symbol: 'BTC',
                name: 'Bitcoin',
                totalSupply: 300,
            },
        };

        const members = [
            generateMember({ address: '0x123' }),
            generateMember({ address: '0x123' }),
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

        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: mockSettings }));
        render(createTestComponent());
        const linkElement = screen.getByRole('link', {
            name: 'app.plugins.token.tokenMemberInfo.tokenDistribution (count=5) 0xTestAddress',
        });
        expect(linkElement).toHaveAttribute('href', './members');
    });
});
