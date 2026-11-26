import { addressUtils } from '../../utils';
import {
    ADDRESS_SOURCE_TIERS,
    type AddressWarning,
    checkLabel,
    type IAddressEntry,
    normalizeName,
} from './addressLabelUtils';

export type AddressResolver = (address: string) => Promise<IAddressEntry | null>;

export interface IResolvedAddress {
    label?: string;
    source?: IAddressEntry['source'];
    sourceLabel?: string;
    /**
     * Network of the entry found: `0` for all networks. Set together with the label.
     */
    chainId?: number;
    networkLabel?: string;
    warnings: AddressWarning[];
    isLoading: boolean;
    isResolved: boolean;
}

export const RESOLVE_TIMEOUT_MS = 10_000;
export const MAX_RESOLVED_ADDRESSES = 5000;

const NOT_RESOLVED: IResolvedAddress = { warnings: [], isLoading: false, isResolved: true };

const isOwn = (entry: IAddressEntry) => entry.source === 'workspace' || entry.source === 'known-account';

const parseKey = (key: string) => {
    const index = key.lastIndexOf(':');
    const address = key.slice(0, index).toLowerCase();
    const chainId = Number(key.slice(index + 1));

    return index > 0 && addressUtils.isAddress(address) && Number.isInteger(chainId) && chainId >= 0
        ? { address, chainId }
        : undefined;
};

const isSameEntry = (a?: IAddressEntry, b?: IAddressEntry) =>
    a === b ||
    (a != null &&
        b != null &&
        a.label === b.label &&
        a.source === b.source &&
        a.sourceLabel === b.sourceLabel &&
        a.networkLabel === b.networkLabel);

/**
 * Holds the entries of the app and what the resolver returned, and tells each address when its own result changes.
 * One store per provider. It has no React in it, so it can be tested alone.
 */
export class AddressResolutionStore {
    // address (lowercase) => chain id => entry, built from the entries of the app.
    private byAddress = new Map<string, Map<number, IAddressEntry>>();
    // normalised name of your own entries => keys that carry it.
    private ownNames = new Map<string, Set<string>>();
    private entries: ReadonlyMap<string, IAddressEntry> = new Map();

    // What the resolver returned, `null` included, oldest first. Keyed by address only.
    private cache = new Map<string, IAddressEntry | null>();
    private pending = new Set<string>();
    private resolver?: AddressResolver;
    // Changes with the resolver, so the results of an older one are ignored.
    private generation = 0;

    private versions = new Map<string, number>();
    private listeners = new Map<string, Set<() => void>>();

    constructor(entries?: ReadonlyMap<string, IAddressEntry>, resolver?: AddressResolver) {
        this.resolver = resolver;
        this.index(entries ?? new Map());
    }

    subscribe = (address: string, listener: () => void) => {
        const listeners = this.listeners.get(address) ?? new Set();
        listeners.add(listener);
        this.listeners.set(address, listeners);

        return () => {
            listeners.delete(listener);
            if (listeners.size === 0) {
                this.listeners.delete(address);
            }
        };
    };

    /**
     * A number that changes when the result for the address may have changed.
     */
    getVersion = (address: string) => this.versions.get(address) ?? 0;

    /**
     * Result for a valid address on a network. Anything else is not resolved and has no label.
     */
    get = (value: string | undefined, chainId?: number): IResolvedAddress => {
        if (value == null || !addressUtils.isAddress(value)) {
            return NOT_RESOLVED;
        }

        const address = value.toLowerCase();
        const hit = this.pick(address, chainId) ?? this.fromCache(address);

        if (hit == null) {
            const isLoading = this.needsResolve(address, chainId);

            return { warnings: [], isLoading, isResolved: !isLoading };
        }

        const checked = checkLabel(hit.entry);

        if (!checked.ok) {
            return { warnings: ['invalid-label'], isLoading: false, isResolved: true };
        }

        const warnings: AddressWarning[] = [...checked.warnings];

        if (this.isNameOfSomeoneElseThatMatchesYours(hit.entry, address, chainId)) {
            warnings.push('same-name-as-yours');
        }

        const { label, source, sourceLabel, networkLabel } = hit.entry;

        return {
            label,
            source,
            chainId: hit.chainId,
            warnings,
            isLoading: false,
            isResolved: true,
            ...(sourceLabel != null && { sourceLabel }),
            ...(networkLabel != null && { networkLabel }),
        };
    };

    /**
     * Whether the resolver has to be asked about this address: nothing is known for the network and the resolver was
     * not asked yet.
     */
    needsResolve = (address: string, chainId?: number) =>
        this.resolver != null && !this.cache.has(address) && this.pick(address, chainId) == null;

