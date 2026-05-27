import type { FlowEventKind } from '../../types';

export const FLOW_FAILED_COLOR = '#dc2626';
// Skipped dispatches (gate closed, etc) — a softer warm grey so they read
// as "neither success nor failure" but stay distinguishable from on-time
// dispatches.  Used by the timeline marker and the cumulative tooltip.
export const FLOW_SKIPPED_COLOR = '#a16207';
// Swap dispatch markers — slightly heavier accent than `dispatchOk` so the
// chart legend can call out swap legs (relevant for the LMM demo where
// gated CowSwap dispatches are the main flow).
export const FLOW_SWAP_COLOR = '#0891b2';

/**
 * Human-readable labels for lifecycle events. Shared between the big policy
 * chart and the overview sparkline so their tooltips stay consistent.
 */
export const FLOW_EVENT_KIND_LABEL: Record<FlowEventKind, string> = {
    policyInstalled: 'Installed',
    policyUninstalled: 'Uninstalled',
    paused: 'Paused',
    resumed: 'Resumed',
    settingsUpdated: 'Settings',
    proposalApplied: 'Proposal',
    recipientsUpdated: 'Recipients',
    dispatchFailed: 'Failed',
};

/**
 * Marker colors for lifecycle events. Picked to be easily distinguishable from
 * each other AND from token colors (USDC #2775ca, MERC #003bf5, WETH #1f2933).
 *
 * Loosely grouped by semantics:
 * - positive / active:   install (emerald), resumed (lime)
 * - negative / terminal: uninstalled (dark red), failed (bright red)
 * - attention:           paused (amber)
 * - governance / config: settings (indigo), proposal (violet), recipients (pink)
 */
export const FLOW_EVENT_KIND_TONE: Record<FlowEventKind, string> = {
    // Neutral installed marker (was emerald #10b981) — keeps the chart
    // monochromatic so the user's eye lands on the dispatched markers
    // instead of the lifecycle column.  Aligns with `flowStatusDot`'s
    // neutralisation and the Aragon palette in general.
    policyInstalled: '#475569',
    policyUninstalled: '#991b1b',
    paused: '#f59e0b',
    resumed: '#3b82f6',
    settingsUpdated: '#6366f1',
    proposalApplied: '#a855f7',
    recipientsUpdated: '#ec4899',
    dispatchFailed: FLOW_FAILED_COLOR,
};

export type FlowMarkerKind =
    | 'dispatchOk'
    | 'dispatchFailed'
    | 'dispatchSkipped'
    | 'dispatchSwap'
    | FlowEventKind;

export interface IFlowTimelineMarker {
    id: string;
    timestamp: number;
    kind: FlowMarkerKind;
    label: string;
    detail: string;
}

export const getFlowMarkerColor = (
    kind: FlowMarkerKind,
    tokenColor: string,
): string => {
    if (kind === 'dispatchOk') {
        return tokenColor;
    }
    if (kind === 'dispatchFailed') {
        return FLOW_FAILED_COLOR;
    }
    if (kind === 'dispatchSkipped') {
        return FLOW_SKIPPED_COLOR;
    }
    if (kind === 'dispatchSwap') {
        return FLOW_SWAP_COLOR;
    }
    return FLOW_EVENT_KIND_TONE[kind];
};
