// biome-ignore-all lint/suspicious/useAwait: async keeps the service contract of a real backend over the sync storage.
import { addressUtils } from '@aragon/gov-ui-kit';
import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import { networkUtils } from '@/shared/utils/networkUtils';
import { workspaceUtils } from '../../utils/workspaceUtils';
import {
    type IWorkspace,
    type IWorkspaceAccount,
    type IWorkspaceAccountMetadata,
    type IWorkspaceTarget,
    WorkspaceAccountType,
} from './domain';
import type {
    IAddWorkspaceAccountParams,
    ICreateWorkspaceParams,
    IGetWorkspaceParams,
    IUpdateWorkspaceParams,
} from './workspaceService.api';

/**
 * Persistent registry key for workspaces created through the normal app flow.
 */
export const workspaceStorageKey = 'aragon-workspaces';

const sessionWorkspaceStorageKey = 'aragon-session-workspaces';

/**
 * Name of the workspace seeded on an empty registry. Stored data the user can rename, so not translated.
 */
export const defaultWorkspaceName = 'My workspace';

type WorkspaceRegistry = Record<string, IWorkspace>;

const isOptionalString = (value: unknown) =>
    value == null || typeof value === 'string';

const isWorkspaceAccountMetadata = (
    value: unknown,
): value is IWorkspaceAccountMetadata => {
    if (value == null || typeof value !== 'object' || Array.isArray(value)) {
        return false;
    }

    const metadata = value as Partial<IWorkspaceAccountMetadata>;

    return (
        typeof metadata.name === 'string' &&
        isOptionalString(metadata.description) &&
        isOptionalString(metadata.avatar)
    );
};

const isWorkspaceAccount = (value: unknown): value is IWorkspaceAccount => {
    if (value == null || typeof value !== 'object' || Array.isArray(value)) {
        return false;
    }

    const account = value as Partial<IWorkspaceAccount>;

    return (
        typeof account.id === 'string' &&
        Object.values(WorkspaceAccountType).includes(
            account.type as WorkspaceAccountType,
        ) &&
        typeof account.network === 'string' &&
        networkUtils.isValidNetwork(account.network) &&
        typeof account.address === 'string' &&
        addressUtils.isAddress(account.address) &&
        account.id ===
            workspaceUtils.buildAccountId({
                network: account.network,
                address: account.address,
            }) &&
        (account.metadata == null ||
            isWorkspaceAccountMetadata(account.metadata))
    );
};

const isWorkspaceTarget = (value: unknown): value is IWorkspaceTarget => {
    if (value == null || typeof value !== 'object' || Array.isArray(value)) {
        return false;
    }

    const target = value as Partial<IWorkspaceTarget>;

    return (
        typeof target.network === 'string' &&
        networkUtils.isValidNetwork(target.network) &&
        typeof target.address === 'string' &&
        addressUtils.isAddress(target.address)
    );
};

const isWorkspace = (id: string, value: unknown): value is IWorkspace => {
    if (value == null || typeof value !== 'object' || Array.isArray(value)) {
        return false;
    }

    const workspace = value as Partial<IWorkspace>;

    return (
        workspace.id === id &&
        typeof workspace.name === 'string' &&
        typeof workspace.description === 'string' &&
        (workspace.avatar == null || typeof workspace.avatar === 'string') &&
        Array.isArray(workspace.links) &&
        workspace.links.every((value) => {
            const link = value as Partial<(typeof workspace.links)[number]>;

            return (
                typeof link.name === 'string' &&
                typeof link.url === 'string' &&
                URL.canParse(link.url) &&
                ['http:', 'https:'].includes(new URL(link.url).protocol)
            );
        }) &&
        Array.isArray(workspace.accounts) &&
        workspace.accounts.every(isWorkspaceAccount) &&
        Array.isArray(workspace.targets) &&
        workspace.targets.every(isWorkspaceTarget)
    );
};