    /**
     * Asks the resolver about the address, at most once, with a time limit. The result is ignored when the resolver was
     * replaced in the meantime or when it came after the limit.
     */
    request = (address: string) => {
        const resolver = this.resolver;

        if (resolver == null || this.cache.has(address) || this.pending.has(address)) {
            return;
        }

        const generation = this.generation;
        this.pending.add(address);

        let isSettled = false;
        const settle = (entry: IAddressEntry | null) => {
            if (isSettled || generation !== this.generation) {
                return;
            }

            isSettled = true;
            clearTimeout(timer);
            this.pending.delete(address);
            this.store(address, entry);
        };

        const timer = setTimeout(() => settle(null), RESOLVE_TIMEOUT_MS);

        try {
            resolver(address).then(
                (entry) => settle(entry ?? null),
                () => settle(null),
            );
        } catch {
            settle(null);
        }
    };

    setResolver = (resolver?: AddressResolver) => {
        if (resolver === this.resolver) {
            return;
        }

        this.resolver = resolver;
        this.generation += 1;
        this.cache.clear();
        this.pending.clear();
        this.notify(new Set(this.listeners.keys()));
    };

    setEntries = (next: ReadonlyMap<string, IAddressEntry> = new Map()) => {
        if (next === this.entries) {
            return;
        }

        const previous = this.entries;
        const previousOwnNames = this.ownNames;
        const changed = new Set<string>();

        for (const [key, entry] of previous) {
            if (!isSameEntry(entry, next.get(key))) {
                changed.add(key);
            }
        }

        for (const [key, entry] of next) {
            if (!isSameEntry(entry, previous.get(key))) {
                changed.add(key);
            }
        }

        this.index(next);

        const addresses = new Set<string>();
        for (const key of changed) {
            const parsed = parseKey(key);
            if (parsed != null) {
                addresses.add(parsed.address);
            }
        }

        // A change of your own names can add or remove `same-name-as-yours` on shown names of others.
        const changedNames = new Set<string>();
        for (const name of new Set([...previousOwnNames.keys(), ...this.ownNames.keys()])) {
            const before = previousOwnNames.get(name);
            const after = this.ownNames.get(name);
            if (before?.size !== after?.size || [...(before ?? [])].some((key) => !after?.has(key))) {
                changedNames.add(name);
            }
        }

        if (changedNames.size > 0) {
            for (const address of this.listeners.keys()) {
                if (this.hasCandidateNamed(address, changedNames)) {
                    addresses.add(address);
                }
            }
        }

        this.notify(addresses);
    };

    private index = (entries: ReadonlyMap<string, IAddressEntry>) => {
        this.entries = entries;
        this.byAddress = new Map();
        this.ownNames = new Map();

        for (const [key, entry] of entries) {
            const parsed = parseKey(key);

            if (parsed == null || !entry?.label) {
                continue;
            }

            const chains = this.byAddress.get(parsed.address) ?? new Map<number, IAddressEntry>();
            chains.set(parsed.chainId, entry);
            this.byAddress.set(parsed.address, chains);

            if (isOwn(entry)) {
                const name = normalizeName(entry.label);
                const keys = this.ownNames.get(name) ?? new Set<string>();
                keys.add(`${parsed.address}:${parsed.chainId}`);
                this.ownNames.set(name, keys);
            }
        }
    };

    // The entry of the first tier that has one, the one for the network before the one for all networks.
    private pick = (address: string, chainId?: number) => {
        const chains = this.byAddress.get(address);

        if (chains == null) {
            return undefined;
        }

        const candidates = chainId != null && chainId !== 0 ? [chainId, 0] : [0];

        for (const tier of ADDRESS_SOURCE_TIERS) {
            for (const candidate of candidates) {
                const entry = chains.get(candidate);

                if (entry?.source === tier) {
                    return { entry, chainId: candidate };
                }
            }
        }

        return undefined;
    };

    private fromCache = (address: string) => {
        const entry = this.cache.get(address);

        return entry?.label ? { entry, chainId: 0 } : undefined;
    };

    private store = (address: string, entry: IAddressEntry | null) => {
        this.cache.set(address, entry);

        if (this.cache.size > MAX_RESOLVED_ADDRESSES) {
            const oldest = this.cache.keys().next().value;
            if (oldest != null) {
                this.cache.delete(oldest);
            }
        }

        this.notify(new Set([address]));
    };

    private isNameOfSomeoneElseThatMatchesYours = (entry: IAddressEntry, address: string, chainId?: number) => {
        if (isOwn(entry)) {
            return false;
        }

        const keys = this.ownNames.get(normalizeName(entry.label));

        if (keys == null) {
            return false;
        }

        const hereKeys = [`${address}:0`, ...(chainId != null && chainId !== 0 ? [`${address}:${chainId}`] : [])];

        return !hereKeys.some((key) => keys.has(key));
    };

    private hasCandidateNamed = (address: string, names: Set<string>) => {
        const candidates = [...(this.byAddress.get(address)?.values() ?? []), this.cache.get(address)];

        return candidates.some((entry) => entry != null && !isOwn(entry) && names.has(normalizeName(entry.label)));
    };

    private notify = (addresses: Set<string>) => {
        for (const address of addresses) {
            this.versions.set(address, this.getVersion(address) + 1);

            for (const listener of this.listeners.get(address) ?? []) {
                listener();
            }
        }
    };
}
