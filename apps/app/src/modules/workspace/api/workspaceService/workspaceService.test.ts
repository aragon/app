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

            expect(getStoredWorkspaces()).toEqual({ first, second });
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
            expect(JSON.parse(exported)).toEqual({ version: 1, workspace });
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

            expect(imported).toEqual({ ...existing, id: 'new-workspace-2' });
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
                JSON.stringify({ version: 2, workspace: buildBody() }),
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
});
