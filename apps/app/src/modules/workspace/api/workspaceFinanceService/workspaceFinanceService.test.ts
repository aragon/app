import { generateTransaction } from '@/modules/finance/testUtils';
import type {
    IWorkspaceTransaction,
    IWorkspaceTransactionPage,
} from './domain';
import { workspaceFinanceService } from './workspaceFinanceService';

describe('workspaceFinance service', () => {
    const buildItem = (
        daoId: string,
        blockTimestamp: number,
    ): IWorkspaceTransaction => ({
        daoId,
        key: `${daoId}-${blockTimestamp.toString()}`,
        transaction: generateTransaction({ blockTimestamp }),
    });

    const buildPage = (
        accounts: Array<{
            daoId: string;
            page: number;
            totalPages: number;
            timestamps: number[];
        }>,
    ): IWorkspaceTransactionPage => ({
        accounts: accounts.map(({ daoId, page, totalPages, timestamps }) => ({
            daoId,
            page,
            totalPages,
            totalRecords: totalPages * timestamps.length,
            transactions: timestamps.map((timestamp) =>
                buildItem(daoId, timestamp),
            ),
        })),
    });

    describe('mergeTransactionPages', () => {
        it('holds back the transactions a pending account could still precede', () => {
            const pages = [
                buildPage([
                    {
                        daoId: 'a',
                        page: 1,
                        totalPages: 2,
                        timestamps: [90, 80, 70],
                    },
                    {
                        daoId: 'b',
                        page: 1,
                        totalPages: 2,
                        timestamps: [85, 60],
                    },
                ]),
            ];

            const { transactions } =
                workspaceFinanceService.mergeTransactionPages(pages);

            // Frontier is max(70, 60) = 70, so 60 is withheld: account "b" may still hold a transaction at e.g. 65.
            expect(
                transactions.map((item) => item.transaction.blockTimestamp),
            ).toEqual([90, 85, 80, 70]);
        });

        it('emits every transaction once no account has pages left', () => {
            const pages = [
                buildPage([
                    {
                        daoId: 'a',
                        page: 1,
                        totalPages: 1,
                        timestamps: [90, 70],
                    },
                    {
                        daoId: 'b',
                        page: 1,
                        totalPages: 1,
                        timestamps: [85, 60],
                    },
                ]),
            ];

            const { transactions } =
                workspaceFinanceService.mergeTransactionPages(pages);

            expect(
                transactions.map((item) => item.transaction.blockTimestamp),
            ).toEqual([90, 85, 70, 60]);
        });

        it('deduplicates transactions repeated across page requests', () => {
            const pages = [
                buildPage([
                    { daoId: 'a', page: 1, totalPages: 1, timestamps: [90] },
                ]),
                buildPage([
                    { daoId: 'a', page: 1, totalPages: 1, timestamps: [90] },
                ]),
            ];

            const { transactions } =
                workspaceFinanceService.mergeTransactionPages(pages);

            expect(transactions).toHaveLength(1);
        });

        it('sums the total records of every account', () => {
            const pages = [
                buildPage([
                    {
                        daoId: 'a',
                        page: 1,
                        totalPages: 2,
                        timestamps: [90, 70],
                    },
                    {
                        daoId: 'b',
                        page: 1,
                        totalPages: 3,
                        timestamps: [85, 60],
                    },
                ]),
            ];

            const { totalRecords } =
                workspaceFinanceService.mergeTransactionPages(pages);

            expect(totalRecords).toEqual(4 + 6);
        });

        it('emits the list when a pending account returned no transaction', () => {
            const pages = [
                buildPage([
                    {
                        daoId: 'a',
                        page: 1,
                        totalPages: 1,
                        timestamps: [90, 70],
                    },
                    { daoId: 'b', page: 1, totalPages: 2, timestamps: [] },
                ]),
            ];

            const { transactions } =
                workspaceFinanceService.mergeTransactionPages(pages);

            expect(
                transactions.map((item) => item.transaction.blockTimestamp),
            ).toEqual([90, 70]);
        });
    });

    describe('getNextTransactionPageParams', () => {
        const params = { queryParams: { daoIds: ['a', 'b'] } };

        it('advances only the accounts sitting at the frontier', () => {
            const pages = [
                buildPage([
                    {
                        daoId: 'a',
                        page: 1,
                        totalPages: 2,
                        timestamps: [90, 80, 70],
                    },
                    {
                        daoId: 'b',
                        page: 1,
                        totalPages: 2,
                        timestamps: [85, 60],
                    },
                ]),
            ];

            const result = workspaceFinanceService.getNextTransactionPageParams(
                pages[0],
                pages,
                params,
            );

            // Account "a" is the one blocking the list at 70; "b" is already fetched down to 60.
            expect(result?.pages).toEqual({ a: 2 });
        });

        it('returns undefined once every account is drained', () => {
            const pages = [
                buildPage([
                    { daoId: 'a', page: 1, totalPages: 1, timestamps: [90] },
                    { daoId: 'b', page: 1, totalPages: 1, timestamps: [85] },
                ]),
            ];

            const result = workspaceFinanceService.getNextTransactionPageParams(
                pages[0],
                pages,
                params,
            );

            expect(result).toBeUndefined();
        });

        it('keeps advancing the same account across requests', () => {
            const pages = [
                buildPage([
                    {
                        daoId: 'a',
                        page: 1,
                        totalPages: 3,
                        timestamps: [90, 70],
                    },
                    { daoId: 'b', page: 1, totalPages: 1, timestamps: [85] },
                ]),
                buildPage([
                    {
                        daoId: 'a',
                        page: 2,
                        totalPages: 3,
                        timestamps: [65, 50],
                    },
                ]),
            ];

            const result = workspaceFinanceService.getNextTransactionPageParams(
                pages[1],
                pages,
                params,
            );

            expect(result?.pages).toEqual({ a: 3 });
        });

        it('advances an account that has pages left but returned no transaction', () => {
            const pages = [
                buildPage([
                    { daoId: 'a', page: 1, totalPages: 1, timestamps: [90] },
                    { daoId: 'b', page: 1, totalPages: 2, timestamps: [] },
                ]),
            ];

            const result = workspaceFinanceService.getNextTransactionPageParams(
                pages[0],
                pages,
                params,
            );

            expect(result?.pages).toEqual({ b: 2 });
        });
    });
});
