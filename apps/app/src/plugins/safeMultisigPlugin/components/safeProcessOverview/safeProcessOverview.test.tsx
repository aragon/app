import { GukModulesProvider, ProposalStatus } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

jest.mock('@/assets/images/safeWallet.png', () => ({
    __esModule: true,
    default: {
        height: 32,
        src: '/safeWallet.png',
        width: 32,
    },
}));

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

    afterEach(() => {
        useSafeDaoProposalsSpy.mockReset();
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
});
