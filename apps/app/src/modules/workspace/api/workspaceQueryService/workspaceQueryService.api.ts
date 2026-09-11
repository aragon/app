import type { TransactionSide } from '@/modules/finance/api/financeService';
import type {
    IOrderedRequest,
    IPaginatedRequest,
    IPaginatedResponse,
    ISearchedRequest,
} from '@/shared/api/aragonBackendService';
import type { Network } from '@/shared/api/daoService';
import type {
    IRequestBodyParams,
    IRequestQueryBodyParams,
} from '@/shared/api/httpService';
import type {
    IWorkspaceAccountRef,
    IWorkspaceCoverage,
    WorkspaceTransactionType,
} from './domain';

/**
 * Maximum number of accounts accepted per request by the workspace query API.
 */
export const workspaceAccountsRequestLimit = 100;

/**
 * Maximum page size accepted by the workspace query API. A bigger value is rejected with a 400.
 */
export const workspaceQueryPageSizeLimit = 50;

/**
 * Pagination of a workspace query request.
 *
 * It is declared as query parameters so that the infinite queries of this service behave like every other list of
 * the app and can be driven by {@link AragonBackendService.getNextPageParams}. The endpoints actually take it in
 * the request body and reject query-string parameters with a 400, so the service moves it there before requesting.
 *
 * Only the sort key of the endpoint being called is accepted, hence the type parameter.
 */
export interface IWorkspaceQueryPagination<TSort extends string = string>
    extends IPaginatedRequest,
        IOrderedRequest,
        ISearchedRequest {
    /**
     * Property to order the results by.
     */
    sort?: TSort;
}

/**
 * Response of the paginated workspace query endpoints.
 */
export interface IWorkspaceQueryResponse<TData>
    extends IPaginatedResponse<TData> {
    /**
     * Per-account report of whether each source could be read. An empty `data` only means "nothing to show" when
     * every entry here is available.
     */
    coverage: IWorkspaceCoverage[];
    /**
     * True when any coverage entry is not available.
     */
    partial: boolean;
}

export interface IGetWorkspaceAccountsBody {
    /**
     * Accounts to resolve. Duplicates are removed and addresses are checksummed by the backend, so the response may
     * be shorter than the request and in a different order — match entries by network and address, never by index.
     */
    accounts: IWorkspaceAccountRef[];
}

export interface IGetWorkspaceAccountsParams
    extends IRequestBodyParams<IGetWorkspaceAccountsBody> {}

/**
 * Includes the rows of tokens flagged as spam, which are hidden by default.
 *
 */
export interface IWorkspaceAssetListFilters {
    /**
     * Keeps only the accounts on this network for the request. The other accounts drop out of the data and of the
     * coverage.
     */
    network?: Network;
    /**
     * Keeps only this token. Requires `network`, since the same address is a different token on another chain.
     */
    tokenAddress?: string;
    /**
     * Includes spam-flagged tokens in the rows and in the total.
     * @default false
     */
    includeSpam?: boolean;
}

export interface IGetWorkspaceAssetListBody {
    /**
     * Accounts to aggregate. Max 100; duplicates are removed and addresses checksummed by the backend.
     */
    accounts: IWorkspaceAccountRef[];
    /**
     * Filters narrowing the rows inside the selected accounts. They can never add accounts.
     */
    filters?: IWorkspaceAssetListFilters;
    /**
     * Page to read.
     */
    pagination?: IWorkspaceQueryPagination;
}

/**
 * Filters of the transactions request. They narrow the rows within the selected accounts and can never add an
 * account: `network` keeps only the accounts on that network and drops the others from the data and the coverage.
 */
export interface IGetWorkspaceTransactionsFilters {
    /**
     * Keeps only the accounts on this network.
     */
    network?: Network;
    /**
     * Token of the transfers. Requires `network`, as the same address is a different token on another chain.
     */
    tokenAddress?: string;
    /**
     * Sender of the transfers.
     */
    fromAddress?: string;
    /**
     * Receiver of the transfers.
     */
    toAddress?: string;
    /**
     * Direction of the transfers from the point of view of the account.
     */
    side?: TransactionSide;
    /**
     * Kind of rows to return.
     */
    type?: WorkspaceTransactionType;
}

export interface IGetWorkspaceAssetListParams
    extends IRequestBodyParams<IGetWorkspaceAssetListBody> {}

export interface IGetWorkspaceTransactionsBody {
    /**
     * Accounts to aggregate the transactions of, max {@link workspaceAccountsRequestLimit} entries. An empty list
     * is valid and returns an empty result.
     */
    accounts: IWorkspaceAccountRef[];
    /**
     * Filters narrowing the rows within the selected accounts.
     */
    filters?: IGetWorkspaceTransactionsFilters;
}

export type WorkspaceTransactionsSort = 'blockTimestamp';

export interface IGetWorkspaceTransactionsParams
    extends IRequestQueryBodyParams<
        IWorkspaceQueryPagination<WorkspaceTransactionsSort>,
        IGetWorkspaceTransactionsBody
    > {}
