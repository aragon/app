import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useSearchParams } from 'next/navigation';
import * as wagmi from 'wagmi';
import * as ensModule from '@/modules/ens';
import type { IMember } from '@/modules/governance/api/governanceService';
import * as governanceService from '@/modules/governance/api/governanceService';
import { generateMember } from '@/modules/governance/testUtils';
import * as cmsService from '@/shared/api/cmsService';
import * as daoService from '@/shared/api/daoService';
import { FeatureFlagsProvider } from '@/shared/components/featureFlagsProvider';
import {
    generateDao,
    generateDaoPlugin,
    generatePaginatedResponse,
    generatePaginatedResponseMetadata,
    generateReactQueryInfiniteResultSuccess,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import { ReactQueryWrapper } from '@/shared/testUtils/reactQueryWrapper';
import {
    DaoMemberListContainer,
    type IDaoMemberListContainerProps,
} from './daoMemberListContainer';

jest.mock('next/navigation', () => ({
    useSearchParams: jest.fn(),
}));

describe('<DaoMemberListContainer /> component', () => {
    const useSearchParamsMock = jest.mocked(useSearchParams);
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useDaoOverridesSpy = jest.spyOn(cmsService, 'useDaoOverrides');
    const useMemberListSpy = jest.spyOn(governanceService, 'useMemberList');
    const useMemberExistsSpy = jest.spyOn(governanceService, 'useMemberExists');
    const useMemberSpy = jest.spyOn(governanceService, 'useMember');
    const useConnectionSpy = jest.spyOn(wagmi, 'useConnection');
    const useEnsNameSpy = jest.spyOn(ensModule, 'useEnsName');
    const useEnsAvatarSpy = jest.spyOn(ensModule, 'useEnsAvatar');

    const daoAddress = '0x1111111111111111111111111111111111111111';
    const safeAddress = '0x1234567890123456789012345678901234567890';
    const memberAddress = '0x2222222222222222222222222222222222222222';
    const safeTabLabel = 'Safe 0x1234…7890';

    const createDao = () =>
        generateDao({
            address: daoAddress,
            plugins: [
                generateDaoPlugin({
                    address: '0x3333333333333333333333333333333333333333',
                    interfaceType: daoService.PluginInterfaceType.TOKEN_VOTING,
                    isBody: true,
                    name: 'Token voting',
                    slug: 'token-voting',
                }),
                generateDaoPlugin({
                    address: safeAddress,
                    interfaceType: daoService.PluginInterfaceType.SAFE,
                    isBody: false,
                    isProcess: true,
                    slug: 'safe',
                }),
            ],
        });

    beforeEach(() => {
        const members = [generateMember({ address: memberAddress })];
        const membersResponse = generatePaginatedResponse({
            data: members,
            metadata: generatePaginatedResponseMetadata({
                pageSize: 10,
                totalRecords: members.length,
            }),
        });

        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: createDao() }),
        );
        useDaoOverridesSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: {} }),
        );
        useMemberListSpy.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({
                data: { pages: [membersResponse], pageParams: [] },
            }),
        );
        useMemberExistsSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: { status: false } }),
        );
        useMemberSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: undefined as unknown as IMember,
            }),
        );
        useConnectionSpy.mockReturnValue({
            address: undefined,
        } as unknown as wagmi.UseConnectionReturnType);
        useEnsNameSpy.mockReturnValue({
            data: null,
            isLoading: false,
        } as ensModule.IUseEnsNameReturn);
        useEnsAvatarSpy.mockReturnValue({
            ...generateReactQueryResultSuccess({ data: null }),
            queryKey: [],
        });
        useSearchParamsMock.mockReturnValue(new URLSearchParams() as never);
        window.history.replaceState(
            null,
            '',
            `/dao/ethereum-mainnet/${daoAddress}/members`,
        );
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        useDaoOverridesSpy.mockReset();
        useMemberListSpy.mockReset();
        useMemberExistsSpy.mockReset();
        useMemberSpy.mockReset();
        useConnectionSpy.mockReset();
        useEnsNameSpy.mockReset();
        useEnsAvatarSpy.mockReset();
        useSearchParamsMock.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IDaoMemberListContainerProps>,
    ) => {
        const completeProps: IDaoMemberListContainerProps = {
            initialParams: { queryParams: { daoId: 'test-id' } },
            ...props,
        };

        return (
            <FeatureFlagsProvider>
                <ReactQueryWrapper>
                    <GukModulesProvider>
                        <DaoMemberListContainer {...completeProps} />
                    </GukModulesProvider>
                </ReactQueryWrapper>
            </FeatureFlagsProvider>
        );
    };

    it('renders and selects an execute-only Safe member tab', async () => {
        render(createTestComponent());

        const safeTab = screen.getByRole('radio', { name: safeTabLabel });
        expect(safeTab).toBeInTheDocument();

        await userEvent.click(safeTab);

        const memberSourceId = `${safeAddress}-safe-${daoAddress}`;
        const memberHref = `/dao/ethereum-mainnet/${daoAddress}/members/${memberAddress}?members=${memberSourceId}`;
        const memberLink = screen
            .getAllByRole('link')
            .find((link) => link.getAttribute('href') === memberHref);

        expect(window.location.search).toBe(`?members=${memberSourceId}`);
        expect(memberLink).toBeDefined();
    });
});
