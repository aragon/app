import { AragonBackendService } from '@/shared/api/aragonBackendService';
import type { IWorkspace, IWorkspaceBase, IWorkspaceDetails } from './domain';
import type {
    ICreateWorkspaceParams,
    IGetWorkspaceParams,
    IGetWorkspacesParams,
} from './workspaceService.api';

/**
 * Upper bounds enforced by the workspace service on creation.
 */
export const workspaceMaxTargets = 50;
export const workspaceMaxAccounts = 50;
export const workspaceMaxNameLength = 120;

class WorkspaceService extends AragonBackendService {
    // The workspace endpoints are served by the backend next to the versioned ones, so they have no
    // /v2 prefix.
    private urls = {
        workspaces: '/workspace',
        workspace: '/workspace/:workspaceId',
    };

    /**
     * Creates the workspace and returns it before the scan runs: the service answers 202 and scans
     * the targets in the background, so the client polls the workspace until it settles.
     */
    createWorkspace = async (
        params: ICreateWorkspaceParams,
    ): Promise<IWorkspaceBase> => {
        const result = await this.request<IWorkspaceBase>(
            this.urls.workspaces,
            params,
            { method: 'POST' },
        );

        return result;
    };

    getWorkspaces = async ({
        queryParams,
    }: IGetWorkspacesParams): Promise<IWorkspace[]> => {
        const result = await this.request<IWorkspace[]>(this.urls.workspaces, {
            queryParams,
        });

        return result;
    };

    getWorkspace = async (
        params: IGetWorkspaceParams,
    ): Promise<IWorkspaceDetails> => {
        const result = await this.request<IWorkspaceDetails>(
            this.urls.workspace,
            params,
        );

        return result;
    };
}

export const workspaceService = new WorkspaceService();
