import { Network } from '@/shared/api/daoService';
import { workspaceAliasUtils } from './workspaceAliasUtils';

describe('workspaceAliasUtils', () => {
    const lower = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';
    const checksum = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    const wrongChecksum = '0xD8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    const now = 1_700_000_000_000;

    const raw = (alias?: Record<string, unknown>) => ({
        address: lower,
        name: 'Treasury',
        network: null,
        updatedAt: now - 1000,
        ...alias,
    });

    describe('parse', () => {
        it('rebuilds the records from known fields and checksums the address (inv. 25, 28)', () => {
            expect(workspaceAliasUtils.parse([raw()], now)).toEqual([
                {
                    address: checksum,
                    name: 'Treasury',
                    network: null,
                    updatedAt: now - 1000,
                },
            ]);
        });

        it('rejects unknown keys', () => {
            expect(() =>
                workspaceAliasUtils.parse([raw({ extra: 1 })], now),
            ).toThrow();
            const withProto = JSON.parse(
                `{"__proto__": {"polluted": 1}, "address": "${lower}", "name": "a", "network": null, "updatedAt": 1}`,
            );
            expect(() => workspaceAliasUtils.parse([withProto], now)).toThrow();
            expect(({} as Record<string, unknown>).polluted).toBeUndefined();
        });

        it.each([
            ['not an array', {}],
            ['a record that is not an object', ['x']],
            ['a wrong checksum', [raw({ address: wrongChecksum })]],
            ['not an address', [raw({ address: '0x123' })]],
            ['a name that is not a string', [raw({ name: 1 })]],
            ['a name that is too long', [raw({ name: 'a'.repeat(201) })]],
            [
                'an unknown network (inv. 30)',
                [raw({ network: 'not-a-network' })],
            ],
            ['a network that is not a string or null', [raw({ network: 1 })]],
            ['a time that is not a number', [raw({ updatedAt: '1' })]],
            ['a negative time', [raw({ updatedAt: -1 })]],
            [
                'the same address and network twice (inv. 29)',
                [raw(), raw({ address: checksum, name: 'Other' })],
            ],
        ])('rejects %s', (_name, value) => {
            expect(() => workspaceAliasUtils.parse(value, now)).toThrow();
        });

        it('keeps a name and a network-bound name for one address (inv. 29)', () => {
            const aliases = workspaceAliasUtils.parse(
                [raw(), raw({ network: Network.BASE_MAINNET, name: 'Base' })],
                now,
            );
            expect(aliases).toHaveLength(2);
        });

        it('keeps names that fail the name rules: they are checked when the address book is built (inv. 21)', () => {
            expect(
                workspaceAliasUtils.parse(
                    [raw({ name: 'Official Treasury' })],
                    now,
                ),
            ).toHaveLength(1);
        });

        it('caps the time at the import time (inv. 26)', () => {
            expect(
                workspaceAliasUtils.parse(
                    [raw({ updatedAt: now + 99_999 })],
                    now,
                )[0].updatedAt,
            ).toBe(now);
        });

        it('rejects more than 500 aliases in a workspace (inv. 24)', () => {
            const many = (count: number) =>
                Array.from({ length: count }, (_, i) =>
                    raw({ address: `0x${i.toString(16).padStart(40, '0')}` }),
                );
            expect(workspaceAliasUtils.parse(many(500), now)).toHaveLength(500);
            expect(() => workspaceAliasUtils.parse(many(501), now)).toThrow();
        });
    });

    describe('upsert', () => {
        const input = { address: lower, name: 'Treasury', network: null };

        it('adds a checksummed alias stamped with the time', () => {
            expect(workspaceAliasUtils.upsert([], input, now)).toEqual([
                {
                    address: checksum,
                    name: 'Treasury',
                    network: null,
                    updatedAt: now,
                },
            ]);
        });

        it('edits the alias of an existing address and network, whatever the address case (inv. 29)', () => {
            const aliases = workspaceAliasUtils.upsert([], input, now);
            const next = workspaceAliasUtils.upsert(
                aliases,
                { ...input, address: checksum, name: 'Vault' },
                now + 1,
            );
            expect(next).toEqual([
                {
                    address: checksum,
                    name: 'Vault',
                    network: null,
                    updatedAt: now + 1,
                },
            ]);
        });

        it('keeps a name for all networks and a network-bound name apart', () => {
            const aliases = workspaceAliasUtils.upsert([], input, now);
            expect(
                workspaceAliasUtils.upsert(
                    aliases,
                    { ...input, network: Network.BASE_MAINNET },
                    now,
                ),
            ).toHaveLength(2);
        });

        it.each([
            ['a wrong checksum', { address: wrongChecksum }],
            ['not an address', { address: '0x12' }],
            ['an unknown network', { network: 'nope' as Network }],
            ['a name that fails the rules', { name: 'Official Treasury' }],
            ['an address-like name', { name: 'Vault 0x123456' }],
        ])('rejects %s', (_name, override) => {
            expect(() =>
                workspaceAliasUtils.upsert([], { ...input, ...override }, now),
            ).toThrow();
        });

        it('accepts an 0x prefix name', () => {
            expect(
                workspaceAliasUtils.upsert(
                    [],
                    { ...input, name: '0xDAO' },
                    now,
                ),
            ).toHaveLength(1);
        });

        it('rejects a new alias over the cap of 500', () => {
            const aliases = Array.from({ length: 500 }, (_, i) => ({
                address: `0x${(i + 1).toString(16).padStart(40, '0')}`,
                name: 'a',
                network: null,
                updatedAt: now,
            }));
            expect(() =>
                workspaceAliasUtils.upsert(aliases, input, now),
            ).toThrow();
        });
    });

    describe('remove', () => {
        it('removes by address (any case) and network', () => {
            const aliases = workspaceAliasUtils.upsert(
                [],
                { address: lower, name: 'A', network: null },
                now,
            );
            expect(
                workspaceAliasUtils.remove(aliases, {
                    address: checksum,
                    network: Network.BASE_MAINNET,
                }),
            ).toHaveLength(1);
            expect(
                workspaceAliasUtils.remove(aliases, {
                    address: checksum,
                    network: null,
                }),
            ).toHaveLength(0);
        });
    });
});
