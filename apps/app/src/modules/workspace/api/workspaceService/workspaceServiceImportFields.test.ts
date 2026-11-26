import { Network } from '@/shared/api/daoService';
import { WorkspaceAccountType } from './domain';
import { workspaceService, workspaceStorageKey } from './workspaceService';

// Invariant 25: records of an imported file are rebuilt from known fields only, and unknown keys reject the file.
describe('workspace import of unknown fields', () => {
    const account = {
        id: 'ethereum-mainnet-0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5',
        type: WorkspaceAccountType.DAO,
        address: '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5',
        network: Network.ETHEREUM_MAINNET,
    };
    const body = {
        name: 'Imported',
        description: '',
        avatar: null,
        links: [],
        accounts: [account],
        targets: [],
        aliases: [],
    };

    afterEach(() => localStorage.clear());

    it('rejects a workspace export with an unknown workspace field', async () => {
        const file = JSON.stringify({
            version: 2,
            workspace: { ...body, verified: true },
        });

        await expect(workspaceService.importWorkspace(file)).rejects.toThrow();
        expect(localStorage.getItem(workspaceStorageKey)).toBeNull();
    });

    it('rejects a workspace export with an unknown account field', async () => {
        const file = JSON.stringify({
            version: 2,
            workspace: { ...body, accounts: [{ ...account, isOwn: true }] },
        });

        await expect(workspaceService.importWorkspace(file)).rejects.toThrow();
    });

    it('rejects a registry with an unknown workspace field', async () => {
        const file = JSON.stringify({
            imported: { ...body, id: 'imported', verified: true },
        });

        await expect(
            workspaceService.importWorkspaceRegistry(file),
        ).rejects.toThrow();
    });

    it('never exports a field it does not know', async () => {
        localStorage.setItem(
            'aragon-workspaces',
            JSON.stringify({
                stored: { ...body, id: 'stored', verified: true },
            }),
        );

        const exported = await workspaceService.exportWorkspace({
            urlParams: { id: 'stored' },
        });

        expect(JSON.parse(exported).workspace).not.toHaveProperty('verified');
    });
});
