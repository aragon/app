import { act, render, renderHook } from '@testing-library/react';
import { memo, type ReactNode } from 'react';
import { addressEntryKey } from './addressLabelUtils';
import { AddressNetworkProvider } from './addressNetworkProvider';
import { AddressResolutionProvider, type AddressResolver, type IAddressEntry } from './addressResolutionProvider';
import { useResolveAddress } from './useResolveAddress';
import { useResolveAddressText } from './useResolveAddressText';

describe('address resolution', () => {
    const a = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';
    const b = '0x1111111111111111111111111111111111111111';
    const c = '0x2222222222222222222222222222222222222222';

    const own = (label: string, extra?: Partial<IAddressEntry>): IAddressEntry => ({
        label,
        source: 'workspace',
        ...extra,
    });
    const other = (label: string, extra?: Partial<IAddressEntry>): IAddressEntry => ({
        label,
        source: 'other-workspace',
        sourceLabel: 'Workspace C',
        ...extra,
    });
    const entriesOf = (...rows: [string, number, IAddressEntry][]) =>
        new Map(rows.map(([address, chainId, entry]) => [addressEntryKey(address, chainId), entry]));

    const wrapper =
        (props: { entries?: ReadonlyMap<string, IAddressEntry>; resolve?: AddressResolver; chainId?: number }) =>
        ({ children }: { children: ReactNode }) => (
            <AddressResolutionProvider entries={props.entries} resolve={props.resolve}>
                <AddressNetworkProvider chainId={props.chainId}>{children}</AddressNetworkProvider>
            </AddressResolutionProvider>
        );

    const hook = (address: string | undefined, props: Parameters<typeof wrapper>[0] = {}, chainId?: number) =>
        renderHook(() => useResolveAddress(address, chainId), { wrapper: wrapper(props) });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('inv. 1, 4, 6: lookup', () => {
        it('returns an entry at once and never calls resolve', () => {
            const resolve = jest.fn();
            const { result } = hook(a, { entries: entriesOf([a, 0, own('Treasury')]), resolve });
            expect(result.current).toMatchObject({
                label: 'Treasury',
                source: 'workspace',
                chainId: 0,
                warnings: [],
                isLoading: false,
                isResolved: true,
            });
            expect(resolve).not.toHaveBeenCalled();
        });

        it('is blind to the case of the address, in entries and in the lookup', () => {
            const entries = new Map([[`${a.toUpperCase().replace('0X', '0x')}:0`, own('Treasury')]]);
            const { result } = hook(a.toUpperCase().replace('0X', '0x'), { entries });
            expect(result.current.label).toBe('Treasury');
        });

        it.each([undefined, 'You', 'vitalik.eth', '0x1234'])('never resolves %p', (value) => {
            const resolve = jest.fn();
            const { result } = hook(value, { resolve });
            expect(result.current).toEqual({ warnings: [], isLoading: false, isResolved: true });
            expect(resolve).not.toHaveBeenCalled();
        });

        it('resolves nothing without a provider or with an empty one', () => {
            const bare = renderHook(() => useResolveAddress(a));
            expect(bare.result.current).toEqual({ warnings: [], isLoading: false, isResolved: true });
            const empty = renderHook(() => useResolveAddress(a), {
                wrapper: ({ children }) => <AddressResolutionProvider>{children}</AddressResolutionProvider>,
            });
            expect(empty.result.current).toEqual({ warnings: [], isLoading: false, isResolved: true });
        });

        it('ignores an entry without a label', () => {
            const { result } = hook(a, { entries: entriesOf([a, 0, { label: '', source: 'workspace' }]) });
            expect(result.current.label).toBeUndefined();
            expect(result.current.warnings).toEqual([]);
        });
    });

    describe('inv. 2, 3, 5: lazy resolution', () => {
        it('calls resolve once for 100 components and updates all of them', async () => {
            let finish: (entry: IAddressEntry | null) => void = () => undefined;
            const resolve = jest.fn(
                () =>
                    new Promise<IAddressEntry | null>((res) => {
                        finish = res;
                    }),
            );
            const seen: string[] = [];
            const Row = () => {
                const { label, isLoading, isResolved } = useResolveAddress(a);
                seen.push(`${label ?? '-'}:${isLoading}:${isResolved}`);
                return null;
            };
            render(
                <AddressResolutionProvider resolve={resolve}>
                    {Array.from({ length: 100 }, (_, i) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: fixed list in a test
                        <Row key={i} />
                    ))}
                </AddressResolutionProvider>,
            );
            expect(resolve).toHaveBeenCalledTimes(1);
            expect(seen.every((s) => s === '-:true:false')).toBe(true);

            seen.length = 0;
            await act(() => finish({ label: 'vitalik.eth', source: 'ens' }));
            expect(seen.length).toBeGreaterThanOrEqual(100);
            expect(seen.every((s) => s === 'vitalik.eth:false:true')).toBe(true);
            expect(resolve).toHaveBeenCalledTimes(1);
        });

        it('entries beat the resolved cache, and removing an entry falls back to it', async () => {
            const resolve = jest.fn().mockResolvedValue({ label: 'vitalik.eth', source: 'ens' });
            const Probe = ({ entries }: { entries?: ReadonlyMap<string, IAddressEntry> }) => (
                <AddressResolutionProvider entries={entries} resolve={resolve}>
                    <Show address={a} />
                </AddressResolutionProvider>
            );
            const out: { current?: string } = {};
            const Show = ({ address }: { address: string }) => {
                out.current = useResolveAddress(address).label;
                return null;
            };
            const { rerender } = render(<Probe />);
            await act(async () => undefined);
            expect(out.current).toBe('vitalik.eth');

            rerender(<Probe entries={entriesOf([a, 0, own('Treasury')])} />);
            expect(out.current).toBe('Treasury');

            rerender(<Probe entries={new Map()} />);
            expect(out.current).toBe('vitalik.eth');
            expect(resolve).toHaveBeenCalledTimes(1);
        });

        it('falls back to a first resolve call when an entry that was never resolved is removed', async () => {
            const resolve = jest.fn().mockResolvedValue({ label: 'vitalik.eth', source: 'ens' });
            const out: { current?: string } = {};
            const Show = () => {
                out.current = useResolveAddress(a).label;
                return null;
            };
            const tree = (entries?: ReadonlyMap<string, IAddressEntry>) => (
                <AddressResolutionProvider entries={entries} resolve={resolve}>
                    <Show />
                </AddressResolutionProvider>
            );
            const { rerender } = render(tree(entriesOf([a, 0, own('Treasury')])));
            expect(resolve).not.toHaveBeenCalled();
            rerender(tree(new Map()));
            await act(async () => undefined);
            expect(resolve).toHaveBeenCalledTimes(1);
            expect(out.current).toBe('vitalik.eth');
        });

        it.each([
            ['null', () => Promise.resolve(null)],
            ['a rejection', () => Promise.reject(new Error('boom'))],
            [
                'a throw',
                () => {
                    throw new Error('boom');
                },
            ],
        ])('ends unresolved without a label on %s, with no second call', async (_name, resolver) => {
            const resolve = jest.fn(resolver as AddressResolver);
            const { result, rerender } = hook(a, { resolve });
            await act(async () => undefined);
            expect(result.current).toEqual({ warnings: [], isLoading: false, isResolved: true });
            rerender();
            expect(resolve).toHaveBeenCalledTimes(1);
        });

        it('gives up after 10 s and ignores a late result', async () => {
            jest.useFakeTimers();
            let finish: (entry: IAddressEntry | null) => void = () => undefined;
            const resolve = jest.fn(
                () =>
                    new Promise<IAddressEntry | null>((res) => {
                        finish = res;
                    }),
            );
            const { result } = hook(a, { resolve });
            expect(result.current.isLoading).toBe(true);
            await act(() => {
                jest.advanceTimersByTime(10_000);
            });
            expect(result.current).toEqual({ warnings: [], isLoading: false, isResolved: true });
            await act(() => finish({ label: 'late.eth', source: 'ens' }));
            expect(result.current.label).toBeUndefined();
            expect(resolve).toHaveBeenCalledTimes(1);
        });

        it('treats a resolver that never settles as unresolved', async () => {
            jest.useFakeTimers();
            const { result } = hook(a, { resolve: () => new Promise(() => undefined) });
            await act(() => {
                jest.advanceTimersByTime(10_001);
            });
            expect(result.current.isResolved).toBe(true);
        });
    });

    describe('inv. 9: wake-ups, resolver change, cache cap', () => {
        it('wakes only the components that asked about the changed address', () => {
            const counts: Record<string, number> = {};
            const Row = memo(({ address }: { address: string }) => {
                useResolveAddress(address);
                counts[address] = (counts[address] ?? 0) + 1;
                return null;
            });
            const addresses = Array.from({ length: 300 }, (_, i) => `0x${(i + 1).toString(16).padStart(40, '0')}`);
            const rows = addresses.map((x) => <Row address={x} key={x} />);
            const tree = (entries: ReadonlyMap<string, IAddressEntry>) => (
                <AddressResolutionProvider entries={entries}>{rows}</AddressResolutionProvider>
            );
            const { rerender } = render(tree(entriesOf([addresses[0], 0, own('One')])));
            for (const key of Object.keys(counts)) {
                counts[key] = 0;
            }
            rerender(tree(entriesOf([addresses[0], 0, own('One')], [addresses[1], 0, own('Two')])));
            const woken = Object.entries(counts)
                .filter(([, n]) => n > 0)
                .map(([x]) => x);
            expect(woken).toEqual([addresses[1]]);
        });

        it('clears the cache and ignores old pending results when resolve changes', async () => {
            let finishOld: (entry: IAddressEntry | null) => void = () => undefined;
            const oldResolve = jest.fn(
                () =>
                    new Promise<IAddressEntry | null>((res) => {
                        finishOld = res;
                    }),
            );
            const newResolve = jest.fn().mockResolvedValue({ label: 'new.eth', source: 'ens' });
            const out: { current?: string } = {};
            const Show = () => {
                out.current = useResolveAddress(a).label;
                return null;
            };
            const tree = (resolve: AddressResolver) => (
                <AddressResolutionProvider resolve={resolve}>
                    <Show />
                </AddressResolutionProvider>
            );
            const { rerender } = render(tree(oldResolve));
            rerender(tree(newResolve));
            await act(async () => undefined);
            expect(out.current).toBe('new.eth');
            await act(() => finishOld({ label: 'old.eth', source: 'ens' }));
            expect(out.current).toBe('new.eth');
            expect(newResolve).toHaveBeenCalledTimes(1);
        });

        it('keeps at most 5000 resolved addresses, oldest dropped first', async () => {
            const resolve = jest.fn((x: string) =>
                Promise.resolve({ label: `n${x.slice(-6)}`, source: 'ens' as const }),
            );
            const hex = (i: number) => `0x${(i + 1).toString(16).padStart(40, '0')}`;
            const Row = ({ i }: { i: number }) => {
                useResolveAddress(hex(i));
                return null;
            };
            const tree = (from: number, to: number) => (
                <AddressResolutionProvider resolve={resolve}>
                    {Array.from({ length: to - from }, (_, k) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: fixed list in a test
                        <Row i={from + k} key={from + k} />
                    ))}
                </AddressResolutionProvider>
            );
            // Rows come and go in batches, so no mounted row loses its answer while it is on screen.
            const { rerender } = render(tree(0, 1000));
            await act(async () => undefined);
            for (let from = 1000; from < 6000; from += 1000) {
                rerender(tree(from, from + 1000));
                await act(async () => undefined);
            }
            expect(resolve).toHaveBeenCalledTimes(6000);

            // The newest 5000 are cached, the oldest 1000 were dropped.
            rerender(tree(5999, 6000));
            expect(resolve).toHaveBeenCalledTimes(6000);
            rerender(tree(0, 1));
            await act(async () => undefined);
            expect(resolve).toHaveBeenCalledTimes(6001);
        }, 30_000);
    });

    describe('inv. 7: every source goes through checkLabel', () => {
        it.each(['Vault 0x123456', '０ｘ１２３４５６', 'Vault 0x1234…abcd', 'bad‮name', 'A › B'])(
            'drops %p from entries, accounts and ENS alike',
            async (label) => {
                for (const source of ['workspace', 'known-account', 'other-workspace', 'ens'] as const) {
                    const entry = { label, source, sourceLabel: 'W' };
                    const fromEntries = hook(a, { entries: entriesOf([a, 0, entry]) });
                    expect(fromEntries.result.current).toEqual({
                        warnings: ['invalid-label'],
                        isLoading: false,
                        isResolved: true,
                    });
                    const fromResolver = hook(b, { resolve: () => Promise.resolve(entry) });
                    await act(async () => undefined);
                    expect(fromResolver.result.current).toEqual({
                        warnings: ['invalid-label'],
                        isLoading: false,
                        isResolved: true,
                    });
                }
            },
        );

        it('keeps 0xDAO with a warning', () => {
            const { result } = hook(a, { entries: entriesOf([a, 0, own('0xDAO')]) });
            expect(result.current).toMatchObject({ label: '0xDAO', warnings: ['looks-like-address'] });
        });
    });

    describe('inv. 14: same-name-as-yours', () => {
        it('warns on an other-workspace name equal to an own account name for another address', () => {
            const entries = entriesOf(
                [a, 1, { label: 'Main Safe', source: 'known-account' }],
                [b, 0, other('Main Safe')],
            );
            const { result } = hook(b, { entries });
            expect(result.current).toMatchObject({ label: 'Main Safe', warnings: ['same-name-as-yours'] });
        });

        it('warns for an own alias, and for ENS names, compared in standard form', async () => {
            const entries = entriesOf([a, 0, own('Treasury')], [b, 0, other('ＴＲＥＡＳＵＲＹ')]);
            expect(hook(b, { entries }).result.current.warnings).toEqual(['same-name-as-yours']);
            const ens = hook(c, {
                entries,
                resolve: () => Promise.resolve({ label: 'treasury', source: 'ens' as const }),
            });
            await act(async () => undefined);
            expect(ens.result.current.warnings).toEqual(['same-name-as-yours']);
        });

        it('does not warn when the name is yours here (same address, this network or all)', () => {
            const entries = entriesOf([a, 0, own('Treasury')], [a, 8453, other('Treasury')]);
            const { result } = hook(a, { entries, chainId: 8453 });
            // Own all-networks name wins the tier order, so the other workspace's name is never shown.
            expect(result.current).toMatchObject({ source: 'workspace', warnings: [] });
        });

        it('warns for own Treasury on chain 1 against other-workspace Treasury on chain 8453', () => {
            const entries = entriesOf([a, 1, own('Treasury')], [a, 8453, other('Treasury')]);
            const { result } = hook(a, { entries, chainId: 8453 });
            expect(result.current).toMatchObject({ source: 'other-workspace', warnings: ['same-name-as-yours'] });
        });

        it('never counts other workspaces or ENS as yours', () => {
            const entries = entriesOf([a, 0, other('Treasury')], [b, 0, other('Treasury')]);
            expect(hook(b, { entries }).result.current.warnings).toEqual([]);
        });

        it('wakes the shown address when an own name is added', () => {
            const out: { current?: string[] } = {};
            const Show = () => {
                out.current = useResolveAddress(b).warnings;
                return null;
            };
            const tree = (entries: ReadonlyMap<string, IAddressEntry>) => (
                <AddressResolutionProvider entries={entries}>
                    <Show />
                </AddressResolutionProvider>
            );
            const { rerender } = render(tree(entriesOf([b, 0, other('Treasury')])));
            expect(out.current).toEqual([]);
            rerender(tree(entriesOf([b, 0, other('Treasury')], [a, 0, own('Treasury')])));
            expect(out.current).toEqual(['same-name-as-yours']);
        });
    });

    describe('inv. 17, 18, 19: network', () => {
        const bound = own('Base Safe', { networkLabel: 'Base' });

        it('resolves a bound entry only when the network matches', () => {
            const entries = entriesOf([a, 8453, bound]);
            const resolve = jest.fn().mockResolvedValue(null);
            expect(hook(a, { entries, resolve, chainId: 8453 }).result.current).toMatchObject({
                label: 'Base Safe',
                chainId: 8453,
                networkLabel: 'Base',
            });
            const wrong = hook(a, { entries, resolve, chainId: 1 });
            expect(wrong.result.current).toMatchObject({ isLoading: true, isResolved: false });
            expect(resolve).toHaveBeenCalledTimes(1);
            const unknown = hook(a, { entries });
            expect(unknown.result.current.label).toBeUndefined();
        });

        it('with no network known only network-0 entries resolve', () => {
            const entries = entriesOf([a, 0, own('Wallet')], [a, 8453, bound]);
            expect(hook(a, { entries }).result.current).toMatchObject({ label: 'Wallet', chainId: 0 });
        });

        it('prefers the bound entry to the all-networks entry inside a tier', () => {
            const entries = entriesOf([a, 0, own('Wallet')], [a, 8453, bound]);
            expect(hook(a, { entries, chainId: 8453 }).result.current).toMatchObject({ label: 'Base Safe' });
            expect(hook(a, { entries, chainId: 1 }).result.current).toMatchObject({ label: 'Wallet' });
        });

        it('lets the hook argument override the context network', () => {
            const entries = entriesOf([a, 8453, bound]);
            expect(hook(a, { entries, chainId: 1 }, 8453).result.current.label).toBe('Base Safe');
        });

        it('ranks across tiers: own beats the accounts, accounts beat other workspaces, then ENS', () => {
            const entries = entriesOf(
                [a, 0, own('Mine')],
                [a, 8453, other('Theirs')],
                [b, 8453, { label: 'Account', source: 'known-account' }],
                [b, 0, other('Theirs')],
                [c, 0, { label: 'x.eth', source: 'ens' }],
                [c, 8453, other('Theirs')],
            );
            expect(hook(a, { entries, chainId: 8453 }).result.current.label).toBe('Mine');
            expect(hook(b, { entries, chainId: 8453 }).result.current.label).toBe('Account');
            expect(hook(c, { entries, chainId: 8453 }).result.current.label).toBe('Theirs');
            expect(hook(c, { entries }).result.current.label).toBe('x.eth');
        });
    });

    describe('useResolveAddressText', () => {
        const text = (address: string, entries: ReadonlyMap<string, IAddressEntry>) =>
            renderHook(() => useResolveAddressText(address), { wrapper: wrapper({ entries }) }).result.current;

        it('returns the label, the text form for another workspace, or the short address', () => {
            expect(text(a, entriesOf([a, 0, own('Treasury')]))).toBe('Treasury');
            expect(text(a, entriesOf([a, 0, other('Treasury')]))).toBe('Workspace C › Treasury');
            expect(text(a, new Map())).toBe('0xd8da…6045');
            expect(text(a, entriesOf([a, 0, own('Vault 0x123456')]))).toBe('0xd8da…6045');
            expect(renderHook(() => useResolveAddressText('You')).result.current).toBe('You');
        });

        it('returns the full checksummed address instead of the short one with showCompleteAddress', () => {
            const full = (entries: ReadonlyMap<string, IAddressEntry>) =>
                renderHook(() => useResolveAddressText(a, undefined, { showCompleteAddress: true }), {
                    wrapper: wrapper({ entries }),
                }).result.current;

            expect(full(new Map())).toBe('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
            expect(full(entriesOf([a, 0, own('Treasury')]))).toBe('Treasury');
        });
    });
});
