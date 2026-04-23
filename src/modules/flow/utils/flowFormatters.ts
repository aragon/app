import {
    FLOW_TOKEN_FALLBACK_COLOR,
    FLOW_TOKENS,
    type FlowPolicyStrategy,
    type FlowTokenSymbol,
    type IFlowToken,
} from '../types';

const getFlowToken = (symbol: FlowTokenSymbol): IFlowToken =>
    FLOW_TOKENS[symbol] ?? {
        symbol,
        color: FLOW_TOKEN_FALLBACK_COLOR,
        decimals: 2,
    };

/**
 * Pull-based strategies never produce a push-style "Dispatch now" action —
 * funds move when users claim or when the router settles autonomously. The
 * UI must suppress the dispatch button for these strategies even if the
 * policy is otherwise in a `ready`-like status.
 */
export const isDispatchableStrategy = (strategy: FlowPolicyStrategy): boolean =>
    strategy !== 'Claimer';

export const formatFlowAmount = (
    value: number,
    token: FlowTokenSymbol,
): string => {
    if (value === 0) {
        return '0';
    }
    const abs = Math.abs(value);
    const tokenMeta = getFlowToken(token);
    // Show two decimals for high-precision tokens (e.g. WETH), integers otherwise.
    const decimals = tokenMeta.decimals >= 3 ? 2 : 0;
    if (abs >= 1_000_000) {
        return `${(value / 1_000_000)
            .toFixed(value >= 10_000_000 ? 1 : 2)
            .replace(/\.?0+$/, '')}M`;
    }
    if (abs >= 100_000) {
        return `${(value / 1000).toFixed(0)}k`;
    }
    return value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
};

export const formatFlowAmountWithToken = (
    value: number,
    token: FlowTokenSymbol,
): string => `${formatFlowAmount(value, token)} ${token}`;

export const formatRelative = (isoDate: string, now = Date.now()): string => {
    const then = new Date(isoDate).getTime();
    const delta = now - then;
    const absDelta = Math.abs(delta);
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;
    const month = 30 * day;
    let value: number;
    let unit: string;
    if (absDelta < hour) {
        value = Math.max(1, Math.round(absDelta / minute));
        unit = 'm';
    } else if (absDelta < day) {
        value = Math.round(absDelta / hour);
        unit = 'h';
    } else if (absDelta < week * 4) {
        value = Math.round(absDelta / day);
        unit = 'd';
    } else if (absDelta < month * 12) {
        value = Math.round(absDelta / month);
        unit = 'mo';
    } else {
        value = Math.round(absDelta / (month * 12));
        unit = 'y';
    }
    return delta >= 0 ? `${value}${unit} ago` : `in ${value}${unit}`;
};

export const formatShortDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

export const getTokenColor = (token: FlowTokenSymbol): string =>
    getFlowToken(token).color;
