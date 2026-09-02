import {
    financeService,
    type ITransaction,
} from '@/modules/finance/api/financeService';
import { OrderDirection } from '@/shared/api/aragonBackendService';
import type {
    IWorkspaceAsset,
    IWorkspaceAssetListResult,
    IWorkspaceTransaction,
    IWorkspaceTransactionAccountPage,
    IWorkspaceTransactionPage,
} from './domain';
import type {
    IGetWorkspaceAssetListParams,
    IGetWorkspaceTransactionAvailabilityParams,
    IGetWorkspaceTransactionListParams,
} from './workspaceFinanceService.api';

/**
 * Aggregates the finance APIs across the accounts of a workspace.
 *
 * The backend accepts exactly one `daoId` per request on `/v2/assets` and `/v2/transactions`, so a workspace-wide view
 * has to fan out one request per account and merge the responses here. The two endpoints get different treatment
 * because their volumes differ by orders of magnitude:
 *
 * - **Assets** are few per account, so every page of every account is drained (bounded by {@link maxAssetPages}) and
 *   the merged list is paginated client-side. This also yields exact totals for the aside stats.
 * - **Transactions** are unbounded, so they are merged lazily with a frontier cursor: only the prefix of the merged
 *   list that is provably ordered is exposed, and a page request advances just the accounts that limit that prefix.
 */
class WorkspaceFinanceService {
    /**
     * Cap on the asset pages fetched per account, so a pathological account cannot fan out unboundedly.
     */
    private maxAssetPages = 10;

    /**
     * Largest page size `/v2/assets` and `/v2/transactions` accept. A bigger value is rejected with a 400, so page
     * sizes are clamped rather than passed through.
     */
    private maxPageSize = 50;

    private defaultAssetPageSize = 50;

    private defaultTransactionPageSize = 20;

    getAssetList = async (
        params: IGetWorkspaceAssetListParams,
    ): Promise<IWorkspaceAssetListResult> => {
        const { daoIds, pageSize = this.defaultAssetPageSize } =
            params.queryParams;

        const accountResults = await Promise.all(
            daoIds.map((daoId) =>
                this.drainAssets(daoId, this.clampPageSize(pageSize)),
            ),
        );

        const assets = accountResults
            .flatMap((result) => result.assets)
            .sort((a, b) => this.assetValue(b) - this.assetValue(a));

        return {
            assets,
            totalRecords: accountResults.reduce(
                (total, result) => total + result.totalRecords,
                0,
            ),
            totalAmountUsd: assets.reduce(
                (total, asset) => total + this.assetValue(asset),
                0,
            ),
            isTruncated: accountResults.some((result) => result.isTruncated),
        };
    };

    getTransactionList = async (
        params: IGetWorkspaceTransactionListParams,
    ): Promise<IWorkspaceTransactionPage> => {
        const {
            daoIds,
            pageSize = this.defaultTransactionPageSize,
            side,
            type,
        } = params.queryParams;

        // No explicit page map means this is the first request of the query: fetch page 1 of every account.
        const pages =
            params.pages ??
            Object.fromEntries(daoIds.map((daoId) => [daoId, 1]));

        const entries = Object.entries(pages);

        const accounts = await Promise.all(
            entries.map(async ([daoId, page]) => {
                const response = await financeService.getTransactionList({
                    queryParams: {
                        daoId,
                        page,
                        pageSize: this.clampPageSize(pageSize),
                        side,
                        type,
                        // The merge compares timestamps across accounts, so the ordering is pinned explicitly. The
                        // backend defaults to `blockNumber`, which is not comparable between two chains, and it
                        // silently ignores an unrecognised sort field rather than erroring.
                        sort: 'blockTimestamp',
                        order: OrderDirection.DESC,
                    },
                });

                return {
                    daoId,
                    page: response.metadata.page,
                    totalPages: response.metadata.totalPages,
                    totalRecords: response.metadata.totalRecords,
                    transactions: response.data.map((transaction) => ({
                        transaction,
                        daoId,
                        key: this.transactionKey(transaction),
                    })),
                } satisfies IWorkspaceTransactionAccountPage;
            }),
        );

        return { accounts };
    };

    /**
     * Returns the total number of transactions matching a filter across every account, used to decide which type
     * filters to render. Only the response metadata is needed, so a single record is requested per account.
     */
    getTransactionAvailability = async (
        params: IGetWorkspaceTransactionAvailabilityParams,
    ): Promise<number> => {
        const { daoIds, side, type } = params.queryParams;

        const responses = await Promise.all(
            daoIds.map((daoId) =>
                financeService.getTransactionList({
                    queryParams: { daoId, page: 1, pageSize: 1, side, type },
                }),
            ),
        );

        return responses.reduce(
            (total, response) => total + response.metadata.totalRecords,
            0,
        );
    };

    /**
     * Computes the page map for the next request of a transaction query, or undefined when every account is drained.
     *
     * Only the accounts whose oldest fetched transaction sits at the frontier are advanced — they are the ones
     * blocking the merged list from growing. Advancing every account instead would over-fetch the accounts that are
     * already far ahead of the frontier.
     */
    getNextTransactionPageParams = (
        _lastPage: IWorkspaceTransactionPage | null,
        allPages: IWorkspaceTransactionPage[],
        previousParams: IGetWorkspaceTransactionListParams,
    ): IGetWorkspaceTransactionListParams | undefined => {
        const states = this.getAccountStates(allPages);
        const pendingStates = states.filter((state) => state.hasMore);

        if (pendingStates.length === 0) {
            return;
        }

        const frontier = this.getFrontier(states);
        const advancing = pendingStates.filter(
            (state) => state.oldestTimestamp >= frontier,
        );

        // Every pending account sits below the frontier (possible when an account returned an empty page): advance
        // all of them rather than stalling the query.
        const toAdvance = advancing.length > 0 ? advancing : pendingStates;

        return {
            ...previousParams,
            pages: Object.fromEntries(
                toAdvance.map((state) => [state.daoId, state.page + 1]),
            ),
        };
    };

