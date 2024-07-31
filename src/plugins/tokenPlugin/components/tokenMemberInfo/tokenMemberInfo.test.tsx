import { generateToken } from '@/modules/finance/testUtils';
import { generateDaoTokenSettings } from '@/plugins/tokenPlugin/testUtils';
import * as daoService from '@/shared/api/daoService';
import {
    generatePaginatedResponse,
    generatePaginatedResponseMetadata,
    generateReactQueryInfiniteResultSuccess,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import { OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import * as governanceService from '../../../../modules/governance/api/governanceService';
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
        const token = generateToken({ symbol: 'BTC', name: 'Bitcoin', totalSupply: '300' });
        const mockSettings = generateDaoTokenSettings({
            settings: { ...generateDaoTokenSettings().settings, votingMode: 2 },
            token,
        });

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
        const mockSettings = generateDaoTokenSettings({ token });
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: mockSettings }));

        render(createTestComponent());

        const link = screen.getByRole<HTMLAnchorElement>('link', { name: /tokenMemberInfo.tokenNameAndSymbol/ });
        expect(link.text).toContain('tokenName=Wrapped ETH,tokenSymbol=WETH');
    });

    it('contains a link to the members page', () => {
        const token = generateToken({ symbol: 'BTC', name: 'Bitcoin', totalSupply: '300', address: '0xBtcAddress' });
        const mockSettings = generateDaoTokenSettings({
            settings: { ...generateDaoTokenSettings().settings, votingMode: 2 },
            token,
        });

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
            name: /tokenMemberInfo.tokenDistribution \(count=5\) 0xBtcAddress/,
        });
        expect(linkElement).toHaveAttribute('href', '/dao/test-id/members');
    });
});
