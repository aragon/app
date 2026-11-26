// biome-ignore-all lint/suspicious/useAwait: async keeps the service contract of a real backend over the sync storage.
import { addressUtils } from '@aragon/gov-ui-kit';
import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import type { IResource } from '@/shared/api/daoService';
import { networkUtils } from '@/shared/utils/networkUtils';
import workspaceDemoFixture from '../../fixtures/workspaceDemo.fixture.json';
import { workspaceAliasUtils } from '../../utils/workspaceAliasUtils';
import { workspaceUtils } from '../../utils/workspaceUtils';
import {
    type IWorkspace,
    type IWorkspaceAccount,
    type IWorkspaceAccountMetadata,
    type IWorkspaceAlias,
    type IWorkspaceTarget,
    WorkspaceAccountType,
    WorkspaceRegistryScope,
} from './domain';
import type {
    IAddWorkspaceAccountParams,
    ICreateWorkspaceParams,
    IGetWorkspaceParams,
    IRemoveWorkspaceAccountParams,
    IRemoveWorkspaceAliasParams,
    IUpdateWorkspaceDetailsParams,
    IUpsertWorkspaceAliasParams,
    IWorkspaceExport,
} from './workspaceService.api';

/**
 * Persistent registry key for workspaces created through the normal app flow.
 */
export const workspaceStorageKey = 'aragon-workspaces';

const sessionWorkspaceStorageKey = 'aragon-session-workspaces';

/**
 * Name of the default workspace. Stored data the user can rename, so not translated.
 */
export const defaultWorkspaceName = 'My workspace';

type WorkspaceRegistry = Record<string, IWorkspace>;

interface IWorkspaceStorage {
    storage: Storage;
    key: string;
}

/**
 * Version of the single-workspace export format, bumped on breaking changes to it. Version 2 carries the aliases of
 * the workspace; version 1 files still import, with an empty address book.
 */
const workspaceExportVersion = 2;

/**
 * Limits of an imported file, so a hostile file cannot fill the browser storage.
 */
const maxImportFileBytes = 1_000_000;
const maxWorkspacesPerFile = 100;
const maxAliasesPerFile = 5000;

// Keys that would change the prototype of a registry built from a file.
const reservedWorkspaceIds = ['__proto__', 'constructor', 'prototype'];

const requireFileWithinLimit = (rawFile: string) => {
    // Checked before parsing: parsing is what a large file would make expensive.
    if (new Blob([rawFile]).size > maxImportFileBytes) {
        throw new Error('The selected file is too large (1 MB at most).');
    }
};

/**
 * Whether a record holds no key other than the known ones. A file is rebuilt from known fields only, so a field the app
 * does not know is a reason to reject it, never something stored and exported again.
 */
const hasOnlyKeys = (value: object, keys: readonly string[]) =>
    Object.keys(value).every((key) => keys.includes(key));

const linkKeys = ['name', 'url'];
const accountMetadataKeys = ['name', 'description', 'avatar', 'links'];
const accountKeys = ['id', 'type', 'address', 'network', 'metadata'];
const targetKeys = ['address', 'network'];
const workspaceKeys = [
    'id',
    'name',
    'description',
    'avatar',
    'links',
    'accounts',
    'targets',
    'aliases',
];

const pickLink = (link: IResource): IResource => ({
    name: link.name,
    url: link.url,
});

const pickAccount = (account: IWorkspaceAccount): IWorkspaceAccount => {
    const { id, type, address, network, metadata } = account;

    return {
        id,
        type,
        address,
        network,
        ...(metadata != null && {
            metadata: {
                name: metadata.name,
                ...(metadata.description != null && {
                    description: metadata.description,
                }),
                ...(metadata.avatar != null && { avatar: metadata.avatar }),
                ...(metadata.links != null && {
                    links: metadata.links.map(pickLink),
                }),
            },
        }),
    };
};

/**
 * Copies the known fields of a stored workspace, so a field the app does not know is never exported.
 */
const pickWorkspaceFields = (
    workspace: IWorkspace,
): Omit<IWorkspace, 'id'> => ({
    name: workspace.name,
    description: workspace.description,
    avatar: workspace.avatar,
    links: workspace.links.map((link) => ({
        ...pickLink(link),
        url: workspaceUtils.ensureUrlProtocol(link.url),
    })),
    accounts: workspace.accounts.map(pickAccount),
    targets: workspace.targets.map(({ address, network }) => ({
        address,
        network,
    })),
    aliases: (workspace.aliases ?? []).map(
        ({ address, name, network, updatedAt }) => ({
            address,
            name,
            network,
            updatedAt,
        }),
    ),
});