const parseWorkspaceRegistry = (rawRegistry: string): WorkspaceRegistry => {
    let parsed: unknown;

    try {
        parsed = JSON.parse(rawRegistry);
    } catch (error) {
        throw new Error('The selected file is not valid JSON.', {
            cause: error,
        });
    }

    if (
        parsed == null ||
        typeof parsed !== 'object' ||
        Array.isArray(parsed) ||
        !Object.entries(parsed).every(([id, workspace]) =>
            isWorkspace(id, workspace),
        )
    ) {
        throw new Error('The selected file is not a valid workspace registry.');
    }

    return parsed as WorkspaceRegistry;
};
/**
 * Workspace API.
 *
 * There is no workspace endpoint on the backend yet, so this service resolves workspaces from the route's browser
 * registry: persistent local storage, or a tab-scoped registry when the current workspace belongs to the fixture.
 * It is intentionally shaped like the other services (async, throws the same error type) so that swapping browser
 * storage for a real request is a single-method change and no consumer needs to be touched.
 *
 * Browser storage is only available on the client, therefore every method rejects when called on the server. This is
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
     * Returns the first workspace, seeding and persisting the default one when the active registry is empty.
     *
     * @throws {AragonBackendServiceError} `workspaceStorageError` when browser storage rejects the write.
     */
    getOrCreateDefaultWorkspace = async (): Promise<IWorkspace> => {
        const workspaces = this.getStoredWorkspaces();
        const firstWorkspace = Object.values(workspaces)[0];

        if (firstWorkspace != null) {
            return firstWorkspace;
        }

        const defaultWorkspace = this.buildDefaultWorkspace();
        this.persistWorkspaces({
            ...workspaces,
            [defaultWorkspace.id]: defaultWorkspace,
        });

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
     * Appends an account to a stored workspace, reading and writing the registry in one step rather than taking the
     * whole workspace from the caller, so a change stored since the caller read it (e.g. from another tab) is kept.
     * An account the workspace already holds is not added twice.
     *
     * @throws {AragonBackendServiceError} `notFoundCode` when the workspace is not stored, `workspaceStorageError`
     * when local storage rejects to write.
     */
    addWorkspaceAccount = async (
        params: IAddWorkspaceAccountParams,
    ): Promise<IWorkspace> => {
        const { urlParams, body } = params;
        const { id } = urlParams;
        const { account } = body;

        const workspaces = this.getStoredWorkspaces();
        const storedWorkspace = workspaces[id];

        if (storedWorkspace == null) {
            throw this.buildNotFoundError(id);
        }

        const isHeld = storedWorkspace.accounts.some((storedAccount) =>
            workspaceUtils.isSameNetworkAddress(storedAccount, account),
        );

        if (isHeld) {
            return storedWorkspace;
        }

        const workspace: IWorkspace = {
            ...storedWorkspace,
            accounts: [...storedWorkspace.accounts, account],
        };

        this.persistWorkspaces({ ...workspaces, [id]: workspace });

        return workspace;
    };

    exportWorkspaceRegistry = async (): Promise<string> =>
        JSON.stringify(this.getStoredWorkspaces(), null, 2);

    importWorkspaceRegistry = async (
        rawRegistry: string,
        merge = false,
    ): Promise<IWorkspace[]> => {
        const imported = parseWorkspaceRegistry(rawRegistry);
        const workspaces = merge
            ? { ...this.getStoredWorkspaces(), ...imported }
            : imported;

        this.persistWorkspaces(workspaces);

        return Object.values(workspaces);
    };
    activateSessionWorkspaceRegistry = async (
        rawRegistry: string,
    ): Promise<void> => {
        const registry = parseWorkspaceRegistry(rawRegistry);
        this.requireWindow();

        try {
            sessionStorage.setItem(
                sessionWorkspaceStorageKey,
                JSON.stringify(registry),
            );
        } catch (error: unknown) {
            throw this.buildStorageError(error);
        }
    };

    hasSessionWorkspace = (id: string): boolean => {
        this.requireWindow();
        const rawRegistry = sessionStorage.getItem(sessionWorkspaceStorageKey);

        if (rawRegistry == null) {
            return false;
        }

        try {
            const registry = JSON.parse(rawRegistry) as WorkspaceRegistry;

            return Object.hasOwn(registry, id);
        } catch {
            return false;
        }
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
     * Returns the workspaces from the active browser registry, ignoring corrupted JSON.
     */
    private getStoredWorkspaces = (): Record<string, IWorkspace> => {
        const { storage, key } = this.getActiveStorage();
        const rawWorkspaces = storage.getItem(key);

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
     * Persists the given workspaces in the active browser registry, replacing the stored ones.
     * @param workspaces - Every workspace of the registry.
     * @throws {AragonBackendServiceError} `workspaceStorageError` when browser storage rejects the write.
     */
    private persistWorkspaces = (workspaces: Record<string, IWorkspace>) => {
        const { storage, key } = this.getActiveStorage();

        try {
            storage.setItem(key, JSON.stringify(workspaces));
        } catch (error: unknown) {
            throw this.buildStorageError(error);
        }
    };

    private getActiveStorage = (): { storage: Storage; key: string } => {
        this.requireWindow();

        const workspaceId =
            window.location.pathname.split('/')[1] === 'workspace'
                ? window.location.pathname.split('/')[2]
                : undefined;
        const rawSessionRegistry = sessionStorage.getItem(
            sessionWorkspaceStorageKey,
        );

        if (workspaceId != null && rawSessionRegistry != null) {
            try {
                const sessionRegistry = JSON.parse(
                    rawSessionRegistry,
                ) as WorkspaceRegistry;

                if (Object.hasOwn(sessionRegistry, workspaceId)) {
                    return {
                        storage: sessionStorage,
                        key: sessionWorkspaceStorageKey,
                    };
                }
            } catch {
                // A malformed session fixture is disposable.
            }
        }

        sessionStorage.removeItem(sessionWorkspaceStorageKey);
        return { storage: localStorage, key: workspaceStorageKey };
    };

    private requireWindow = () => {
        if (typeof window === 'undefined') {
            throw new AragonBackendServiceError(
                'workspaceStorageUnavailable',
                'The workspace registry is only available on the client.',
                500,
            );
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
