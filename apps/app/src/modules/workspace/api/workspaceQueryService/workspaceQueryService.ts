import {
    AragonBackendService,
    type IPaginatedResponseMetadata,
} from '@/shared/api/aragonBackendService';

import { apiVersionUtils } from '@/shared/utils/apiVersionUtils';

import type {
    IWorkspaceAccountInfo,
    IWorkspaceAssetListResponse,
    IWorkspaceTransaction,
} from './domain';

import type {
    IGetWorkspaceAccountsParams,
    IGetWorkspaceAssetListParams,
    IGetWorkspaceTransactionsParams,
    IWorkspaceQueryResponse,
} from './workspaceQueryService.api';

/**
 * Workspace query API.
 *
 * Every endpoint takes the account selection in the request body instead of the URL, therefore they are POST
 * requests that only read data. They are only available on v2, so the version is forced.
 */
class WorkspaceQueryService extends AragonBackendService {
    private basePaths = {
        accounts: '/workspaces/query/accounts',
        transactions: '/workspaces/query/transactions',
        assetList: '/workspaces/query/assets',
    };

    private get urls() {
        return {
            accounts: apiVersionUtils.buildVersionedUrl(
                this.basePaths.accounts,
                { forceVersion: 'v2' },
            ),
            assetList: apiVersionUtils.buildVersionedUrl(
                this.basePaths.assetList,
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

    /**
     * Reads the token balances of the given accounts, grouped by network and token.
     */
    getAssetList = async (
        params: IGetWorkspaceAssetListParams,
    ): Promise<IWorkspaceAssetListResponse> =>
        await this.request<IWorkspaceAssetListResponse>(
            this.urls.assetList,
            params,
            { method: 'POST' },
        );

    /**
     * Returns the parameters of the next page of a workspace list endpoint, or undefined on the last one.
     *
     * The inherited `getNextPageParams` cannot be used: it increments `queryParams.page`, while every workspace
     * endpoint carries its pagination in the request body.
     */
    getNextBodyPageParams = <
        TResponse extends { metadata: IPaginatedResponseMetadata },
        TParams extends { body: { pagination?: { page?: number } } },
    >(
        lastPage: TResponse | null,
        _allPages: TResponse[],
        previousParams: TParams,
    ): TParams | undefined => {
        const metadata = lastPage?.metadata;

        if (metadata == null) {
            return;
        }

        const { page, totalPages } = metadata;

        if (page >= totalPages) {
            return;
        }

        return {
            ...previousParams,
            body: {
                ...previousParams.body,
                pagination: {
                    ...previousParams.body.pagination,
                    page: page + 1,
                },
            },
        };
    };
}

export const workspaceQueryService = new WorkspaceQueryService();