    /**
     * Merges the fetched transaction pages into the prefix of the global ordering that is provably complete.
     *
     * A transaction is only safe to show once no account that still has unfetched pages could produce a newer one.
     * That boundary is the frontier: the newest of the "oldest fetched transaction" timestamps among the accounts
     * that still have pages left. Everything at or after it is emitted, everything older is held back.
     */
    mergeTransactionPages = (
        allPages: IWorkspaceTransactionPage[],
    ): {
        transactions: IWorkspaceTransaction[];
        totalRecords: number;
    } => {
        const states = this.getAccountStates(allPages);
        const frontier = this.getFrontier(states);

        const seen = new Set<string>();
        const transactions: IWorkspaceTransaction[] = [];

        for (const page of allPages) {
            for (const account of page.accounts) {
                for (const item of account.transactions) {
                    if (
                        seen.has(item.key) ||
                        item.transaction.blockTimestamp < frontier
                    ) {
                        continue;
                    }

                    seen.add(item.key);
                    transactions.push(item);
                }
            }
        }

        transactions.sort((a, b) => {
            const byTimestamp =
                b.transaction.blockTimestamp - a.transaction.blockTimestamp;

            // Ties are broken by key so the order stays stable as later pages arrive.
            return byTimestamp !== 0 ? byTimestamp : a.key.localeCompare(b.key);
        });

        return {
            transactions,
            totalRecords: states.reduce(
                (total, state) => total + state.totalRecords,
                0,
            ),
        };
    };

    private drainAssets = async (
        daoId: string,
        pageSize: number,
    ): Promise<{
        assets: IWorkspaceAsset[];
        totalRecords: number;
        isTruncated: boolean;
    }> => {
        const assets: IWorkspaceAsset[] = [];
        let page = 1;
        let totalPages = 1;
        let totalRecords = 0;

        while (page <= totalPages && page <= this.maxAssetPages) {
            const response = await financeService.getAssetList({
                queryParams: {
                    daoId,
                    page,
                    pageSize,
                    sort: 'amountUsd',
                    order: OrderDirection.DESC,
                },
            });

            totalPages = response.metadata.totalPages;
            totalRecords = response.metadata.totalRecords;
            assets.push(...response.data.map((asset) => ({ ...asset, daoId })));
            page += 1;
        }

        return {
            assets,
            totalRecords,
            isTruncated: totalPages > this.maxAssetPages,
        };
    };

    /**
     * Collapses the fetched pages into one state per account: the newest page reached, whether pages remain, and the
     * oldest transaction seen so far.
     */
    private getAccountStates = (allPages: IWorkspaceTransactionPage[]) => {
        const states = new Map<
            string,
            {
                daoId: string;
                page: number;
                totalPages: number;
                totalRecords: number;
                oldestTimestamp: number;
            }
        >();

        for (const page of allPages) {
            for (const account of page.accounts) {
                const current = states.get(account.daoId);
                const oldestOfPage = account.transactions.reduce(
                    (oldest, item) =>
                        Math.min(oldest, item.transaction.blockTimestamp),
                    Number.POSITIVE_INFINITY,
                );

                states.set(account.daoId, {
                    daoId: account.daoId,
                    page: Math.max(current?.page ?? 0, account.page),
                    totalPages: account.totalPages,
                    totalRecords: account.totalRecords,
                    oldestTimestamp: Math.min(
                        current?.oldestTimestamp ?? Number.POSITIVE_INFINITY,
                        oldestOfPage,
                    ),
                });
            }
        }

        return Array.from(states.values()).map((state) => ({
            ...state,
            hasMore: state.page < state.totalPages,
        }));
    };

    /**
     * The oldest transaction timestamp that is still safe to display: the newest of the per-account boundaries among
     * the accounts that have unfetched pages. Returns -Infinity when every account is drained, so nothing is held.
     *
     * Accounts that returned no transaction at all contribute no boundary — their timestamp is unknown, and letting
     * it stand would hide the whole list.
     */
    private getFrontier = (
        states: Array<{ oldestTimestamp: number; hasMore: boolean }>,
    ): number =>
        states
            .filter(
                (state) =>
                    state.hasMore && Number.isFinite(state.oldestTimestamp),
            )
            .reduce(
                (frontier, state) => Math.max(frontier, state.oldestTimestamp),
                Number.NEGATIVE_INFINITY,
            );

    /**
     * Builds a stable identity for a transaction. Only execution transactions carry an `id`, so transfers are keyed
     * by their block coordinates, which uniquely identify them within a block.
     */
    private transactionKey = (transaction: ITransaction): string => {
        if ('id' in transaction) {
            return transaction.id;
        }

        const {
            network,
            transactionHash,
            transactionIndex,
            logIndex,
            actionIndex,
            side,
        } = transaction;

        return [
            network,
            transactionHash,
            transactionIndex ?? '',
            logIndex ?? '',
            actionIndex ?? '',
            side,
        ].join('-');
    };

    private assetValue = (asset: IWorkspaceAsset): number =>
        Number(asset.amountUsd) || 0;

    private clampPageSize = (pageSize: number): number =>
        Math.min(pageSize, this.maxPageSize);
}

export const workspaceFinanceService = new WorkspaceFinanceService();
