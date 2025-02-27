import { generateToken } from '@/modules/finance/testUtils';
import { generateTokenPluginSettings } from '@/plugins/tokenPlugin/testUtils';
import {
    generateDaoPlugin,
    generatePaginatedResponse,
    generatePaginatedResponseMetadata,
    generateReactQueryInfiniteResultSuccess,
} from '@/shared/testUtils';
import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as governanceService from '../../../../modules/governance/api/governanceService';
import { generateMember } from '../../../../modules/governance/testUtils';
import { type ITokenMemberInfoProps, TokenMemberInfo } from './tokenMemberInfo';

describe('<TokenMemberInfo /> component', () => {
    const useMemberListSpy = jest.spyOn(governanceService, 'useMemberList');

    afterEach(() => {
        useMemberListSpy.mockReset();
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
        const token = generateToken({ symbol: 'BTC', name: 'Bitcoin', totalSupply: '300' });
        const mockSettings = generateTokenPluginSettings({ votingMode: 2, token });
        const plugin = generateDaoPlugin({ settings: mockSettings });

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

        render(createTestComponent({ plugin }));

        expect(screen.getByText(/tokenMemberInfo.eligibleVoters/)).toBeInTheDocument();
        expect(screen.getByText(/tokenMemberInfo.tokenHolders/)).toBeInTheDocument();
        expect(screen.getByText(/tokenMemberInfo.tokenLabel/)).toBeInTheDocument();
        expect(screen.getByText(/tokenMemberInfo.tokenLinkDescription/)).toBeInTheDocument();
        expect(
            screen.getByText(/tokenMemberInfo.tokenNameAndSymbol \(tokenName=Bitcoin,tokenSymbol=BTC\)/),
        ).toBeInTheDocument();
        expect(screen.getByText(/tokenMemberInfo.distribution/)).toBeInTheDocument();
        expect(screen.getByText(/tokenMemberInfo.tokenDistribution \(count=5\)/)).toBeInTheDocument();
        expect(screen.getByText(/tokenMemberInfo.supply/)).toBeInTheDocument();
        expect(screen.getByText(/tokenMemberInfo.tokenSupply \(supply=300,symbol=BTC\)/)).toBeInTheDocument();
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

        const token = generateToken({ symbol: 'WETH', name: 'Wrapped ETH', address: '0xWethAddress' });
        const mockSettings = generateTokenPluginSettings({ token });
        const plugin = generateDaoPlugin({ settings: mockSettings });

        render(createTestComponent({ plugin }));

        const link = screen.getByRole<HTMLAnchorElement>('link', { name: /tokenMemberInfo.tokenNameAndSymbol/ });
        expect(link.text).toContain('tokenName=Wrapped ETH,tokenSymbol=WETH');
    });

    it('contains a link to the members page', () => {
        const token = generateToken({ symbol: 'BTC', name: 'Bitcoin', totalSupply: '300', address: '0xBtcAddress' });
        const mockSettings = generateTokenPluginSettings({ votingMode: 2, token });
        const plugin = generateDaoPlugin({ settings: mockSettings });

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

        render(createTestComponent({ plugin }));
        const linkElement = screen.getByRole('link', {
            name: /tokenMemberInfo.tokenDistribution \(count=5\) 0xBtcAddress/,
        });
        expect(linkElement).toHaveAttribute('href', '/dao/test-id/members');
    });
});
