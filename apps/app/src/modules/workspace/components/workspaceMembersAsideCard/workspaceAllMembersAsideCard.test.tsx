import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import {
    generatePaginatedResponseMetadata,
    generateReactQueryInfiniteResultSuccess,
} from '@/shared/testUtils';
import * as workspaceQueryService from '../../api/workspaceQueryService';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import type { IWorkspaceAccountOption } from '../../hooks/useWorkspaceAccountOptions';
import { generateWorkspaceQueryResponse } from '../../testUtils';
import {
    type IWorkspaceAllMembersAsideCardProps,
    WorkspaceAllMembersAsideCard,
} from './workspaceAllMembersAsideCard';

describe('<WorkspaceAllMembersAsideCard /> component', () => {
    const useWorkspaceMemberListSpy = jest.spyOn(
        workspaceQueryService,
        'useWorkspaceMemberList',
    );

    const daoAccount: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5`,
        type: WorkspaceAccountType.DAO,
        address: '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5',
        network: Network.ETHEREUM_SEPOLIA,
    };

    const safeAccount: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419`,
        type: WorkspaceAccountType.SAFE,
        address: '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419',
        network: Network.ETHEREUM_SEPOLIA,
    };

    const accounts = [daoAccount, safeAccount];

    const allAccountsOption: IWorkspaceAccountOption = {
        id: 'all',
        label: 'All accounts',
        isAllAccounts: true,
    };

    const mockMembers = (options?: {
        totalRecords?: number;
        partial?: boolean;
    }) =>
        useWorkspaceMemberListSpy.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({
                data: {
                    pages: [
                        generateWorkspaceQueryResponse({
                            data: [],
                            partial: options?.partial ?? false,
                            metadata: generatePaginatedResponseMetadata({
                                totalRecords: options?.totalRecords ?? 0,
                            }),
                        }),
                    ],
                    pageParams: [],
                },
            }) as unknown as ReturnType<
                typeof workspaceQueryService.useWorkspaceMemberList
            >,
        );

    beforeEach(() => {
        mockMembers();
    });

    afterEach(() => {
        useWorkspaceMemberListSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceAllMembersAsideCardProps>,
    ) => {
        const completeProps: IWorkspaceAllMembersAsideCardProps = {
            accounts,
            pageSize: 18,
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceAllMembersAsideCard {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('reads the first page of the list for every account', () => {
        render(createTestComponent());

        expect(useWorkspaceMemberListSpy).toHaveBeenLastCalledWith(
            {
                body: {
                    accounts: accounts.map(({ network, address }) => ({
                        network,
                        address,
                    })),
                    pagination: { pageSize: 18 },
                },
            },
            { enabled: true },
        );
    });

    it('displays the totals of the aggregated selection', () => {
        mockMembers({ totalRecords: 12 });
        render(createTestComponent());

        expect(screen.getByText('12')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    // The list beside it warns that it may be incomplete, so the total cannot read as exact.
    it('marks the total as a lower bound when an account could not be read', () => {
        mockMembers({ totalRecords: 12, partial: true });
        render(createTestComponent());

        expect(screen.getByText('12+')).toBeInTheDocument();
    });

    it('displays a placeholder for the total that has not loaded yet', () => {
        useWorkspaceMemberListSpy.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({
                data: { pages: [], pageParams: [] },
            }) as unknown as ReturnType<
                typeof workspaceQueryService.useWorkspaceMemberList
            >,
        );
        render(createTestComponent());

        // The total is unknown, the account count is always known.
        expect(screen.getAllByText('-')).toHaveLength(1);
    });

    it('titles the card after the active option', () => {
        render(createTestComponent({ activeOption: allAccountsOption }));

        expect(screen.getByText('All accounts')).toBeInTheDocument();
    });

    it('titles the card generically when no option is active', () => {
        render(createTestComponent());

        expect(
            screen.getByText(/workspaceMembersAsideCard\.allMembers$/),
        ).toBeInTheDocument();
    });
});
