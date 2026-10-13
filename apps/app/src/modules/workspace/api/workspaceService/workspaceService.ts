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
 * Name of the workspace seeded on an empty registry. It is stored data the user can rename, not UI copy, so it is
 * not translated.
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
 *
 * The registry always holds at least one workspace: the reads seed a default one when it is empty, so that every
 * consumer has a workspace to fall back to.
 */
// TODO: rewrite the methods of this service as standard async functions (`async`, `throw`, `return`) instead of
// wrapping results in `Promise.resolve` / `Promise.reject`, to be consistent with the other services of the repo.
class WorkspaceService {
    getWorkspace = (params: IGetWorkspaceParams): Promise<IWorkspace> => {
        const { id } = params.urlParams;

        let workspaces: Record<string, IWorkspace>;

        try {
            workspaces = this.getStoredWorkspacesOrDefault();
        } catch (error: unknown) {
            return Promise.reject(error);
        }

        const workspace = workspaces[id];

        if (workspace == null) {
            return Promise.reject(this.buildNotFoundError(id));
        }

        return Promise.resolve(workspace);
    };

    getWorkspaceList = (): Promise<IWorkspace[]> => {
        try {
            return Promise.resolve(
                Object.values(this.getStoredWorkspacesOrDefault()),
            );
        } catch (error: unknown) {
            return Promise.reject(error);
        }
    };

    createWorkspace = (params: ICreateWorkspaceParams): Promise<IWorkspace> => {
        const { body } = params;

        try {
            const workspaces = this.getStoredWorkspaces();
            const id = workspaceUtils.buildWorkspaceId(
                body.name,
                Object.keys(workspaces),
            );
            const workspace: IWorkspace = { ...body, id };

            const persistError = this.persistWorkspaces(
                { ...workspaces, [id]: workspace },
                id,
            );

            return persistError != null
                ? Promise.reject(persistError)
                : Promise.resolve(workspace);
        } catch (error: unknown) {
            return Promise.reject(error);
        }
    };

    updateWorkspace = (params: IUpdateWorkspaceParams): Promise<IWorkspace> => {
        const { urlParams, body } = params;
        const { id } = urlParams;

        try {
            const workspaces = this.getStoredWorkspaces();
            const currentWorkspace = workspaces[id];

            if (currentWorkspace == null) {
                return Promise.reject(this.buildNotFoundError(id));
            }

            // The owner is not editable, so the one of a workspace that carries it is kept.
            const workspace: IWorkspace = {
                ...body,
                id,
                owner: currentWorkspace.owner,
            };

            const persistError = this.persistWorkspaces(
                { ...workspaces, [id]: workspace },
                id,
            );

            return persistError != null
                ? Promise.reject(persistError)
                : Promise.resolve(workspace);
        } catch (error: unknown) {
            return Promise.reject(error);
        }
    };

    /**
     * Returns the workspaces persisted on local storage, seeding the default workspace when there is none.
     */
    private getStoredWorkspacesOrDefault = (): Record<string, IWorkspace> => {
        const workspaces = this.getStoredWorkspaces();

        if (Object.keys(workspaces).length > 0) {
            return workspaces;
        }

        const defaultWorkspace = this.buildDefaultWorkspace();
        const seededWorkspaces = { [defaultWorkspace.id]: defaultWorkspace };
        const persistError = this.persistWorkspaces(
            seededWorkspaces,
            defaultWorkspace.id,
        );

        if (persistError != null) {
            throw persistError;
        }

        return seededWorkspaces;
    };

    /**
     * Builds the workspace seeded on an empty registry: no accounts, no targets and, like every local workspace, no
     * owner.
     *
     * Its ID carries a random suffix: every user gets a default workspace, so a plain slug would be the same for all
     * of them and a link shared from one default workspace would silently open the recipient's own.
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
     * @param id - ID of the workspace being written, used for the error message.
     */
    private persistWorkspaces = (
        workspaces: Record<string, IWorkspace>,
        id: string,
    ) => {
        try {
            localStorage.setItem(
                workspaceStorageKey,
                JSON.stringify(workspaces),
            );
        } catch (error: unknown) {
            throw this.buildStorageError(id, error);
        }
    };

    // `AragonBackendServiceError` takes no `cause`, so the original error is kept in the description instead.
    private buildStorageError = (id: string, error: unknown) =>
        new AragonBackendServiceError(
            'workspaceStorageError',
            `Unable to persist the workspace (id=${id}, error=${String(error)})`,
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
