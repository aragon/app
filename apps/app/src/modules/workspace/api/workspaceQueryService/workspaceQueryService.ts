import { AragonBackendService } from '@/shared/api/aragonBackendService';
import { apiVersionUtils } from '@/shared/utils/apiVersionUtils';
import type { IWorkspaceAccountInfo, IWorkspaceTransaction } from './domain';
import type {
    IGetWorkspaceAccountsParams,
    IGetWorkspaceTransactionsParams,
    IWorkspaceQueryResponse,
} from './workspaceQueryService.api';

/**
 * Workspace query API.
 *
 * The workspace endpoints take the account selection in the request body instead of the URL, therefore they are
 * POST requests that only read data. They are only available on v2, so the version is forced.
 */
class WorkspaceQueryService extends AragonBackendService {
    private basePaths = {
        accounts: '/workspaces/query/accounts',
        transactions: '/workspaces/query/transactions',
    };

    private get urls() {
        return {
            accounts: apiVersionUtils.buildVersionedUrl(
                this.basePaths.accounts,
                { forceVersion: 'v2' },
            ),
            transactions: apiVersionUtils.buildVersionedUrl(
                this.basePaths.transactions,
                { forceVersion: 'v2' },
            ),
        };
    }

    /**
     * Resolves what each of the given addresses is, i.e. an indexed DAO, a Safe or neither.
     */
    getAccounts = async (
        params: IGetWorkspaceAccountsParams,
    ): Promise<IWorkspaceAccountInfo[]> => {
        const { data } = await this.request<{ data: IWorkspaceAccountInfo[] }>(
            this.urls.accounts,
            params,
            { method: 'POST' },
        );

        return data;
    };

    /**
     * Fetches the deposits, withdrawals and executions of the given accounts as one list sorted by block timestamp
     * across networks. The lists are merged before being paged, so a single busy account can fill the first pages.
     */
    getTransactions = async (
        params: IGetWorkspaceTransactionsParams,
    ): Promise<IWorkspaceQueryResponse<IWorkspaceTransaction>> => {
        const { queryParams, body } = params;

        // The endpoint rejects query-string parameters with a 400 and takes the pagination in the body. Moving it
        // here is what lets the queries above declare it as query parameters like every other list of the app and
        // page through it with the inherited getNextPageParams.
        const requestParams = { body: { ...body, pagination: queryParams } };

        const result = await this.request<
            IWorkspaceQueryResponse<IWorkspaceTransaction>
        >(this.urls.transactions, requestParams, { method: 'POST' });

        return result;
    };
}

export const workspaceQueryService = new WorkspaceQueryService();
