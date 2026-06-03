/**
 * Primitive registry — the SINGLE place that maps the indexer's generic
 * primitive taxonomy (`Strategy.kind`, `Budget.kind`, `Gate.kind`, epoch) to
 * display metadata (label, venue subtitle, icon). This is the only module
 * allowed to "know" the set of primitive kinds.
 *
 * NO HARDCODE rule: keyed strictly by generic kind enums — never by DAO
 * address, token symbol, or a specific flow. Supporting a new primitive is a
 * one-line entry here; the canvas, inspector, history, and palette all read
 * through these helpers, so nothing else needs to change.
 *
 * `icon` values are the names served by the workbench icon set
 * ({@link MmIcon}); unknown kinds fall back to a neutral contract glyph.
 */

import type {
    FlowEmbeddedStrategyKind,
    IFlowEmbeddedBudget,
    IFlowEmbeddedGate,
} from '../types';

export interface IPrimitiveDisplay {
    /** Primary node/row label, e.g. "Add Liquidity". */
    label: string;
    /** Generic venue/mechanism subtitle (token-agnostic), e.g. "Uniswap V2". */
    subtitle?: string;
    /** Icon name resolved by {@link MmIcon}. */
    icon: string;
}

type StrategyKind = FlowEmbeddedStrategyKind;
type BudgetKind = IFlowEmbeddedBudget['kind'];
type GateKind = IFlowEmbeddedGate['kind'];

const STRATEGY: Record<StrategyKind, IPrimitiveDisplay> = {
    wrap: { label: 'Wrap', subtitle: 'Wrap token', icon: 'reload' },
    univ2Liquidity: {
        label: 'Add Liquidity',
        subtitle: 'Uniswap V2',
        icon: 'droplet',
    },
    gatedCowSwap: {
        label: 'Buyback',
        subtitle: 'CowSwap · gated',
        icon: 'swap',
    },
    cowSwap: { label: 'Swap', subtitle: 'CowSwap', icon: 'swap' },
    transfer: { label: 'Transfer', subtitle: 'Transfer', icon: 'withdraw' },
    epochTransfer: {
        label: 'Epoch Transfer',
        subtitle: 'Per-epoch transfer',
        icon: 'withdraw',
    },
    burn: { label: 'Burn', subtitle: 'Destroy tokens', icon: 'burn-assets' },
    unknown: { label: 'Strategy', icon: 'blockchain-smartcontract' },
};

const BUDGET: Record<BudgetKind, IPrimitiveDisplay> = {
    full: { label: 'Full Budget', icon: 'blockchain-wallet' },
    streamUntil: { label: 'Stream-Until Budget', icon: 'blockchain-wallet' },
    required: { label: 'Required Budget', icon: 'blockchain-wallet' },
    unknown: { label: 'Budget', icon: 'blockchain-wallet' },
};

const GATE: Record<GateKind, IPrimitiveDisplay> = {
    priceFloor: { label: 'Price-Floor Gate', icon: 'gate' },
    unknown: { label: 'Gate', icon: 'gate' },
};

const EPOCH: IPrimitiveDisplay = {
    label: 'Epoch Provider',
    icon: 'clock',
};

const SOURCE: IPrimitiveDisplay = {
    label: 'Vault source',
    icon: 'blockchain-wallet',
};
const RECIPIENT: IPrimitiveDisplay = {
    label: 'Recipient',
    icon: 'blockchain-block',
};

const FALLBACK: IPrimitiveDisplay = {
    label: 'Component',
    icon: 'blockchain-smartcontract',
};

/** Strategy display, falling back to the generic `unknown` entry. */
export const getStrategyDisplay = (kind: string): IPrimitiveDisplay =>
    STRATEGY[kind as StrategyKind] ?? STRATEGY.unknown;

/** Budget display, falling back to the generic `unknown` entry. */
export const getBudgetDisplay = (kind: string): IPrimitiveDisplay =>
    BUDGET[kind as BudgetKind] ?? BUDGET.unknown;

/** Gate display, falling back to the generic `unknown` entry. */
export const getGateDisplay = (kind: string): IPrimitiveDisplay =>
    GATE[kind as GateKind] ?? GATE.unknown;

export const getEpochDisplay = (): IPrimitiveDisplay => EPOCH;
export const getSourceDisplay = (): IPrimitiveDisplay => SOURCE;
export const getRecipientDisplay = (): IPrimitiveDisplay => RECIPIENT;

/**
 * Resolve display for any hanging sub-input by its role + kind. Used by the
 * canvas sub-node chips and the inspector input rows.
 */
export const getSubInputDisplay = (
    role: 'budget' | 'gate' | 'epoch',
    kind: string,
): IPrimitiveDisplay => {
    if (role === 'budget') {
        return getBudgetDisplay(kind);
    }
    if (role === 'gate') {
        return getGateDisplay(kind);
    }
    return EPOCH;
};

export const getFallbackDisplay = (): IPrimitiveDisplay => FALLBACK;
