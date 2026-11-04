import { GukModulesProvider, ProposalStatus } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { IUseEnsNameReturn } from '@/modules/ens';
import * as ensModule from '@/modules/ens';
import { generateDaoPlugin } from '@/shared/testUtils/generators';
import type {
    ISafeDaoProposalsData,
    IUseSafeDaoProposalsReturn,
} from '../../hooks/useSafeDaoProposals';
import * as safeDaoProposalsHook from '../../hooks/useSafeDaoProposals';
import {
    generateSafeInfo,
    generateSafeMultisigTransaction,
} from '../../testUtils';
import { SafeTransactionState } from '../../types';
import { SafeProcessOverview } from './safeProcessOverview';

const daoAddress = '0x1111111111111111111111111111111111111111';
const safeAddress = '0x2222222222222222222222222222222222222222';
const daoId = `ethereum-mainnet-${daoAddress}`;

const createData = (
    proposals: ISafeDaoProposalsData['proposals'] = [],
): ISafeDaoProposalsData => ({
    meta: {
        fetchedAt: '2025-01-01T00:00:00.000Z',
        partial: false,
        stale: false,
    },
    proposals,
    safeInfo: generateSafeInfo(),
});

const createHookResult = (
    overrides: Partial<IUseSafeDaoProposalsReturn> = {},
): IUseSafeDaoProposalsReturn => ({
    data: createData(),
    error: null,
    fetchNextPage: jest.fn().mockResolvedValue(undefined),
    hasNextPage: false,
    isError: false,
    isFetchNextPageError: false,
    isFetchingNextPage: false,
    isIndexing: false,
    isLoading: false,
    isPartial: false,
    isStale: false,
    ...overrides,
});

describe('<SafeProcessOverview />', () => {
    const useSafeDaoProposalsSpy = jest.spyOn(
        safeDaoProposalsHook,
        'useSafeDaoProposals',
    );
    const useEnsNameSpy = jest.spyOn(ensModule, 'useEnsName');
    const plugin = generateDaoPlugin({
        address: safeAddress,
        daoAddress,
    });

    const createTestComponent = () => (
        <GukModulesProvider>
            <SafeProcessOverview
                initialParams={{ queryParams: { daoId } }}
                plugin={plugin}
            />
        </GukModulesProvider>
    );

    beforeEach(() => {
        useEnsNameSpy.mockReturnValue({
            data: null,
            isLoading: false,
        } as IUseEnsNameReturn);
    });

    afterEach(() => {
        useSafeDaoProposalsSpy.mockReset();
        useEnsNameSpy.mockReset();
    });

    it('keeps More available when the first backend page filters to zero rows', async () => {
        const fetchNextPage = jest.fn().mockResolvedValue(undefined);
        useSafeDaoProposalsSpy.mockReturnValue(
            createHookResult({
                fetchNextPage,
                hasNextPage: true,
            }),
        );

        render(createTestComponent());

        const moreButton = screen.getByRole('button', { name: 'More' });
        await userEvent.click(moreButton);

        expect(fetchNextPage).toHaveBeenCalledTimes(1);
    });

    it('keeps retained rows and retry More available after a next-page error', async () => {
        const fetchNextPage = jest.fn().mockResolvedValue(undefined);
        const transaction = generateSafeMultisigTransaction({
            nonce: '7',
            safeTxHash: `0x${'7'.repeat(64)}`,
        });
        useSafeDaoProposalsSpy.mockReturnValue(
            createHookResult({
                data: createData([
                    {
                        actions: [],
                        state: SafeTransactionState.LIVE,
                        status: ProposalStatus.ACTIVE,
                        transaction,
                    },
                ]),
                fetchNextPage,
                hasNextPage: true,
                isError: true,
                isFetchNextPageError: true,
            }),
        );

        render(createTestComponent());
        expect(
            screen.getByRole('link', { name: /SAFE-7 ·/ }),
        ).toBeInTheDocument();

        const moreButton = screen.getByRole('button', { name: 'More' });
        await userEvent.click(moreButton);

        expect(fetchNextPage).toHaveBeenCalledTimes(1);
    });
    it('keeps the freshness warning without the Safe announcement and links the proposer', () => {
        const proposerAddress = '0x3333333333333333333333333333333333333333';
        const transaction = generateSafeMultisigTransaction({
            from: proposerAddress,
            nonce: '8',
            safeTxHash: `0x${'8'.repeat(64)}`,
        });
        useSafeDaoProposalsSpy.mockReturnValue(
            createHookResult({
                data: createData([
                    {
                        actions: [],
                        state: SafeTransactionState.LIVE,
                        status: ProposalStatus.ACTIVE,
                        transaction,
                    },
                ]),
                isStale: true,
            }),
        );

        render(createTestComponent());

        expect(
            screen.queryByText(
                'app.plugins.safeMultisig.safeProcess.transactionsTitle',
            ),
        ).not.toBeInTheDocument();
        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeProcess.transactionsStale',
            ),
        ).toBeInTheDocument();

        const proposerHref = `/dao/ethereum-mainnet/${daoAddress}/members/${proposerAddress}`;
        const proposerLink = screen
            .getAllByRole('link')
            .find((link) => link.getAttribute('href') === proposerHref);
        expect(proposerLink?.getAttribute('href')).toBe(proposerHref);
        expect(proposerLink?.getAttribute('href')).not.toContain(safeAddress);
    });

    it('does not use the Safe address when a transaction has no proposer', () => {
        const transaction = generateSafeMultisigTransaction({
            from: null,
            nonce: '9',
            safeTxHash: `0x${'9'.repeat(64)}`,
        });
        useSafeDaoProposalsSpy.mockReturnValue(
            createHookResult({
                data: createData([
                    {
                        actions: [],
                        state: SafeTransactionState.LIVE,
                        status: ProposalStatus.ACTIVE,
                        transaction,
                    },
                ]),
            }),
        );

        render(createTestComponent());

        expect(useEnsNameSpy).toHaveBeenCalledWith(undefined);
        expect(
            screen
                .getAllByRole('link')
                .some((link) =>
                    link
                        .getAttribute('href')
                        ?.includes(`/members/${safeAddress}`),
                ),
        ).toBe(false);
    });
});
