/**
 * Client-side address → name resolver for the Flow module.
 *
 * Built from the pieces we already have in memory:
 *   1. The DAO itself (`dao.name`, `dao.ens`, `dao.avatar`).
 *   2. The DAO's linked accounts (child DAOs / treasury spokes).
 *   3. REST policies returned by `/v2/policies` (so router / sub-router addresses
 *      render as "USDC stream" instead of `0x12…abcd`).
 *   4. Well-known burn addresses (zero + the `0xdead` sentinel).
 *
 * This mirrors the backend `AddressMapper` used by the dispatch-simulation feature,
 * but runs on the client so the Flow dashboard doesn't need an extra backend roundtrip
 * to hydrate names. ENS lookups for unknown addresses are handled separately at
 * render time (see `FlowAddressLabel`), so this resolver is intentionally synchronous.
 */

import type {
    IDaoPolicy,
    ILinkedAccountSummary,
} from '@/shared/api/daoService';

export type FlowAddressRole =
    | 'dao'
    | 'linkedaccount'
    | 'router'
    | 'subrouter'
    | 'burn';

export interface IFlowAddressBookEntry {
    /**
     * Human-readable label shown in place of the raw address. Guaranteed non-empty.
     */
    label: string;
    role: FlowAddressRole;
    /**
     * Optional avatar URL (typically only available for DAOs / linked accounts).
     */
    avatar?: string | null;
    /**
     * ENS name when known ahead of time (e.g. DAO ENS set in REST). Distinct from
     * the ENS resolved asynchronously by `useEnsName`.
     */
    ens?: string | null;
    /**
     * Additional context surfaced in the UI under the label when non-empty —
     * e.g. the `policyKey` of a REST policy ("router · drainRatioRouter").
     */
    subtitle?: string;
}

export interface IFlowAddressBook {
    /**
     * Returns the known entry for the given EVM address (case-insensitive), or
     * `undefined` if the address isn't in the book. The caller is expected to fall
     * back to ENS / truncate rendering in that case.
     */
    resolve: (address: string) => IFlowAddressBookEntry | undefined;
    /**
     * Number of entries in the book — exposed for debugging / memoization keys.
     */
    size: number;
}

const BURN_ADDRESSES: Record<string, string> = {
    '0x0000000000000000000000000000000000000000': 'Zero address',
    '0x000000000000000000000000000000000000dead': 'Burn address',
};

export interface IFlowAddressBookSourceDao {
    address: string;
    name?: string | null;
    ens?: string | null;
    avatar?: string | null;
}

export interface IBuildFlowAddressBookParams {
    dao?: IFlowAddressBookSourceDao;
    linkedAccounts?: readonly ILinkedAccountSummary[];
    restPolicies?: readonly IDaoPolicy[];
}

const normalizeAddress = (address: string): string => address.toLowerCase();

const safeLabel = (
    candidate: string | null | undefined,
    fallback: string,
): string => {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
        return candidate.trim();
    }
    return fallback;
};

/**
 * Build a synchronous address → label map from the DAO's known context. The
 * returned book is stable for a given set of inputs — wrap the call in
 * `useMemo` if you care about referential equality.
 */
export const buildFlowAddressBook = (
    params: IBuildFlowAddressBookParams,
): IFlowAddressBook => {
    const entries = new Map<string, IFlowAddressBookEntry>();

    // Burn addresses take the lowest precedence so a DAO that happens to use a
    // burn address for some reason still wins.
    for (const [addr, label] of Object.entries(BURN_ADDRESSES)) {
        entries.set(normalizeAddress(addr), {
            label,
            role: 'burn',
        });
    }

    // REST policies — each plugin address gets a label like "Salary stream". We
    // add these before the DAO + linked accounts so the DAO's address can
    // override a rare collision (shouldn't happen, but cheap safety).
    for (const policy of params.restPolicies ?? []) {
        if (!policy.address) {
            continue;
        }
        const role: FlowAddressRole =
            (policy.strategy?.subRouters?.length ?? 0) > 0
                ? 'router'
                : 'subrouter';
        const label = safeLabel(
            policy.name,
            `${policy.policyKey ?? role} plugin`,
        );
        entries.set(normalizeAddress(policy.address), {
            label,
            role,
            subtitle: policy.policyKey ?? undefined,
        });
    }

    if (params.dao) {
        const { address, name, ens, avatar } = params.dao;
        if (address) {
            entries.set(normalizeAddress(address), {
                label: safeLabel(name, safeLabel(ens, 'DAO')),
                role: 'dao',
                avatar: avatar ?? undefined,
                ens: ens ?? undefined,
            });
        }
    }

    for (const linked of params.linkedAccounts ?? []) {
        if (!linked.address) {
            continue;
        }
        entries.set(normalizeAddress(linked.address), {
            label: safeLabel(linked.name, safeLabel(linked.ens, 'Linked DAO')),
            role: 'linkedaccount',
            avatar: linked.avatar ?? undefined,
            ens: linked.ens ?? undefined,
        });
    }

    return {
        resolve: (address: string) => {
            if (!address) {
                return undefined;
            }
            return entries.get(normalizeAddress(address));
        },
        size: entries.size,
    };
};

/**
 * Empty book — useful as a default so mappers don't have to guard against
 * `undefined` every time they call `resolve`.
 */
export const EMPTY_FLOW_ADDRESS_BOOK: IFlowAddressBook = buildFlowAddressBook(
    {},
);
