import { AragonBackendService } from '@/shared/api/aragonBackendService';
import { apiVersionUtils } from '@/shared/utils/apiVersionUtils';
import type { IWorkspaceAccountInfo } from './domain';
import type { IGetWorkspaceAccountsParams } from './workspaceQueryService.api';

/**
 * Workspace query API.
 *
 * The workspace endpoints take the account selection in the request body instead of the URL, therefore they are
 * POST requests that only read data. They are only available on v2, so the version is forced.
 */
class WorkspaceQueryService extends AragonBackendService {
    private basePaths = {
        accounts: '/workspaces/query/accounts',
    };

    private get urls() {
        return {
            accounts: apiVersionUtils.buildVersionedUrl(
                this.basePaths.accounts,
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
}

export const workspaceQueryService = new WorkspaceQueryService();