const isOptionalString = (value: unknown) =>
    value == null || typeof value === 'string';

const isWorkspaceLink = (value: unknown): value is IResource => {
    if (value == null || typeof value !== 'object') {
        return false;
    }

    const link = value as Partial<IResource>;

    return (
        hasOnlyKeys(link, linkKeys) &&
        typeof link.name === 'string' &&
        typeof link.url === 'string' &&
        URL.canParse(link.url) &&
        ['http:', 'https:'].includes(new URL(link.url).protocol)
    );
};

const isWorkspaceAccountMetadata = (
    value: unknown,
): value is IWorkspaceAccountMetadata => {
    if (value == null || typeof value !== 'object' || Array.isArray(value)) {
        return false;
    }

    const metadata = value as Partial<IWorkspaceAccountMetadata>;

    return (
        hasOnlyKeys(metadata, accountMetadataKeys) &&
        typeof metadata.name === 'string' &&
        isOptionalString(metadata.description) &&
        isOptionalString(metadata.avatar) &&
        (metadata.links == null ||
            (Array.isArray(metadata.links) &&
                metadata.links.every(isWorkspaceLink)))
    );
};

const isWorkspaceAccount = (value: unknown): value is IWorkspaceAccount => {
    if (value == null || typeof value !== 'object' || Array.isArray(value)) {
        return false;
    }

    const account = value as Partial<IWorkspaceAccount>;

    return (
        hasOnlyKeys(account, accountKeys) &&
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
        hasOnlyKeys(target, targetKeys) &&
        typeof target.network === 'string' &&
        networkUtils.isValidNetwork(target.network) &&
        typeof target.address === 'string' &&
        addressUtils.isAddress(target.address)
    );
};

const isWorkspaceBody = (value: unknown): value is Omit<IWorkspace, 'id'> => {
    if (value == null || typeof value !== 'object' || Array.isArray(value)) {
        return false;
    }

    const workspace = value as Partial<IWorkspace>;

    return (
        hasOnlyKeys(workspace, workspaceKeys) &&
        typeof workspace.name === 'string' &&
        typeof workspace.description === 'string' &&
        (workspace.avatar == null || typeof workspace.avatar === 'string') &&
        Array.isArray(workspace.links) &&
        workspace.links.every(isWorkspaceLink) &&
        Array.isArray(workspace.accounts) &&
        workspace.accounts.every(isWorkspaceAccount) &&
        Array.isArray(workspace.targets) &&
        workspace.targets.every(isWorkspaceTarget)
    );
};

const isWorkspace = (id: string, value: unknown): value is IWorkspace =>
    isWorkspaceBody(value) && (value as Partial<IWorkspace>).id === id;

const parseWorkspaceExport = (rawExport: string): Omit<IWorkspace, 'id'> => {
    requireFileWithinLimit(rawExport);
    let parsed: unknown;

    try {
        parsed = JSON.parse(rawExport);
    } catch (error) {
        throw new Error('The selected file is not valid JSON.', {
            cause: error,
        });
    }

    const workspaceExport = parsed as Partial<IWorkspaceExport> | null;

    if (
        (workspaceExport?.version !== workspaceExportVersion &&
            workspaceExport?.version !== 1) ||
        !isWorkspaceBody(workspaceExport.workspace)
    ) {
        throw new Error('The selected file is not a valid workspace export.');
    }

    const { id: _id, ...workspace } = workspaceExport.workspace as IWorkspace;
    // Version 1 files have no address book.
    const aliases =
        workspaceExport.version === 1
            ? []
            : workspaceAliasUtils.parse(workspace.aliases ?? [], Date.now());

    return { ...workspace, aliases };
};

/**
 * Adds a protocol to the links of a stored workspace, the same repair the single-workspace export does. Done on the
 * way in rather than on export, so registries downloaded before it stay importable and the export shape is unchanged.
 */
const normaliseWorkspaceLinks = (value: unknown): unknown => {
    if (value == null || typeof value !== 'object' || Array.isArray(value)) {
        return value;
    }

    const workspace = value as { links?: unknown };
    if (!Array.isArray(workspace.links)) {
        return value;
    }

    return {
        ...workspace,
        links: workspace.links.map((link) => {
            if (link == null || typeof link !== 'object') {
                return link;
            }

            const { url } = link as { url?: unknown };
            if (typeof url !== 'string') {
                return link;
            }

            return { ...link, url: workspaceUtils.ensureUrlProtocol(url) };
        }),
    };
};

