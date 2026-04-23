'use client';

import { useMemo } from 'react';
import {
    Area,
    ComposedChart,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import type { FlowTokenSymbol, IFlowDispatch, IFlowEvent } from '../../types';
import {
    formatFlowAmount,
    formatShortDate,
    getTokenColor,
} from '../../utils/flowFormatters';
import {
    FLOW_EVENT_KIND_LABEL,
    getFlowMarkerColor,
    type IFlowTimelineMarker,
} from '../flowPolicyChart/flowEventStyles';

export interface IFlowSparklineProps {
    dispatches: IFlowDispatch[];
    events: IFlowEvent[];
    installedAt: string;
    token: FlowTokenSymbol;
    /**
     * Total vertical space (curve + timeline band). Defaults to a compact 72px
     * that still leaves enough room to host a 2-tone event strip under the
     * cumulative curve.
     */
    height?: number;
}

interface ISparklinePoint {
    timestamp: number;
    historic: number;
}

interface ISparklineTimelinePoint {
    x: number;
    y: number;
    marker: IFlowTimelineMarker;
    fill: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export const FlowSparkline: React.FC<IFlowSparklineProps> = (props) => {
    const { dispatches, events, installedAt, token, height = 72 } = props;

    const { data, markers, minTs, maxTs } = useMemo(() => {
        const sorted = [...dispatches].sort(
            (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
        );
        const installedAtMs = new Date(installedAt).getTime();
        // Use the last dispatch (or install) as the "now" anchor so the
        // render stays deterministic between SSR and first client paint —
        // `Date.now()` would drift between the two.
        const lastDispatchMs = sorted.length
            ? new Date(sorted.at(-1)!.at).getTime()
            : installedAtMs;
        const lastEventMs = events.length
            ? Math.max(...events.map((e) => new Date(e.at).getTime()))
            : installedAtMs;
        const nowTs = Math.max(installedAtMs, lastDispatchMs, lastEventMs);

        const span = Math.max(nowTs - installedAtMs, DAY_MS);
        const pad = Math.max(DAY_MS, span * 0.03);

        const points: ISparklinePoint[] = [
            { timestamp: installedAtMs, historic: 0 },
        ];
        const dispatchMarkers: IFlowTimelineMarker[] = [];
        let cumulative = 0;
        for (const dispatch of sorted) {
            const ts = new Date(dispatch.at).getTime();
            if (dispatch.status !== 'failed') {
                cumulative += dispatch.amount;
            }
            points.push({ timestamp: ts, historic: cumulative });
            dispatchMarkers.push({
                id: `dispatch-${dispatch.id}`,
                timestamp: ts,
                kind:
                    dispatch.status === 'failed'
                        ? 'dispatchFailed'
                        : 'dispatchOk',
                label:
                    dispatch.status === 'failed'
                        ? 'Failed dispatch'
                        : 'Dispatch',
                detail: `${formatFlowAmount(dispatch.amount, dispatch.token)} ${dispatch.token} · ${formatShortDate(dispatch.at)}`,
            });
        }
        // Trailing flat segment so the area extends to the right edge of the
        // domain instead of stopping at the last tick.
        points.push({ timestamp: nowTs, historic: cumulative });

        const eventMarkers: IFlowTimelineMarker[] = events.map((event) => ({
            id: `event-${event.id}`,
            timestamp: new Date(event.at).getTime(),
            kind: event.kind,
            label: FLOW_EVENT_KIND_LABEL[event.kind],
            detail: `${event.title} · ${formatShortDate(event.at)}`,
        }));

        const allMarkers = [...dispatchMarkers, ...eventMarkers].sort(
            (a, b) => a.timestamp - b.timestamp,
        );

        return {
            data: points,
            markers: allMarkers,
            minTs: installedAtMs - pad,
            maxTs: nowTs + pad,
        };
    }, [dispatches, events, installedAt]);

    const color = getTokenColor(token);
    const id = `flowSparkGradient-${token}`;

    // Reserve a constant slice for the timeline band so the curve stays
    // visually stable across cards regardless of `height` prop. 24px fits a
    // single row of 6px dots plus a bit of padding.
    const timelineHeight = 24;
    const areaHeight = Math.max(height - timelineHeight, 32);

    const scatterData: ISparklineTimelinePoint[] = markers.map((marker) => ({
        x: marker.timestamp,
        y: 0.5,
        marker,
        fill: getFlowMarkerColor(marker.kind, color),
    }));

    return (
        <div
            className="flex w-full select-none flex-col"
            style={{ height: `${height}px` }}
        >
            <div style={{ height: `${areaHeight}px` }}>
                <ResponsiveContainer height="100%" width="100%">
                    <ComposedChart
                        data={data}
                        margin={{ top: 2, right: 0, left: 0, bottom: 2 }}
                    >
                        <defs>
                            <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
                                <stop
                                    offset="0%"
                                    stopColor={color}
                                    stopOpacity={0.25}
                                />
                                <stop
                                    offset="100%"
                                    stopColor={color}
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="timestamp"
                            domain={[minTs, maxTs]}
                            hide={true}
                            type="number"
                        />
                        <YAxis hide={true} />
                        <Area
                            dataKey="historic"
                            fill={`url(#${id})`}
                            isAnimationActive={false}
                            stroke={color}
                            strokeWidth={1.5}
                            type="monotone"
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
            <div style={{ height: `${timelineHeight}px` }}>
                <ResponsiveContainer height="100%" width="100%">
                    <ScatterChart
                        margin={{ top: 2, right: 0, left: 0, bottom: 2 }}
                    >
                        <XAxis
                            dataKey="x"
                            domain={[minTs, maxTs]}
                            hide={true}
                            type="number"
                        />
                        <YAxis
                            dataKey="y"
                            domain={[0, 1]}
                            hide={true}
                            type="number"
                        />
                        <Tooltip
                            animationDuration={0}
                            content={(tooltipProps) => {
                                const payload = tooltipProps.payload as
                                    | ReadonlyArray<{
                                          payload: ISparklineTimelinePoint;
                                      }>
                                    | undefined;
                                if (
                                    tooltipProps.active !== true ||
                                    payload == null ||
                                    payload.length === 0
                                ) {
                                    return null;
                                }
                                const { marker, fill } = payload[0].payload;
                                return (
                                    <div className="flex min-w-[180px] max-w-[240px] flex-col gap-1 rounded-lg border border-neutral-100 bg-neutral-0 p-2 shadow-neutral">
                                        <div className="flex items-center gap-2">
                                            <span
                                                aria-hidden={true}
                                                className="size-2 shrink-0 rounded-full"
                                                style={{
                                                    backgroundColor: fill,
                                                }}
                                            />
                                            <span className="font-semibold text-neutral-800 text-xs leading-tight">
                                                {marker.label}
                                            </span>
                                        </div>
                                        <span className="font-normal text-neutral-500 text-xs leading-snug">
                                            {marker.detail}
                                        </span>
                                    </div>
                                );
                            }}
                            cursor={false}
                            isAnimationActive={false}
                        />
                        <Scatter
                            data={scatterData}
                            isAnimationActive={false}
                            shape={(shapeProps: unknown) => {
                                const { cx, cy, payload } = shapeProps as {
                                    cx?: number;
                                    cy?: number;
                                    payload?: ISparklineTimelinePoint;
                                };
                                if (
                                    cx == null ||
                                    cy == null ||
                                    payload == null
                                ) {
                                    return <g data-empty="true" />;
                                }
                                return (
                                    <circle
                                        cx={cx}
                                        cy={cy}
                                        fill={payload.fill}
                                        r={3}
                                        stroke="#ffffff"
                                        strokeWidth={1}
                                    />
                                );
                            }}
                        />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
