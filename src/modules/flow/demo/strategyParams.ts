'use client';

// LMM_DEMO_HACK: swap/strategy config parameters (slippage, target token,
// oracle staleness) are NOT part of the indexer's generic taxonomy — they only
// exist on the inspected `TopologyGraph`. This thin reader projects them into
// generic `{label, value}` display pairs keyed by strategy address, so the
// canvas/inspector can render them without any per-strategy knowledge. Outside
// demo mode there is no topology and this simply yields an empty map.
//
// Production removal: when the indexer surfaces strategy config (e.g. on
// `DispatcherSettingsUpdated`), source these from `IFlowEmbeddedStrategy`
// instead and delete this file.

import type { StrategyNode, TopologyGraph } from '@/shared/lidoPreview';
import type { IFlowStrategyParam } from '../canvas/flowGraphTypes';

/** Basis points → percent string, e.g. 50 → "0.50%". */
const pct = (bps: number | bigint): string =>
    `${(Number(bps) / 100).toFixed(2)}%`;

/** Seconds → compact hours/minutes, e.g. 3600 → "1h", 1800 → "30m". */
const maxAge = (seconds: bigint): string => {
    const s = Number(seconds);
    if (s % 3600 === 0) {
        return `${s / 3600}h`;
    }
    if (s >= 60) {
        return `${Math.round(s / 60)}m`;
    }
    return `${s}s`;
};

const paramsForStrategy = (node: StrategyNode): IFlowStrategyParam[] => {
    switch (node.kind) {
        case 'strategy.dispatch.lido.univ2-liquidity':
            return [
                { label: 'Max slippage', value: pct(node.maxSlippageBps) },
                { label: 'Oracle max age', value: maxAge(node.maxStaleness) },
            ];
        case 'strategy.dispatch.lido.gated-cowswap':
            return [
                { label: 'Buys', value: node.targetToken.symbol ?? '—' },
                { label: 'Max slippage', value: pct(node.maxSlippageBps) },
                { label: 'Oracle max age', value: maxAge(node.maxStaleness) },
            ];
        default:
            return [];
    }
};

/**
 * Build a `strategyAddress(lowercased) → display params` map from a topology.
 * Strategies with no surfaced params are omitted.
 */
export const strategyParamsByAddress = (
    topology: TopologyGraph | null,
): Map<string, IFlowStrategyParam[]> => {
    const map = new Map<string, IFlowStrategyParam[]>();
    if (topology?.root.kind !== 'plugin.dispatch') {
        return map;
    }
    for (const node of topology.root.strategies) {
        const params = paramsForStrategy(node);
        if (params.length > 0) {
            map.set(node.address.toLowerCase(), params);
        }
    }
    return map;
};
