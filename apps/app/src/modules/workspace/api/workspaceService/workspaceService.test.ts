import { Network } from '@/shared/api/daoService';
import { WorkspaceAccountType } from './domain';
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
        owner: '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419',
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

        it('seeds the default workspace on an empty registry, even when the requested one is unknown', async () => {
            await expect(
                workspaceService.getWorkspace({
                    urlParams: { id: 'unknown' },
                }),
            ).rejects.toMatchObject({ status: 404 });

            expect(Object.values(getStoredWorkspaces())).toEqual([
                expect.objectContaining({ name: defaultWorkspaceName }),
            ]);
        });
    });

    describe('getWorkspaceList', () => {
        it('seeds and persists the default workspace when no workspace is persisted', async () => {
            const workspaces = await workspaceService.getWorkspaceList();

            expect(workspaces).toEqual([
                {
                    id: expect.stringMatching(/^my-workspace-[0-9a-f]{8}$/),
                    name: defaultWorkspaceName,
                    description: '',
                    avatar: null,
                    links: [],
                    accounts: [],
                    targets: [],
                },
            ]);
            expect(workspaces[0].owner).toBeUndefined();
            expect(getStoredWorkspaces()).toEqual({
                [workspaces[0].id]: workspaces[0],
            });
        });

        it('seeds the default workspace only once', async () => {
            const [first] = await workspaceService.getWorkspaceList();
            const [second] = await workspaceService.getWorkspaceList();

            expect(second).toEqual(first);
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
        it('replaces the workspace, keeping its ID and owner', async () => {
            const created = await workspaceService.createWorkspace({
                body: buildBody(),
            });

            // A body carrying another owner, as the publish dialog builds it, must not overwrite the stored one.
            const body = {
                ...buildBody({ name: 'Renamed', accounts: [] }),
                owner: '0x0000000000000000000000000000000000000001',
            };
            const workspace = await workspaceService.updateWorkspace({
                urlParams: { id: created.id },
                body,
            });

            expect(workspace).toEqual({
                ...buildBody({ name: 'Renamed', accounts: [] }),
                id: created.id,
                owner: created.owner,
            });
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

        it('rejects with a not-found error for an unknown workspace', async () => {
            await expect(
                workspaceService.updateWorkspace({
                    urlParams: { id: 'unknown' },
                    body: buildBody(),
                }),
            ).rejects.toMatchObject({ status: 404 });
        });
    });
});