const parseWorkspaceRegistry = (rawRegistry: string): WorkspaceRegistry => {
    requireFileWithinLimit(rawRegistry);
    let parsed: unknown;

    try {
        parsed = JSON.parse(rawRegistry);
    } catch (error) {
        throw new Error('The selected file is not valid JSON.', {
            cause: error,
        });
    }

    if (parsed == null || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('The selected file is not a valid workspace registry.');
    }

    const ids = Object.keys(parsed);

    if (
        ids.length > maxWorkspacesPerFile ||
        ids.some((id) => reservedWorkspaceIds.includes(id))
    ) {
        throw new Error('The selected file is not a valid workspace registry.');
    }

    const normalised = Object.fromEntries(
        Object.entries(parsed).map(([id, workspace]) => [
            id,
            normaliseWorkspaceLinks(workspace),
        ]),
    );

    if (
        !Object.entries(normalised).every(([id, workspace]) =>
            isWorkspace(id, workspace),
        )
    ) {
        throw new Error('The selected file is not a valid workspace registry.');
    }

    const registry = normalised as WorkspaceRegistry;
    const importedAt = Date.now();
    let aliasCount = 0;

    for (const workspace of Object.values(registry)) {
        if (workspace.aliases != null) {
            workspace.aliases = workspaceAliasUtils.parse(
                workspace.aliases,
                importedAt,
            );
            aliasCount += workspace.aliases.length;
        }
    }

    if (aliasCount > maxAliasesPerFile) {
        throw new Error(
            `The selected file holds more than ${maxAliasesPerFile} aliases.`,
        );
    }

    return registry;
};
/**
 * Workspace API.
 *
 * There is no workspace endpoint on the backend yet, so this service resolves workspaces from a browser registry:
 * persistent local storage, or a tab-scoped registry holding the demo workspaces. A workspace's registry follows from
 * its ID (see `workspaceUtils.getRegistryScope`), the list takes it from the caller, and new workspaces are always
 * persisted. The route is never read here, so a query key built from the same scope always matches what is read.
 * It is intentionally shaped like the other services (async, throws the same error type) so that swapping browser
 * storage for a real request is a single-method change and no consumer needs to be touched.
 *
 * Browser storage is only available on the client, therefore every method rejects when called on the server. This is
 * why the workspace pages must not prefetch workspaces (see `docs/projectDocs/createWorkspace.md`).
 */
class WorkspaceService {
    getWorkspace = async (params: IGetWorkspaceParams): Promise<IWorkspace> => {
        const { id } = params.urlParams;

        const workspace = this.getStoredWorkspaces(
            this.getWorkspaceStorage(id),
        )[id];

        if (workspace == null) {
            throw this.buildNotFoundError(id);
        }

        return workspace;
    };

    getWorkspaceList = async (
        scope: WorkspaceRegistryScope,
    ): Promise<IWorkspace[]> =>
        Object.values(this.getStoredWorkspaces(this.getStorage(scope)));

    /**
     * Persists the default workspace with the given accounts next to the stored ones.
     *
     * @throws {AragonBackendServiceError} `workspaceStorageError` when browser storage rejects the write.
     */
    createDefaultWorkspace = async (
        accounts: IWorkspaceAccount[],
    ): Promise<IWorkspace> => {
        const target = this.getStorage(WorkspaceRegistryScope.PERSISTENT);
        const defaultWorkspace = this.buildDefaultWorkspace(accounts);
        this.persistWorkspaces(
            {
                ...this.getStoredWorkspaces(target),
                [defaultWorkspace.id]: defaultWorkspace,
            },
            target,
        );

        return defaultWorkspace;
    };

    createWorkspace = async (
        params: ICreateWorkspaceParams,
    ): Promise<IWorkspace> => {
        const { body } = params;

        const target = this.getStorage(WorkspaceRegistryScope.PERSISTENT);
        const workspaces = this.getStoredWorkspaces(target);
        const id = workspaceUtils.buildWorkspaceId(
            body.name,
            Object.keys(workspaces),
        );
        const workspace: IWorkspace = { ...body, id };

        this.persistWorkspaces({ ...workspaces, [id]: workspace }, target);

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

        const target = this.getWorkspaceStorage(id);
        const workspaces = this.getStoredWorkspaces(target);
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

        this.persistWorkspaces({ ...workspaces, [id]: workspace }, target);

        return workspace;
    };

