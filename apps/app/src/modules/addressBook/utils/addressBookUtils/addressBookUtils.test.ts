import { addressEntryKey } from '@aragon/gov-ui-kit';
import {
    type IWorkspace,
    type IWorkspaceAlias,
    WorkspaceAccountType,
} from '@/modules/workspace/api/workspaceService';
import { Network } from '@/shared/api/daoService';
import { addressBookUtils } from './addressBookUtils';

describe('addressBookUtils.buildEntries', () => {
    const a = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    const b = '0x1111111111111111111111111111111111111111';
    const c = '0x2222222222222222222222222222222222222222';
    const baseId = 8453;

    const alias = (override?: Partial<IWorkspaceAlias>): IWorkspaceAlias => ({
        address: a,
        name: 'Treasury',
        network: null,
        updatedAt: 1,
        ...override,
    });
    const workspace = (
        id: string,
        override?: Partial<IWorkspace>,
    ): IWorkspace => ({
        id,
        name: `Workspace ${id}`,
        description: '',
        avatar: null,
        links: [],
        accounts: [],
        targets: [],
        aliases: [],
        ...override,
    });
    const build = (workspaces: IWorkspace[], currentId = 'current') =>
        addressBookUtils.buildEntries(workspaces, currentId);

    it('maps an own name to a workspace entry for all networks, and a bound one to its network (inv. 20)', () => {
        const entries = build([
            workspace('current', {
                aliases: [
                    alias(),
                    alias({
                        address: b,
                        name: 'Base Safe',
                        network: Network.BASE_MAINNET,
                    }),
                ],
            }),
        ]);

        expect(entries.get(addressEntryKey(a, 0))).toEqual({
            label: 'Treasury',
            source: 'workspace',
        });
        expect(entries.get(addressEntryKey(b, baseId))).toEqual({
            label: 'Base Safe',
            source: 'workspace',
            networkLabel: 'Base',
        });
    });

    it('names the accounts of the current workspace, bound to their network (inv. 22)', () => {
        const entries = build([
            workspace('current', {
                accounts: [
                    {
                        id: `${Network.BASE_MAINNET}-${b}`,
                        type: WorkspaceAccountType.SAFE,
                        address: b,
                        network: Network.BASE_MAINNET,
                        metadata: { name: 'Ops Safe' },
                    },
                    // A DAO account without metadata has no stored name: the DAO API is never read here.
                    {
                        id: `${Network.BASE_MAINNET}-${c}`,
                        type: WorkspaceAccountType.DAO,
                        address: c,
                        network: Network.BASE_MAINNET,
                    },
                ],
            }),
        ]);

        expect(entries.get(addressEntryKey(b, baseId))).toEqual({
            label: 'Ops Safe',
            source: 'known-account',
            networkLabel: 'Base',
        });
        expect(entries.has(addressEntryKey(c, baseId))).toBe(false);
    });

    it('does not use the accounts of other workspaces as names', () => {
        const entries = build([
            workspace('current'),
            workspace('other', {
                accounts: [
                    {
                        id: `${Network.BASE_MAINNET}-${b}`,
                        type: WorkspaceAccountType.SAFE,
                        address: b,
                        network: Network.BASE_MAINNET,
                        metadata: { name: 'Their Safe' },
                    },
                ],
            }),
        ]);

        expect(entries.size).toBe(0);
    });

    it('names addresses from other workspaces with the workspace name', () => {
        const entries = build([
            workspace('current'),
            workspace('other', {
                name: 'Workspace C',
                aliases: [alias({ name: 'Theirs' })],
            }),
        ]);

        expect(entries.get(addressEntryKey(a, 0))).toEqual({
            label: 'Theirs',
            source: 'other-workspace',
            sourceLabel: 'Workspace C',
        });
    });

    it('ranks the same key: own, then the current accounts, then other workspaces (inv. 20)', () => {
        const account = {
            id: `${Network.BASE_MAINNET}-${a}`,
            type: WorkspaceAccountType.SAFE,
            address: a,
            network: Network.BASE_MAINNET,
            metadata: { name: 'Account' },
        };
        const other = workspace('other', {
            aliases: [alias({ name: 'Theirs', network: Network.BASE_MAINNET })],
        });

        expect(
            build([
                workspace('current', {
                    accounts: [account],
                    aliases: [
                        alias({ name: 'Mine', network: Network.BASE_MAINNET }),
                    ],
                }),
                other,
            ]).get(addressEntryKey(a, baseId))?.label,
        ).toBe('Mine');
        expect(
            build([workspace('current', { accounts: [account] }), other]).get(
                addressEntryKey(a, baseId),
            )?.label,
        ).toBe('Account');
    });

    it('among other workspaces the most recently updated wins, ties by workspace id (inv. 20)', () => {
        const mk = (id: string, updatedAt: number) =>
            workspace(id, { aliases: [alias({ name: id, updatedAt })] });
        const label = (workspaces: IWorkspace[]) =>
            build(workspaces).get(addressEntryKey(a, 0))?.label;

        expect(label([mk('b', 5), mk('a', 9), mk('c', 1)])).toBe('a');
        expect(label([mk('c', 5), mk('b', 5)])).toBe('b');
        expect(label([mk('b', 5), mk('c', 5)])).toBe('b');
    });

    it('checks every stored name each time, own, account and imported (inv. 21)', () => {
        const entries = build([
            workspace('current', {
                aliases: [
                    alias({ name: 'Official Treasury' }),
                    alias({ address: b, name: 'treasury.eth' }),
                    alias({ address: c, name: 'Vault 0x123456' }),
                ],
                accounts: [
                    {
                        id: 'x',
                        type: WorkspaceAccountType.SAFE,
                        address: a,
                        network: Network.BASE_MAINNET,
                        metadata: { name: 'Official Aragon Treasury' },
                    },
                    {
                        id: 'y',
                        type: WorkspaceAccountType.SAFE,
                        address: b,
                        network: Network.BASE_MAINNET,
                        metadata: { name: 'treasury.eth' },
                    },
                ],
            }),
            workspace('other', {
                aliases: [alias({ name: 'Official Treasury' })],
            }),
        ]);

        expect(entries.size).toBe(0);
    });

    it('keeps an 0x prefix name for the kit to warn about', () => {
        const entries = build([
            workspace('current', { aliases: [alias({ name: '0xDAO' })] }),
        ]);

        expect(entries.get(addressKey())?.label).toBe('0xDAO');
    });

    it('leaves out an alias whose network is no longer known, and keeps loading (inv. 23)', () => {
        const entries = build([
            workspace('current', {
                aliases: [
                    alias({ network: 'removed-network' as Network }),
                    alias({ address: b, name: 'Kept' }),
                ],
            }),
        ]);

        expect(entries.size).toBe(1);
        expect(entries.get(addressEntryKey(b, 0))?.label).toBe('Kept');
    });

    it('does not turn an alias with no network field into an all-networks name', () => {
        const { network: _network, ...noNetwork } = alias();
        const entries = build([
            workspace('current', {
                aliases: [noNetwork as unknown as IWorkspaceAlias],
            }),
        ]);

        expect(entries.size).toBe(0);
    });

    it('tolerates workspaces stored with no or broken aliases', () => {
        const broken = {
            ...workspace('x'),
            aliases: 'nope' as unknown as IWorkspaceAlias[],
        };
        const missing = { ...workspace('y'), aliases: undefined };
        const junk = workspace('z', {
            aliases: [null, { name: 1 }] as unknown as IWorkspaceAlias[],
        });

        expect(build([broken, missing, junk]).size).toBe(0);
    });

    it('uses the first workspace by name as the current one when the route has none or an unknown one', () => {
        const workspaces = [
            workspace('z', {
                name: 'Zeta',
                aliases: [alias({ name: 'Zeta name' })],
            }),
            workspace('a', {
                name: 'Alpha',
                aliases: [alias({ name: 'Alpha name' })],
            }),
        ];

        for (const id of [undefined, 'missing']) {
            const entry = build(workspaces, id).get(addressEntryKey(a, 0));
            expect(entry).toEqual({ label: 'Alpha name', source: 'workspace' });
        }
    });

    it('prefers the workspace of the route over the first by name', () => {
        const workspaces = [
            workspace('z', {
                name: 'Zeta',
                aliases: [alias({ name: 'Zeta name' })],
            }),
            workspace('a', {
                name: 'Alpha',
                aliases: [alias({ name: 'Alpha name' })],
            }),
        ];

        expect(build(workspaces, 'z').get(addressEntryKey(a, 0))?.label).toBe(
            'Zeta name',
        );
    });

    function addressKey() {
        return addressEntryKey(a, 0);
    }
});
