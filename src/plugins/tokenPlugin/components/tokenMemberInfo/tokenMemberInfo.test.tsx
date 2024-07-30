import { generateToken } from '@/modules/finance/testUtils';
import { generateDaoTokenSettings } from '@/plugins/tokenPlugin/testUtils';
import * as daoService from '@/shared/api/daoService';
import { generatePaginatedResponse, generateReactQueryResultSuccess, ReactQueryWrapper } from '@/shared/testUtils';
import { OdsModulesProvider } from '@aragon/ods';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import { governanceService, useMemberList } from '../../../../modules/governance/api/governanceService';
import { generateMember } from '../../../../modules/governance/testUtils';
import { type ITokenMemberInfoProps, TokenMemberInfo } from './tokenMemberInfo';

describe('<TokenMemberInfo /> component', () => {
    const useDaoSettingsSpy = jest.spyOn(daoService, 'useDaoSettings');
    const useMemberListSpy = jest.spyOn(governanceService, 'getMemberList');

    beforeEach(() => {
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDaoTokenSettings() }));
    });

    afterEach(() => {
        useDaoSettingsSpy.mockReset();
        useMemberListSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ITokenMemberInfoProps>) => {
        const client = new QueryClient();
        const completeProps: ITokenMemberInfoProps = {
            daoId: 'test-id',
            ...props,
        };

        return (
            <QueryClientProvider client={client}>
                <OdsModulesProvider>
                    <TokenMemberInfo {...completeProps} />
                </OdsModulesProvider>
            </QueryClientProvider>
        );
    };

    it('renders the component with the correct eligible voters and members info', async () => {
        const membersResult = generatePaginatedResponse({ data: [generateMember()] });
        const mockMembers = {
            ...membersResult,
            metadata: {
                ...membersResult.metadata,
                totalRecords: 5,
            },
        };

        useMemberListSpy.mockResolvedValue(mockMembers);

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

        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: mockSettings }));

        const { result: membersHookResult } = renderHook(() => useMemberList({ queryParams: { daoId: 'test-id' } }), {
            wrapper: ReactQueryWrapper,
        });

        render(createTestComponent());

        await waitFor(() => {
            expect(membersHookResult.current.data?.pages[0].metadata.totalRecords).toBe(
                mockMembers.metadata.totalRecords,
            );
        });

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
        render(createTestComponent());
        const linkElement = screen.getByRole('link', {
            name: 'app.plugins.token.tokenMemberInfo.tokenDistribution (count=5) 0xTestAddress',
        });
        expect(linkElement).toHaveAttribute('href', 'https://etherscan.io/token/0xTestAddress');
    });

    it('contains a link to the members page', () => {
        render(createTestComponent());
        const linkElement = screen.getByRole('link', {
            name: 'app.plugins.token.tokenMemberInfo.tokenNameAndSymbol (tokenName=Ethereum,tokenSymbol=ETH) app.plugins.token.tokenMemberInfo.tokenLinkDescription',
        });
        expect(linkElement).toHaveAttribute('href', './members');
    });
});
