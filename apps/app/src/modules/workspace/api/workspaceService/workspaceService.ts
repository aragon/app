// biome-ignore-all lint/suspicious/useAwait: async keeps the service contract of a real backend over the sync storage.
import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import { workspaceUtils } from '../../utils/workspaceUtils';
import type { IWorkspace } from './domain';
import type {
    ICreateWorkspaceParams,
    IGetWorkspaceParams,
    IUpdateWorkspaceParams,
} from './workspaceService.api';

/**
 * Local-storage key holding the workspaces created through the app, keyed by workspace ID.
 */
export const workspaceStorageKey = 'aragon-workspaces';

/**
 * Name of the workspace seeded on an empty registry. Stored data the user can rename, so not translated.
 */
export const defaultWorkspaceName = 'My workspace';

/**
 * Workspace API.
 *
 * There is no workspace endpoint on the backend yet, so this service resolves workspaces from the ones persisted on
 * local storage. It is intentionally shaped like the other services (async, throws the same error type) so that
 * swapping local storage for a real request is a single-method change and no consumer needs to be touched.
 *
 * Local storage is only available on the client, therefore every method rejects when called on the server. This is
 * why the workspace pages must not prefetch workspaces (see `docs/projectDocs/createWorkspace.md`).
 */
class WorkspaceService {
    getWorkspace = async (params: IGetWorkspaceParams): Promise<IWorkspace> => {
        const { id } = params.urlParams;

        const workspace = this.getStoredWorkspaces()[id];

        if (workspace == null) {
            throw this.buildNotFoundError(id);
        }

        return workspace;
    };

    getWorkspaceList = async (): Promise<IWorkspace[]> =>
        Object.values(this.getStoredWorkspaces());

    /**
     * Returns the first stored workspace, seeding and persisting the default one when the registry is empty.
     *
     * @throws {AragonBackendServiceError} `workspaceStorageError` when local storage rejects to write.
     */
    getOrCreateDefaultWorkspace = async (): Promise<IWorkspace> => {
        const [firstWorkspace] = Object.values(this.getStoredWorkspaces());

        if (firstWorkspace != null) {
            return firstWorkspace;
        }

        const defaultWorkspace = this.buildDefaultWorkspace();
        this.persistWorkspaces({ [defaultWorkspace.id]: defaultWorkspace });

        return defaultWorkspace;
    };

    createWorkspace = async (
        params: ICreateWorkspaceParams,
    ): Promise<IWorkspace> => {
        const { body } = params;

        const workspaces = this.getStoredWorkspaces();
        const id = workspaceUtils.buildWorkspaceId(
            body.name,
            Object.keys(workspaces),
        );
        const workspace: IWorkspace = { ...body, id };

        this.persistWorkspaces({ ...workspaces, [id]: workspace });

        return workspace;
    };

    updateWorkspace = async (
        params: IUpdateWorkspaceParams,
    ): Promise<IWorkspace> => {
        const { urlParams, body } = params;
        const { id } = urlParams;

        const workspaces = this.getStoredWorkspaces();

        if (workspaces[id] == null) {
            throw this.buildNotFoundError(id);
        }

        const workspace: IWorkspace = { ...body, id };

        this.persistWorkspaces({ ...workspaces, [id]: workspace });

        return workspace;
    };

    /**
     * Builds the workspace seeded on an empty registry. Its ID gets a random suffix so default workspaces of
     * different users never share one.
     */
    private buildDefaultWorkspace = (): IWorkspace => ({
        id: `${workspaceUtils.slugify(defaultWorkspaceName)}-${crypto.randomUUID().slice(0, 8)}`,
        name: defaultWorkspaceName,
        description: '',
        avatar: null,
        links: [],
        accounts: [],
        targets: [],
    });

    /**
     * Returns the workspaces persisted on local storage, ignoring corrupted entries.
     */
    private getStoredWorkspaces = (): Record<string, IWorkspace> => {
        if (typeof window === 'undefined') {
            throw new AragonBackendServiceError(
                'workspaceStorageUnavailable',
                'The workspace registry is only available on the client.',
                500,
            );
        }

        const rawWorkspaces = localStorage.getItem(workspaceStorageKey);

        if (rawWorkspaces == null) {
            return {};
        }

        try {
            return JSON.parse(rawWorkspaces) as Record<string, IWorkspace>;
        } catch {
            return {};
        }
    };

    /**
     * Persists the given workspaces on local storage, replacing the stored ones.
     * @param workspaces - Every workspace of the registry.
     * @throws {AragonBackendServiceError} `workspaceStorageError` when local storage rejects the write.
     */
    private persistWorkspaces = (workspaces: Record<string, IWorkspace>) => {
        try {
            localStorage.setItem(
                workspaceStorageKey,
                JSON.stringify(workspaces),
            );
        } catch (error: unknown) {
            throw this.buildStorageError(error);
        }
    };

    // `AragonBackendServiceError` takes no `cause`, so the original error is kept in the description instead.
    private buildStorageError = (error: unknown) =>
        new AragonBackendServiceError(
            'workspaceStorageError',
            `Unable to persist the workspace registry (error=${String(error)})`,
            500,
        );

    private buildNotFoundError = (id: string) =>
        new AragonBackendServiceError(
            AragonBackendServiceError.notFoundCode,
            `Workspace not found (id=${id})`,
            404,
        );
}

export const workspaceService = new WorkspaceService();