    /**
     * Replaces the details of a stored workspace, keeping its accounts and targets as stored.
     *
     * @throws {AragonBackendServiceError} `notFoundCode` when the workspace is not stored, `workspaceStorageError`
     * when browser storage rejects the write.
     */
    updateWorkspaceDetails = async (
        params: IUpdateWorkspaceDetailsParams,
    ): Promise<IWorkspace> => {
        const { urlParams, body } = params;
        const { id } = urlParams;

        const target = this.getWorkspaceStorage(id);
        const workspaces = this.getStoredWorkspaces(target);
        const storedWorkspace = workspaces[id];

        if (storedWorkspace == null) {
            throw this.buildNotFoundError(id);
        }

        const workspace: IWorkspace = { ...storedWorkspace, ...body, id };
        this.persistWorkspaces({ ...workspaces, [id]: workspace }, target);

        return workspace;
    };

    /**
     * Removes an account from a stored workspace. A workspace not holding the account is returned unchanged.
     *
     * @throws {AragonBackendServiceError} `notFoundCode` when the workspace is not stored, `workspaceStorageError`
     * when browser storage rejects the write.
     */
    removeWorkspaceAccount = async (
        params: IRemoveWorkspaceAccountParams,
    ): Promise<IWorkspace> => {
        const { urlParams, body } = params;
        const { id } = urlParams;

        const target = this.getWorkspaceStorage(id);
        const workspaces = this.getStoredWorkspaces(target);
        const storedWorkspace = workspaces[id];

        if (storedWorkspace == null) {
            throw this.buildNotFoundError(id);
        }

        const accounts = storedWorkspace.accounts.filter(
            (account) => account.id !== body.accountId,
        );

        if (accounts.length === storedWorkspace.accounts.length) {
            return storedWorkspace;
        }

        const workspace: IWorkspace = { ...storedWorkspace, accounts };
        this.persistWorkspaces({ ...workspaces, [id]: workspace }, target);

        return workspace;
    };

    /**
     * Saves a name for an address in a workspace, or edits the one of the same address and network. The registry is
     * read and written in one step, like the account methods.
     *
     * @throws {Error} when the address, name or network is not valid, or the workspace holds too many names.
     * @throws {AragonBackendServiceError} `notFoundCode` when the workspace is not stored, `workspaceStorageError`
     * when browser storage rejects the write (the stored registry is left as it was).
     */
    upsertWorkspaceAlias = async (
        params: IUpsertWorkspaceAliasParams,
    ): Promise<IWorkspace> => {
        const { id } = params.urlParams;

        return this.changeAliases(id, (aliases) =>
            workspaceAliasUtils.upsert(aliases, params.body, Date.now()),
        );
    };

    /**
     * Removes the name of an address and network from a workspace. A workspace without it is returned unchanged.
     *
     * @throws {AragonBackendServiceError} `notFoundCode` when the workspace is not stored, `workspaceStorageError`
     * when browser storage rejects the write.
     */
    removeWorkspaceAlias = async (
        params: IRemoveWorkspaceAliasParams,
    ): Promise<IWorkspace> => {
        const { id } = params.urlParams;

        return this.changeAliases(id, (aliases) =>
            workspaceAliasUtils.remove(aliases, params.body),
        );
    };

    /**
     * Serialises one workspace, without its ID, for `importWorkspace`.
     *
     * @throws {AragonBackendServiceError} `notFoundCode` when the workspace is not stored.
     */
    exportWorkspace = async (params: IGetWorkspaceParams): Promise<string> => {
        const workspace = await this.getWorkspace(params);
        const workspaceExport: IWorkspaceExport = {
            version: workspaceExportVersion,
            workspace: pickWorkspaceFields(workspace),
        };

        return JSON.stringify(workspaceExport, null, 2);
    };

    /**
     * Stores an exported workspace as a new workspace with its own ID, never overwriting a stored one. It always
     * lands on the persistent registry, whatever route it is imported from.
     *
     * @throws {Error} when the file is not a valid workspace export.
     * @throws {AragonBackendServiceError} `workspaceStorageError` when browser storage rejects the write.
     */
    importWorkspace = async (rawExport: string): Promise<IWorkspace> => {
        const body = parseWorkspaceExport(rawExport);
        this.requireWindow();

        const localStorageTarget = this.getPersistentStorage();
        const workspaces = this.getStoredWorkspaces(localStorageTarget);
        // A demo ID would open the demo in place of the import.
        const id = workspaceUtils.buildWorkspaceId(body.name, [
            ...Object.keys(workspaces),
            ...Object.keys(workspaceDemoFixture),
        ]);
        const workspace: IWorkspace = { ...body, id };

        this.persistWorkspaces(
            { ...workspaces, [id]: workspace },
            localStorageTarget,
        );

        return workspace;
    };

    /**
     * The registry the file formats describe: the persistent one. Unlike `getStorage`, it leaves the demo registry in
     * place, as the debug panel and the workspace import also run on demo pages.
     */
    private getPersistentStorage = (): IWorkspaceStorage => {
        this.requireWindow();

        return { storage: localStorage, key: workspaceStorageKey };
    };

