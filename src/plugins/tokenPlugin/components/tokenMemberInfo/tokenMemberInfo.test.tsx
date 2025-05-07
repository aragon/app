import * as governanceService from '@/modules/governance/api/governanceService';
import { generateMember } from '@/modules/governance/testUtils';
import { generateTokenPluginSettings, generateTokenPluginSettingsToken } from '@/plugins/tokenPlugin/testUtils';
import * as daoService from '@/shared/api/daoService';
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
import { type ITokenMemberInfoProps, TokenMemberInfo } from './tokenMemberInfo';

describe('<TokenMemberInfo /> component', () => {
    const useMemberListSpy = jest.spyOn(governanceService, 'useMemberList');
    const useDaoSpy = jest.spyOn(daoService, 'useDao');

    beforeEach(() => {
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
        useMemberListSpy.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({ data: { pages: [], pageParams: [] } }),
        );
    });

    afterEach(() => {
        useMemberListSpy.mockReset();
        useDaoSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ITokenMemberInfoProps>) => {
        const completeProps: ITokenMemberInfoProps = {
            daoId: 'test-id',
            plugin: generateDaoPlugin({ settings: generateTokenPluginSettings() }),
            ...props,
        };

        return (
            <GukModulesProvider>
                <TokenMemberInfo {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the component with the correct eligible voters and members info', () => {
        const token = generateTokenPluginSettingsToken({ symbol: 'BTC', totalSupply: '300' });
        const plugin = generateDaoPlugin({ settings: generateTokenPluginSettings({ token }) });

        render(createTestComponent({ plugin }));

        expect(screen.getByText(/tokenMemberInfo.eligibleVoters/)).toBeInTheDocument();
        expect(screen.getByText(/tokenMemberInfo.tokenHolders/)).toBeInTheDocument();
        expect(screen.getByText(/tokenMemberInfo.tokenLabel/)).toBeInTheDocument();
        expect(screen.getByText(/tokenMemberInfo.tokenLinkDescription/)).toBeInTheDocument();
        expect(screen.getByText(/tokenMemberInfo.distribution/)).toBeInTheDocument();
        expect(screen.getByText(/tokenMemberInfo.supply/)).toBeInTheDocument();
        expect(screen.getByText(/tokenMemberInfo.tokenSupply \(supply=300,symbol=BTC\)/)).toBeInTheDocument();
    });

    it('contains a link to the block explorer page for the token', () => {
        const token = generateTokenPluginSettingsToken({ symbol: 'WETH', name: 'Wrapped ETH', address: '0x123' });
        const plugin = generateDaoPlugin({ settings: generateTokenPluginSettings({ token }) });

        render(createTestComponent({ plugin }));

        const link = screen.getByRole<HTMLAnchorElement>('link', { name: /tokenMemberInfo.tokenNameAndSymbol/ });
        expect(link.text).toContain('tokenName=Wrapped ETH,tokenSymbol=WETH');
        expect(link.href).toContain(token.address);
    });

    it('contains a link to the members page', () => {
        const token = generateTokenPluginSettingsToken({ symbol: 'BTC', name: 'Bitcoin', address: '0xBtcAddress' });
        const mockSettings = generateTokenPluginSettings({ votingMode: 2, token });
        const plugin = generateDaoPlugin({ settings: mockSettings });

        const members = [generateMember({ address: '0x123' }), generateMember({ address: '0x123' })];
        const membersMetadata = generatePaginatedResponseMetadata({ pageSize: 20, totalRecords: members.length });
        const membersResponse = generatePaginatedResponse({ data: members, metadata: membersMetadata });

        const daoAddress = '0x12345';

        useMemberListSpy.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({ data: { pages: [membersResponse], pageParams: [] } }),
        );
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao({ address: daoAddress }) }));

        render(createTestComponent({ plugin }));
        const linkElement = screen.getByRole('link', {
            name: /tokenMemberInfo.tokenDistribution \(count=2\) 0xBtcAddress/,
        });
        expect(linkElement).toHaveAttribute('href', `/dao/ethereum-mainnet/${daoAddress}/members`);
    });
});
