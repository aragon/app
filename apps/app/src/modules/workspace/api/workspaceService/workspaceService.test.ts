import { Network } from '@/shared/api/daoService';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
    WorkspaceRegistryScope,
} from './domain';
import {
    defaultWorkspaceName,
    workspaceService,
    workspaceStorageKey,
} from './workspaceService';
import type { ICreateWorkspaceBody } from './workspaceService.api';

describe('workspace service', () => {
    const buildBody = (
        body?: Partial<ICreateWorkspaceBody>,
    ): ICreateWorkspaceBody => ({
        name: 'New Workspace',
        description: '',
        avatar: null,
        links: [],
        accounts: [
            {
                id: 'ethereum-sepolia-0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5',
                type: WorkspaceAccountType.DAO,
                address: '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5',
                network: Network.ETHEREUM_SEPOLIA,
            },
        ],
        targets: [],
        ...body,
    });

    const getStoredWorkspaces = () =>
        JSON.parse(localStorage.getItem(workspaceStorageKey)!) as Record<
            string,
            unknown
        >;

    afterEach(() => {
        localStorage.clear();
        sessionStorage.clear();
        window.history.replaceState(null, '', '/');
    });

    describe('getWorkspace', () => {
        it('rejects with a not-found error for an unknown workspace', async () => {
            await expect(
                workspaceService.getWorkspace({
                    urlParams: { id: 'unknown' },
                }),
            ).rejects.toMatchObject({ status: 404 });
        });

        it('resolves the workspaces persisted on local storage', async () => {
            const created = await workspaceService.createWorkspace({
                body: buildBody(),
            });

            const workspace = await workspaceService.getWorkspace({
                urlParams: { id: created.id },
            });

            expect(workspace).toEqual(created);
        });

        it('does not seed the default workspace on an empty registry', async () => {
            await expect(
                workspaceService.getWorkspace({
                    urlParams: { id: 'unknown' },
                }),
            ).rejects.toMatchObject({ status: 404 });

            expect(localStorage.getItem(workspaceStorageKey)).toBeNull();
        });
    });

    describe('getWorkspaceList', () => {
        it('resolves an empty list without seeding when no workspace is persisted', async () => {
            await expect(
                workspaceService.getWorkspaceList(
                    WorkspaceRegistryScope.PERSISTENT,
                ),
            ).resolves.toEqual([]);
            expect(localStorage.getItem(workspaceStorageKey)).toBeNull();
        });

        it('resolves the workspaces persisted on local storage', async () => {
            const first = await workspaceService.createWorkspace({
                body: buildBody({ name: 'First' }),
            });
            const second = await workspaceService.createWorkspace({
                body: buildBody({ name: 'Second' }),
            });

            await expect(
                workspaceService.getWorkspaceList(
                    WorkspaceRegistryScope.PERSISTENT,
                ),
            ).resolves.toEqual([first, second]);
        });
    });

    describe('createDefaultWorkspace', () => {
        it('persists the default workspace with the given accounts next to the stored ones', async () => {
            const existing = await workspaceService.createWorkspace({
                body: buildBody({ name: 'Existing' }),
            });
            const accounts = buildBody().accounts;

            const workspace =
                await workspaceService.createDefaultWorkspace(accounts);

            expect(workspace).toEqual({
                id: expect.stringMatching(/^my-workspace-[a-f0-9]{8}$/),
                name: defaultWorkspaceName,
                description: '',
                avatar: null,
                links: [],
                accounts,
                targets: [],
            });
            expect(getStoredWorkspaces()).toEqual({
                [existing.id]: existing,
                [workspace.id]: workspace,
            });
        });

        it('rejects with a storage error when local storage rejects the write', async () => {
            const setItemSpy = jest
                .spyOn(Storage.prototype, 'setItem')
                .mockImplementation(() => {
                    throw new Error('QuotaExceededError');
                });

            await expect(
                workspaceService.createDefaultWorkspace([]),
            ).rejects.toMatchObject({ code: 'workspaceStorageError' });

            setItemSpy.mockRestore();
        });
    });

    describe('createWorkspace', () => {
        it('assigns the ID from the workspace name and persists the workspace', async () => {
            const body = buildBody();

            const workspace = await workspaceService.createWorkspace({ body });

            expect(workspace).toEqual({ ...body, id: 'new-workspace' });
            expect(
                JSON.parse(localStorage.getItem(workspaceStorageKey)!),
            ).toEqual({ 'new-workspace': workspace });
        });

        it('suffixes the ID when the slug collides with a persisted workspace', async () => {
            await workspaceService.createWorkspace({
                body: buildBody({ name: 'Demo' }),
            });
            const workspace = await workspaceService.createWorkspace({
                body: buildBody({ name: 'Demo' }),
            });

            expect(workspace.id).toEqual('demo-2');
        });

        it('keeps the previously created workspaces', async () => {
            const first = await workspaceService.createWorkspace({
                body: buildBody({ name: 'First' }),
            });
            const second = await workspaceService.createWorkspace({
                body: buildBody({ name: 'Second' }),
            });

            expect(getStoredWorkspaces()).toEqual({ first, second });
        });

        it('rejects with a storage error when local storage rejects the write', async () => {
            const setItemSpy = jest
                .spyOn(Storage.prototype, 'setItem')
                .mockImplementation(() => {
                    throw new Error('QuotaExceededError');
                });

            await expect(
                workspaceService.createWorkspace({ body: buildBody() }),
            ).rejects.toMatchObject({
                code: 'workspaceStorageError',
                status: 500,
            });

            setItemSpy.mockRestore();
        });

        it('does not seed the default workspace', async () => {
            const workspace = await workspaceService.createWorkspace({
                body: buildBody(),
            });

            expect(getStoredWorkspaces()).toEqual({
                [workspace.id]: workspace,
            });
        });
    });

    describe('addWorkspaceAccount', () => {
        const safeAccount: IWorkspaceAccount = {
            id: 'ethereum-sepolia-0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419',
            type: WorkspaceAccountType.SAFE,
            address: '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419',
            network: Network.ETHEREUM_SEPOLIA,
        };

        it('appends the account to the stored workspace', async () => {
            const created = await workspaceService.createWorkspace({
                body: buildBody(),
            });

            const workspace = await workspaceService.addWorkspaceAccount({
                urlParams: { id: created.id },
                body: { account: safeAccount },
            });

            expect(workspace).toEqual({
                ...created,
                accounts: [...created.accounts, safeAccount],
            });
            expect(getStoredWorkspaces()).toEqual({ [created.id]: workspace });
        });

        // The caller passes only the account, so a change stored after it read the workspace is not overwritten.
        it('keeps the changes stored since the caller read the workspace', async () => {
            const created = await workspaceService.createWorkspace({
                body: buildBody(),
            });
            await workspaceService.updateWorkspaceDetails({
                urlParams: { id: created.id },
                body: { ...buildBody(), name: 'Renamed in another tab' },
            });

            const workspace = await workspaceService.addWorkspaceAccount({
                urlParams: { id: created.id },
                body: { account: safeAccount },
            });

            expect(workspace.name).toEqual('Renamed in another tab');
        });

        it('does not add an account the workspace already holds, whatever its casing', async () => {
            const created = await workspaceService.createWorkspace({
                body: buildBody(),
            });
            const [heldAccount] = created.accounts;

            const workspace = await workspaceService.addWorkspaceAccount({
                urlParams: { id: created.id },
                body: {
                    account: {
                        ...heldAccount,
                        address: heldAccount.address.toLowerCase(),
                    },
                },
            });

            expect(workspace).toEqual(created);
            expect(getStoredWorkspaces()).toEqual({ [created.id]: created });
        });

        it('rejects with a storage error when local storage rejects the write', async () => {
            const created = await workspaceService.createWorkspace({
                body: buildBody(),
            });
            const setItemSpy = jest
                .spyOn(Storage.prototype, 'setItem')
                .mockImplementation(() => {
                    throw new Error('QuotaExceededError');
                });

            await expect(
                workspaceService.addWorkspaceAccount({
                    urlParams: { id: created.id },
                    body: { account: safeAccount },
                }),
            ).rejects.toMatchObject({
                code: 'workspaceStorageError',
                status: 500,
            });

            setItemSpy.mockRestore();
        });

        it('rejects with a not-found error for an unknown workspace', async () => {
            await expect(
                workspaceService.addWorkspaceAccount({
                    urlParams: { id: 'unknown' },
                    body: { account: safeAccount },
                }),
            ).rejects.toMatchObject({ status: 404 });
        });
    });
    describe('demo workspace registry', () => {
        const demo = {
            'aragon-demo': {
                ...buildBody({ name: 'Demo' }),
                id: 'aragon-demo',
            },
        };

        it('lists each registry apart, whatever the route', async () => {
            const persistent = await workspaceService.createWorkspace({
                body: buildBody({ name: 'Persistent' }),
            });
            await workspaceService.activateSessionWorkspaceRegistry(
                JSON.stringify(demo),
            );
            window.history.pushState(null, '', '/workspace');

            await expect(
                workspaceService.getWorkspaceList(WorkspaceRegistryScope.DEMO),
            ).resolves.toEqual([demo['aragon-demo']]);
            await expect(
                workspaceService.getWorkspaceList(
                    WorkspaceRegistryScope.PERSISTENT,
                ),
            ).resolves.toEqual([persistent]);
        });

        it('reads and writes a demo workspace on the demo registry only', async () => {
            const persistent = await workspaceService.createWorkspace({
                body: buildBody({ name: 'Persistent' }),
            });
            await workspaceService.activateSessionWorkspaceRegistry(
                JSON.stringify(demo),
            );
            expect(workspaceService.hasSessionWorkspace('aragon-demo')).toBe(
                true,
            );
            expect(workspaceService.hasSessionWorkspace('unknown')).toBe(false);

            await workspaceService.updateWorkspaceDetails({
                urlParams: { id: 'aragon-demo' },
                body: { ...buildBody(), name: 'Changed demo' },
            });

            await expect(
                workspaceService.getWorkspace({
                    urlParams: { id: 'aragon-demo' },
                }),
            ).resolves.toMatchObject({ name: 'Changed demo' });
            expect(getStoredWorkspaces()).toEqual({
                [persistent.id]: persistent,
            });
        });

        it('drops the demo registry once the persistent one is read', async () => {
            await workspaceService.activateSessionWorkspaceRegistry(
                JSON.stringify(demo),
            );

            await workspaceService.getWorkspaceList(
                WorkspaceRegistryScope.PERSISTENT,
            );

            expect(workspaceService.hasSessionWorkspace('aragon-demo')).toBe(
                false,
            );
            await expect(
                workspaceService.getWorkspace({
                    urlParams: { id: 'aragon-demo' },
                }),
            ).rejects.toMatchObject({ status: 404 });
        });
    });

    describe('workspace registry portability', () => {
        it('exports and restores the complete registry', async () => {
            const first = await workspaceService.createWorkspace({
                body: buildBody({ name: 'First' }),
            });
            const second = await workspaceService.createWorkspace({
                body: buildBody({ name: 'Second' }),
            });
            const exported = await workspaceService.exportWorkspaceRegistry();

            localStorage.clear();
            await workspaceService.importWorkspaceRegistry(exported);

            // The export always carries an address book, empty for a workspace with no names.
            expect(getStoredWorkspaces()).toEqual({
                first: { ...first, aliases: [] },
                second: { ...second, aliases: [] },
            });
        });

        it('can merge an imported fixture without replacing stored workspaces', async () => {
            const existing = await workspaceService.createWorkspace({
                body: buildBody({ name: 'Existing' }),
            });
            const fixture = {
                fixture: { ...buildBody({ name: 'Fixture' }), id: 'fixture' },
            };

            await workspaceService.importWorkspaceRegistry(
                JSON.stringify(fixture),
                true,
            );

            expect(getStoredWorkspaces()).toEqual({ existing, ...fixture });
        });

        it('writes the persistent registry and leaves the demo one in place', async () => {
            sessionStorage.setItem(
                'aragon-session-workspaces',
                JSON.stringify({ 'aragon-demo': { id: 'aragon-demo' } }),
            );

            const imported = {
                mine: { ...buildBody({ name: 'Mine' }), id: 'mine' },
            };
            await workspaceService.importWorkspaceRegistry(
                JSON.stringify(imported),
            );

            expect(getStoredWorkspaces()).toEqual(imported);
            expect(sessionStorage.getItem('aragon-session-workspaces')).toBe(
                JSON.stringify({ 'aragon-demo': { id: 'aragon-demo' } }),
            );
        });

        it('rejects a registry using a demo ID and leaves the stored one in place', async () => {
            const existing = await workspaceService.createWorkspace({
                body: buildBody({ name: 'Existing' }),
            });
            const registry = {
                'aragon-demo': {
                    ...buildBody({ name: 'Demo' }),
                    id: 'aragon-demo',
                },
            };

            await expect(
                workspaceService.importWorkspaceRegistry(
                    JSON.stringify(registry),
                    true,
                ),
            ).rejects.toThrow('aragon-demo');
            expect(getStoredWorkspaces()).toEqual({ [existing.id]: existing });
        });

        it('repairs links saved without a protocol, so an older export re-imports', async () => {
            // Exports before the repair kept whatever the resources input accepted, which may lack a scheme.
            const registry = {
                first: {
                    ...buildBody({ name: 'First' }),
                    id: 'first',
                    links: [{ name: 'Docs', url: 'aragon.org/docs' }],
                },
            };

            const [workspace] = await workspaceService.importWorkspaceRegistry(
                JSON.stringify(registry),
            );

            expect(workspace.links).toEqual([
                { name: 'Docs', url: 'https://aragon.org/docs' },
            ]);
        });

        it('throws the validation error on junk links instead of a TypeError', async () => {
            await expect(
                workspaceService.importWorkspaceRegistry(
                    JSON.stringify({
                        broken: {
                            ...buildBody(),
                            id: 'broken',
                            links: [null],
                        },
                    }),
                ),
            ).rejects.toThrow('not a valid workspace registry');
        });

        it('rejects malformed imports without changing stored workspaces', async () => {
            const existing = await workspaceService.createWorkspace({
                body: buildBody({ name: 'Existing' }),
            });

            await expect(
                workspaceService.importWorkspaceRegistry(
                    JSON.stringify({
                        broken: {
                            ...buildBody(),
                            id: 'broken',
                            name: 42,
                        },
                    }),
                ),
            ).rejects.toThrow('not a valid workspace registry');
            expect(getStoredWorkspaces()).toEqual({ existing });
        });

        it('deletes the stored registry entirely', async () => {
            await workspaceService.createWorkspace({ body: buildBody() });

            await workspaceService.deleteWorkspaceRegistry();

            expect(localStorage.getItem(workspaceStorageKey)).toBeNull();
            expect(
                await workspaceService.getWorkspaceList(
                    WorkspaceRegistryScope.PERSISTENT,
                ),
            ).toEqual([]);
        });
    });

    describe('updateWorkspaceDetails', () => {
        const details = {
            name: 'Renamed',
            description: 'New description',
            avatar: 'ipfs://avatar',
            links: [{ name: 'Site', url: 'https://example.org' }],
        };

        it('replaces the details, keeping the ID, accounts and targets', async () => {
            const created = await workspaceService.createWorkspace({
                body: buildBody(),
            });

            const workspace = await workspaceService.updateWorkspaceDetails({
                urlParams: { id: created.id },
                body: details,
            });

            expect(workspace).toEqual({ ...created, ...details });
            expect(getStoredWorkspaces()).toEqual({ [created.id]: workspace });
        });

        it('rejects with a not-found error for an unknown workspace', async () => {
            await expect(
                workspaceService.updateWorkspaceDetails({
                    urlParams: { id: 'unknown' },
                    body: details,
                }),
            ).rejects.toMatchObject({ status: 404 });
        });
    });

    describe('removeWorkspaceAccount', () => {
        const safeAccount: IWorkspaceAccount = {
            id: 'ethereum-sepolia-0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419',
            type: WorkspaceAccountType.SAFE,
            address: '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419',
            network: Network.ETHEREUM_SEPOLIA,
        };

        it('removes the account, keeping the order of the others', async () => {
            const created = await workspaceService.createWorkspace({
                body: buildBody(),
            });
            const [daoAccount] = created.accounts;
            await workspaceService.addWorkspaceAccount({
                urlParams: { id: created.id },
                body: { account: safeAccount },
            });

            const workspace = await workspaceService.removeWorkspaceAccount({
                urlParams: { id: created.id },
                body: { accountId: daoAccount.id },
            });

            expect(workspace.accounts).toEqual([safeAccount]);
            expect(getStoredWorkspaces()).toEqual({ [created.id]: workspace });
        });

        it('leaves the workspace unchanged for an account it does not hold', async () => {
            const created = await workspaceService.createWorkspace({
                body: buildBody(),
            });

            const workspace = await workspaceService.removeWorkspaceAccount({
                urlParams: { id: created.id },
                body: { accountId: safeAccount.id },
            });

            expect(workspace).toEqual(created);
        });

        it('rejects with a not-found error for an unknown workspace', async () => {
            await expect(
                workspaceService.removeWorkspaceAccount({
                    urlParams: { id: 'unknown' },
                    body: { accountId: safeAccount.id },
                }),
            ).rejects.toMatchObject({ status: 404 });
        });
    });

    describe('workspace export', () => {
        it('exports the workspace without its ID, under a format version', async () => {
            const created = await workspaceService.createWorkspace({
                body: buildBody(),
            });

            const exported = await workspaceService.exportWorkspace({
                urlParams: { id: created.id },
            });

            const { id: _id, ...workspace } = created;
            expect(JSON.parse(exported)).toEqual({
                version: 2,
                workspace: { ...workspace, aliases: [] },
            });
        });

        it('rejects with a not-found error for an unknown workspace', async () => {
            await expect(
                workspaceService.exportWorkspace({
                    urlParams: { id: 'unknown' },
                }),
            ).rejects.toMatchObject({ status: 404 });
        });
    });

    describe('workspace export round trip', () => {
        it('re-imports a workspace whose links were saved without a protocol', async () => {
            const created = await workspaceService.createWorkspace({
                body: buildBody({
                    links: [{ name: 'Site', url: 'example.org' }],
                }),
            });
            const exported = await workspaceService.exportWorkspace({
                urlParams: { id: created.id },
            });

            const imported = await workspaceService.importWorkspace(exported);

            expect(imported.links).toEqual([
                { name: 'Site', url: 'https://example.org' },
            ]);
        });
    });

    describe('workspace import', () => {
        it('stores an exported workspace as a new workspace, leaving the existing one untouched', async () => {
            const existing = await workspaceService.createWorkspace({
                body: buildBody(),
            });
            const exported = await workspaceService.exportWorkspace({
                urlParams: { id: existing.id },
            });

            const imported = await workspaceService.importWorkspace(exported);

            expect(imported).toEqual({
                ...existing,
                aliases: [],
                id: 'new-workspace-2',
            });
            expect(getStoredWorkspaces()).toEqual({
                [existing.id]: existing,
                [imported.id]: imported,
            });
        });

        it('keeps the links of an account metadata', async () => {
            const [account] = buildBody().accounts;
            const accountWithLinks: IWorkspaceAccount = {
                ...account,
                type: WorkspaceAccountType.SAFE,
                metadata: {
                    name: 'Treasury',
                    links: [{ name: 'Site', url: 'https://aragon.org' }],
                },
            };

            const imported = await workspaceService.importWorkspace(
                JSON.stringify({
                    version: 1,
                    workspace: buildBody({ accounts: [accountWithLinks] }),
                }),
            );

            expect(imported.accounts).toEqual([accountWithLinks]);
        });

        it('rejects an account metadata link that is not a web URL', async () => {
            const [account] = buildBody().accounts;
            const accountWithBadLink = {
                ...account,
                metadata: {
                    name: 'Treasury',
                    links: [{ name: 'Site', url: 'javascript:alert(1)' }],
                },
            };

            await expect(
                workspaceService.importWorkspace(
                    JSON.stringify({
                        version: 1,
                        workspace: buildBody({
                            accounts: [accountWithBadLink],
                        }),
                    }),
                ),
            ).rejects.toThrow();
        });

        it('never takes the ID of a demo workspace', async () => {
            const imported = await workspaceService.importWorkspace(
                JSON.stringify({
                    version: 1,
                    workspace: buildBody({ name: 'Aragon Demo' }),
                }),
            );

            expect(imported.id).toEqual('aragon-demo-2');
        });

        it('stores the workspace on local storage, leaving the demo registry in place', async () => {
            await workspaceService.activateSessionWorkspaceRegistry(
                JSON.stringify({
                    'aragon-demo': {
                        ...buildBody({ name: 'Demo' }),
                        id: 'aragon-demo',
                    },
                }),
            );

            const imported = await workspaceService.importWorkspace(
                JSON.stringify({ version: 1, workspace: buildBody() }),
            );

            expect(getStoredWorkspaces()).toEqual({ [imported.id]: imported });
            expect(workspaceService.hasSessionWorkspace(imported.id)).toBe(
                false,
            );
            expect(workspaceService.hasSessionWorkspace('aragon-demo')).toBe(
                true,
            );
        });

        it.each([
            ['invalid JSON', '{'],
            [
                'an unknown version',
                JSON.stringify({ version: 3, workspace: buildBody() }),
            ],
            [
                'a workspace registry',
                JSON.stringify({ first: { ...buildBody(), id: 'first' } }),
            ],
            [
                'an invalid account',
                JSON.stringify({
                    version: 1,
                    workspace: buildBody({
                        accounts: [
                            {
                                id: 'ethereum-sepolia-0x123',
                                type: WorkspaceAccountType.DAO,
                                address: '0x123',
                                network: Network.ETHEREUM_SEPOLIA,
                            },
                        ],
                    }),
                }),
            ],
        ])('rejects %s without storing anything', async (_, rawExport) => {
            const existing = await workspaceService.createWorkspace({
                body: buildBody({ name: 'Existing' }),
            });

            await expect(
                workspaceService.importWorkspace(rawExport),
            ).rejects.toThrow();
            expect(getStoredWorkspaces()).toEqual({ [existing.id]: existing });
        });
    });
    describe('address book', () => {
        const lower = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';
        const checksum = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
        const wrongChecksum = '0xD8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
        const alias = (override?: Record<string, unknown>) => ({
            address: lower,
            name: 'Treasury',
            network: null,
            updatedAt: 1,
            ...override,
        });
        const workspaceFile = (aliases: unknown, version = 2) =>
            JSON.stringify({
                version,
                workspace: {
                    ...buildBody(),
                    ...(aliases === undefined ? {} : { aliases }),
                },
            });
        const registryOf = (count: number, aliases: unknown[] = []) =>
            JSON.stringify(
                Object.fromEntries(
                    Array.from({ length: count }, (_, i) => [
                        `ws-${i}`,
                        { ...buildBody(), id: `ws-${i}`, aliases },
                    ]),
                ),
            );

        it('saves a name, edits the same address and network, and keeps a bound name apart (inv. 29)', async () => {
            const { id } = await workspaceService.createWorkspace({
                body: buildBody(),
            });
            const urlParams = { id };
            await workspaceService.upsertWorkspaceAlias({
                urlParams,
                body: { address: lower, name: 'Treasury', network: null },
            });
            await workspaceService.upsertWorkspaceAlias({
                urlParams,
                body: { address: checksum, name: 'Vault', network: null },
            });
            const workspace = await workspaceService.upsertWorkspaceAlias({
                urlParams,
                body: {
                    address: lower,
                    name: 'Base Safe',
                    network: Network.BASE_MAINNET,
                },
            });

            expect(workspace.aliases).toHaveLength(2);
            expect(
                workspace.aliases?.map((a) => [a.address, a.name, a.network]),
            ).toEqual([
                [checksum, 'Vault', null],
                [checksum, 'Base Safe', Network.BASE_MAINNET],
            ]);
        });

        it('removes a name by address and network', async () => {
            const { id } = await workspaceService.createWorkspace({
                body: buildBody(),
            });
            await workspaceService.upsertWorkspaceAlias({
                urlParams: { id },
                body: { address: lower, name: 'Treasury', network: null },
            });
            const workspace = await workspaceService.removeWorkspaceAlias({
                urlParams: { id },
                body: { address: checksum, network: null },
            });

            expect(workspace.aliases).toEqual([]);
        });

        it('rejects a wrong checksum on write (inv. 28) and a missing workspace', async () => {
            const { id } = await workspaceService.createWorkspace({
                body: buildBody(),
            });
            await expect(
                workspaceService.upsertWorkspaceAlias({
                    urlParams: { id },
                    body: {
                        address: wrongChecksum,
                        name: 'Treasury',
                        network: null,
                    },
                }),
            ).rejects.toThrow();
            await expect(
                workspaceService.upsertWorkspaceAlias({
                    urlParams: { id: 'unknown' },
                    body: { address: lower, name: 'Treasury', network: null },
                }),
            ).rejects.toMatchObject({ status: 404 });
        });

        it('leaves storage unchanged when the write fails (inv. 27)', async () => {
            const { id } = await workspaceService.createWorkspace({
                body: buildBody(),
            });
            const before = localStorage.getItem(workspaceStorageKey);
            const setItem = jest
                .spyOn(Storage.prototype, 'setItem')
                .mockImplementation(() => {
                    throw new Error('QuotaExceededError');
                });

            await expect(
                workspaceService.upsertWorkspaceAlias({
                    urlParams: { id },
                    body: { address: lower, name: 'Treasury', network: null },
                }),
            ).rejects.toMatchObject({ code: 'workspaceStorageError' });
            setItem.mockRestore();

            expect(localStorage.getItem(workspaceStorageKey)).toBe(before);
        });

        it('exports version 2 with the names and their network, and imports them back (inv. 27, 30)', async () => {
            const { id } = await workspaceService.createWorkspace({
                body: buildBody(),
            });
            await workspaceService.upsertWorkspaceAlias({
                urlParams: { id },
                body: {
                    address: lower,
                    name: 'Base Safe',
                    network: Network.BASE_MAINNET,
                },
            });
            const exported = await workspaceService.exportWorkspace({
                urlParams: { id },
            });
            expect(JSON.parse(exported).version).toBe(2);

            const imported = await workspaceService.importWorkspace(exported);

            expect(imported.id).not.toBe(id);
            expect(imported.aliases).toEqual([
                expect.objectContaining({
                    address: checksum,
                    name: 'Base Safe',
                    network: Network.BASE_MAINNET,
                }),
            ]);
        });

        it('loads a version 1 file and a stored workspace with an empty book (inv. 27)', async () => {
            const imported = await workspaceService.importWorkspace(
                workspaceFile(undefined, 1),
            );
            expect(imported.aliases ?? []).toEqual([]);
            const { id } = await workspaceService.createWorkspace({
                body: buildBody(),
            });
            expect(
                (await workspaceService.getWorkspace({ urlParams: { id } }))
                    .aliases ?? [],
            ).toEqual([]);
        });

        it.each([
            ['an unknown network (inv. 30)', [alias({ network: 'nope' })]],
            ['a wrong checksum (inv. 28)', [alias({ address: wrongChecksum })]],
            ['an unknown key (inv. 25)', [alias({ extra: true })]],
            [
                'the same address and network twice (inv. 29)',
                [alias(), alias({ name: 'Other' })],
            ],
            [
                'more than 500 aliases (inv. 24)',
                Array.from({ length: 501 }, (_, i) =>
                    alias({ address: `0x${i.toString(16).padStart(40, '0')}` }),
                ),
            ],
        ])('rejects a workspace file with %s', async (_name, aliases) => {
            await expect(
                workspaceService.importWorkspace(workspaceFile(aliases)),
            ).rejects.toThrow();
            expect(localStorage.getItem(workspaceStorageKey)).toBeNull();
        });

        it('checks a file size of 1 MB before parsing it (inv. 24)', async () => {
            const parse = jest.spyOn(JSON, 'parse');
            const big = ' '.repeat(1_000_001);

            await expect(workspaceService.importWorkspace(big)).rejects.toThrow(
                /too large/i,
            );
            await expect(
                workspaceService.importWorkspaceRegistry(big),
            ).rejects.toThrow(/too large/i);
            expect(parse).not.toHaveBeenCalled();
            parse.mockRestore();
        });

        it('caps the registry at 100 workspaces and 5,000 aliases (inv. 24)', async () => {
            await expect(
                workspaceService.importWorkspaceRegistry(registryOf(101)),
            ).rejects.toThrow();
            const aliases = Array.from({ length: 100 }, (_, i) =>
                alias({ address: `0x${i.toString(16).padStart(40, '0')}` }),
            );
            await expect(
                workspaceService.importWorkspaceRegistry(
                    registryOf(51, aliases),
                ),
            ).rejects.toThrow();
            await expect(
                workspaceService.importWorkspaceRegistry(
                    registryOf(50, aliases),
                ),
            ).resolves.toHaveLength(50);
        });

        it('caps the time of an imported name at the import time (inv. 26)', async () => {
            const future = Date.now() + 10 ** 9;
            const imported = await workspaceService.importWorkspace(
                workspaceFile([alias({ updatedAt: future })]),
            );

            expect(imported.aliases?.[0].updatedAt).toBeLessThanOrEqual(
                Date.now(),
            );
        });

        it('changes nothing for __proto__ and constructor workspace ids (inv. 25)', async () => {
            const registry = `{"__proto__": ${JSON.stringify({ ...buildBody(), id: '__proto__' })}}`;

            await expect(
                workspaceService.importWorkspaceRegistry(registry),
            ).rejects.toThrow();
            expect(({} as Record<string, unknown>).name).toBeUndefined();
            expect(localStorage.getItem(workspaceStorageKey)).toBeNull();
        });

        it('keeps the names of a registry round trip with their network (inv. 30)', async () => {
            const aliases = [alias({ network: Network.BASE_MAINNET })];
            await workspaceService.importWorkspaceRegistry(
                registryOf(1, aliases),
            );
            const exported = JSON.parse(
                await workspaceService.exportWorkspaceRegistry(),
            );

            expect(exported['ws-0'].aliases[0]).toMatchObject({
                address: checksum,
                network: Network.BASE_MAINNET,
            });
        });
    });
});