    exportWorkspaceRegistry = async (): Promise<string> =>
        JSON.stringify(
            Object.fromEntries(
                Object.entries(
                    this.getStoredWorkspaces(this.getPersistentStorage()),
                ).map(([id, workspace]) => [
                    id,
                    { id, ...pickWorkspaceFields(workspace) },
                ]),
            ),
            null,
            2,
        );

    importWorkspaceRegistry = async (
        rawRegistry: string,
        merge = false,
    ): Promise<IWorkspace[]> => {
        const target = this.getPersistentStorage();
        const imported = parseWorkspaceRegistry(rawRegistry);
        // A demo ID would be listed here but read from the demo registry, so it could never be opened. Checked here
        // and not in the parser, which also loads the demo fixture.
        const demoIds = Object.keys(imported).filter(
            (id) =>
                workspaceUtils.getRegistryScope(id) ===
                WorkspaceRegistryScope.DEMO,
        );

        if (demoIds.length > 0) {
            throw new Error(
                `The registry uses reserved demo IDs: ${demoIds.join(', ')}.`,
            );
        }

        const workspaces = merge
            ? { ...this.getStoredWorkspaces(target), ...imported }
            : imported;

        this.persistWorkspaces(workspaces, target);

        return Object.values(workspaces);
    };

    /**
     * Removes the persistent registry (`aragon-workspaces`); the demo session registry is left alone.
     *
     * @throws {AragonBackendServiceError} `workspaceStorageError` when browser storage rejects the removal.
     */
    deleteWorkspaceRegistry = async (): Promise<void> => {
        this.requireWindow();

        try {
            localStorage.removeItem(workspaceStorageKey);
        } catch (error: unknown) {
            throw this.buildStorageError(error);
        }
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

    private changeAliases = (
        id: string,
        change: (aliases: IWorkspaceAlias[]) => IWorkspaceAlias[],
    ): IWorkspace => {
        const target = this.getWorkspaceStorage(id);
        const workspaces = this.getStoredWorkspaces(target);
        const storedWorkspace = workspaces[id];

        if (storedWorkspace == null) {
            throw this.buildNotFoundError(id);
        }

        const workspace: IWorkspace = {
            ...storedWorkspace,
            aliases: change(storedWorkspace.aliases ?? []),
        };
        this.persistWorkspaces({ ...workspaces, [id]: workspace }, target);

        return workspace;
    };

    /**
     * Builds the default workspace with the given accounts. Its ID gets a random suffix so default workspaces of
     * different users never share one.
     */
    private buildDefaultWorkspace = (
        accounts: IWorkspaceAccount[],
    ): IWorkspace => ({
        id: `${workspaceUtils.slugify(defaultWorkspaceName)}-${crypto.randomUUID().slice(0, 8)}`,
        name: defaultWorkspaceName,
        description: '',
        avatar: null,
        links: [],
        accounts,
        targets: [],
    });

    /**
     * Returns the workspaces from the given browser registry, ignoring corrupted JSON.
     */
    private getStoredWorkspaces = (
        target: IWorkspaceStorage,
    ): Record<string, IWorkspace> => {
        const { storage, key } = target;
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
     * Persists the given workspaces in the given browser registry, replacing the stored ones.
     * @param workspaces - Every workspace of the registry.
     * @param target - Registry to write.
     * @throws {AragonBackendServiceError} `workspaceStorageError` when browser storage rejects the write.
     */
    private persistWorkspaces = (
        workspaces: Record<string, IWorkspace>,
        target: IWorkspaceStorage,
    ) => {
        const { storage, key } = target;

        try {
            storage.setItem(key, JSON.stringify(workspaces));
        } catch (error: unknown) {
            throw this.buildStorageError(error);
        }
    };

    /**
     * Returns the browser registry of the given scope. Reaching the persistent registry means the demo was left, so it
     * drops the demo registry: the next visit starts from a fresh fixture.
     */
    private getStorage = (scope: WorkspaceRegistryScope): IWorkspaceStorage => {
        this.requireWindow();

        if (scope === WorkspaceRegistryScope.DEMO) {
            return { storage: sessionStorage, key: sessionWorkspaceStorageKey };
        }

        sessionStorage.removeItem(sessionWorkspaceStorageKey);
        return { storage: localStorage, key: workspaceStorageKey };
    };

    private getWorkspaceStorage = (id: string): IWorkspaceStorage =>
        this.getStorage(workspaceUtils.getRegistryScope(id));

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
