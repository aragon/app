import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { DateTime } from 'luxon';
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
import { generateWorkspaceQueryResponse } from '../../testUtils';
import {
    type IWorkspaceAllProposalsAsideCardProps,
    WorkspaceAllProposalsAsideCard,
} from './workspaceAllProposalsAsideCard';

describe('<WorkspaceAllProposalsAsideCard /> component', () => {
    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';

    const useWorkspaceProposalListSpy = jest.spyOn(
        workspaceQueryService,
        'useWorkspaceProposalList',
    );

    const buildAccount = (address: string): IWorkspaceAccount => ({
        id: `${Network.ETHEREUM_SEPOLIA}-${address}`,
        type: WorkspaceAccountType.DAO,
        address,
        network: Network.ETHEREUM_SEPOLIA,
    });

    const accounts = [
        buildAccount(daoAddress),
        buildAccount('0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419'),
    ];

    const mockProposals = (options?: {
        totalRecords?: number;
        blockTimestamp?: number;
    }) =>
        useWorkspaceProposalListSpy.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({
                data: {
                    pages: [
                        generateWorkspaceQueryResponse({
                            data:
                                options?.blockTimestamp != null
                                    ? [
                                          {
                                              blockTimestamp:
                                                  options.blockTimestamp,
                                          },
                                      ]
                                    : [],
                            metadata: generatePaginatedResponseMetadata({
                                totalRecords: options?.totalRecords ?? 0,
                            }),
                        }),
                    ],
                    pageParams: [],
                },
            }) as unknown as ReturnType<
                typeof workspaceQueryService.useWorkspaceProposalList
            >,
        );

    beforeEach(() => {
        mockProposals();
    });

    afterEach(() => {
        useWorkspaceProposalListSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceAllProposalsAsideCardProps>,
    ) => {
        const completeProps: IWorkspaceAllProposalsAsideCardProps = {
            accounts,
            pageSize: 20,
            title: 'All proposals',
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceAllProposalsAsideCard {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('reads the first page of the list for every DAO account', () => {
        render(createTestComponent());

        expect(useWorkspaceProposalListSpy).toHaveBeenLastCalledWith(
            {
                body: {
                    accounts: accounts.map(({ network, address }) => ({
                        network,
                        address,
                    })),
                    pagination: { pageSize: 20 },
                },
            },
            { enabled: true },
        );
    });

    it('displays the totals of the aggregated selection', () => {
        mockProposals({ totalRecords: 12 });
        render(createTestComponent());

        expect(screen.getByText('All proposals')).toBeInTheDocument();
        expect(screen.getByText('12')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('displays a placeholder for the stats that have not loaded yet', () => {
        useWorkspaceProposalListSpy.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({
                data: { pages: [], pageParams: [] },
            }) as unknown as ReturnType<
                typeof workspaceQueryService.useWorkspaceProposalList
            >,
        );
        render(createTestComponent());

        // Total and most-recent are both unknown, the DAO count is always known.
        expect(screen.getAllByText('-')).toHaveLength(2);
    });

    it('displays how long ago the most recent proposal was created', () => {
        const timestamp = DateTime.now().minus({ days: 3 }).toSeconds();
        mockProposals({ blockTimestamp: Math.floor(timestamp) });
        render(createTestComponent());

        expect(screen.getByText('3')).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.workspace.workspaceAllProposalsAsideCard.recentUnit (unit=days)',
            ),
        ).toBeInTheDocument();
    });

    it('titles the card generically when given no title', () => {
        render(createTestComponent({ title: undefined }));

        expect(
            screen.getByText(/workspaceAllProposalsAsideCard\.allProposals$/),
        ).toBeInTheDocument();
    });
});
