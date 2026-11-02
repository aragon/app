import { Network } from '@/shared/api/daoService';
import { type IWorkspaceAccount, WorkspaceAccountType } from './domain';
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
            await expect(workspaceService.getWorkspaceList()).resolves.toEqual(
                [],
            );
            expect(localStorage.getItem(workspaceStorageKey)).toBeNull();
        });

        it('resolves the workspaces persisted on local storage', async () => {
            const first = await workspaceService.createWorkspace({
                body: buildBody({ name: 'First' }),
            });
            const second = await workspaceService.createWorkspace({
                body: buildBody({ name: 'Second' }),
            });

            await expect(workspaceService.getWorkspaceList()).resolves.toEqual([
                first,
                second,
            ]);
        });
    });

    describe('getOrCreateDefaultWorkspace', () => {
        it('seeds and persists the default workspace when no workspace is persisted', async () => {
            const workspace =
                await workspaceService.getOrCreateDefaultWorkspace();

            expect(workspace).toEqual({
                id: expect.stringMatching(/^my-workspace-[0-9a-f]{8}$/),
                name: defaultWorkspaceName,
                description: '',
                avatar: null,
                links: [],
                accounts: [],
                targets: [],
            });
            expect(getStoredWorkspaces()).toEqual({
                [workspace.id]: workspace,
            });
        });

        it('seeds the default workspace only once', async () => {
            const first = await workspaceService.getOrCreateDefaultWorkspace();
            const second = await workspaceService.getOrCreateDefaultWorkspace();

            expect(second).toEqual(first);
            expect(Object.keys(getStoredWorkspaces())).toHaveLength(1);
        });

        it('resolves the first persisted workspace without seeding', async () => {
            const first = await workspaceService.createWorkspace({
                body: buildBody({ name: 'First' }),
            });
            await workspaceService.createWorkspace({
                body: buildBody({ name: 'Second' }),
            });

            await expect(
                workspaceService.getOrCreateDefaultWorkspace(),
            ).resolves.toEqual(first);
            expect(Object.keys(getStoredWorkspaces())).toHaveLength(2);
        });

        it('rejects with a storage error when local storage rejects the write', async () => {
            const setItemSpy = jest
                .spyOn(Storage.prototype, 'setItem')
                .mockImplementation(() => {
                    throw new Error('QuotaExceededError');
                });

            await expect(
                workspaceService.getOrCreateDefaultWorkspace(),
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

    describe('updateWorkspace', () => {
        it('replaces the workspace, keeping its ID', async () => {
            const created = await workspaceService.createWorkspace({
                body: buildBody(),
            });

            const body = buildBody({ name: 'Renamed', accounts: [] });
            const workspace = await workspaceService.updateWorkspace({
                urlParams: { id: created.id },
                body,
            });

            expect(workspace).toEqual({ ...body, id: created.id });
            expect(getStoredWorkspaces()).toEqual({ [created.id]: workspace });
        });

        it('keeps the other workspaces', async () => {
            const first = await workspaceService.createWorkspace({
                body: buildBody({ name: 'First' }),
            });
            const second = await workspaceService.createWorkspace({
                body: buildBody({ name: 'Second' }),
            });

            const updated = await workspaceService.updateWorkspace({
                urlParams: { id: first.id },
                body: buildBody({ name: 'Renamed' }),
            });

            expect(getStoredWorkspaces()).toEqual({
                first: updated,
                second,
            });
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
                workspaceService.updateWorkspace({
                    urlParams: { id: created.id },
                    body: buildBody({ name: 'Renamed' }),
                }),
            ).rejects.toMatchObject({
                code: 'workspaceStorageError',
                status: 500,
            });

            setItemSpy.mockRestore();
        });

        it('rejects with a not-found error for an unknown workspace', async () => {
            await expect(
                workspaceService.updateWorkspace({
                    urlParams: { id: 'unknown' },
                    body: buildBody(),
                }),
            ).rejects.toMatchObject({ status: 404 });
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
            await workspaceService.updateWorkspace({
                urlParams: { id: created.id },
                body: buildBody({ name: 'Renamed in another tab' }),
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
});
