'use client';

import classNames from 'classnames';
import { useMemo } from 'react';
import {
    Area,
    CartesianGrid,
    ComposedChart,
    ReferenceLine,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import type { FlowEventKind, IFlowPolicy } from '../../types';
import {
    formatFlowAmount,
    formatShortDate,
    getTokenColor,
} from '../../utils/flowFormatters';
import {
    FLOW_EVENT_KIND_LABEL,
    FLOW_EVENT_KIND_TONE,
    FLOW_FAILED_COLOR,
    getFlowMarkerColor,
    type IFlowTimelineMarker,
} from './flowEventStyles';

export interface IFlowPolicyChartProps {
    policy: IFlowPolicy;
    /**
     * DAO context so the chart tooltip can hyperlink the event `proposalId`
     * to `/dao/{network}/{addressOrEns}/proposals/{proposalSlug}`. Optional —
     * without them the tooltip still renders, just non-clickable.
     */
    network?: string;
    addressOrEns?: string;
    className?: string;
}

interface IChartPoint {
    timestamp: number;
    historic: number | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export const FlowPolicyChart: React.FC<IFlowPolicyChartProps> = (props) => {
    const { policy, className } = props;
    const color = getTokenColor(policy.token);
    const id = `flowChartGradient-${policy.id}`;

    const { data, markers, cumulativeTotal, minTs, maxTs } = useMemo(() => {
        const historicSorted = [...policy.dispatches].sort(
            (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
        );

        const eventTimestamps = policy.events.map((e) =>
            new Date(e.at).getTime(),
        );
        const dispatchTimestamps = historicSorted.map((d) =>
            new Date(d.at).getTime(),
        );
        const createdAtMs = new Date(policy.createdAt).getTime();

        const earliestAnchor = Math.min(
            createdAtMs,
            ...eventTimestamps,
            ...(dispatchTimestamps.length > 0
                ? [dispatchTimestamps[0]]
                : [createdAtMs]),
        );
        const latestAnchor = Math.max(
            createdAtMs,
            ...eventTimestamps,
            ...dispatchTimestamps,
        );
        const span = Math.max(latestAnchor - earliestAnchor, DAY_MS);
        const pad = Math.max(2 * DAY_MS, span * 0.03);
        const startTs = earliestAnchor - pad;
        const endTs = latestAnchor + pad;

        const points: IChartPoint[] = [];
        let cumulative = 0;

        points.push({ timestamp: startTs, historic: 0 });

        for (const dispatch of historicSorted) {
            const ts = new Date(dispatch.at).getTime();
            if (dispatch.status !== 'failed') {
                cumulative += dispatch.amount;
            }
            points.push({ timestamp: ts, historic: cumulative });
        }

        const historicEnd = cumulative;
        points.push({ timestamp: endTs, historic: historicEnd });

        const dispatchMarkers: IFlowTimelineMarker[] = historicSorted.map(
            (dispatch) => ({
                id: `dispatch-${dispatch.id}`,
                timestamp: new Date(dispatch.at).getTime(),
                kind:
                    dispatch.status === 'failed'
                        ? 'dispatchFailed'
                        : 'dispatchOk',
                label:
                    dispatch.status === 'failed'
                        ? 'Failed dispatch'
                        : 'Dispatch',
                detail: `${formatFlowAmount(dispatch.amount, dispatch.token)} ${dispatch.token} · ${formatShortDate(dispatch.at)}${
                    dispatch.status === 'failed' && dispatch.failureReason
                        ? ` · ${dispatch.failureReason}`
                        : ''
                }`,
            }),
        );

        const eventMarkers: IFlowTimelineMarker[] = policy.events
            .filter((event) => new Date(event.at).getTime() >= startTs)
            .map((event) => ({
                id: `event-${event.id}`,
                timestamp: new Date(event.at).getTime(),
                kind: event.kind,
                label: FLOW_EVENT_KIND_LABEL[event.kind],
                detail: `${event.title} · ${formatShortDate(event.at)}${event.description ? ` · ${event.description}` : ''}`,
            }));

        const allMarkers = [...dispatchMarkers, ...eventMarkers].sort(
            (a, b) => a.timestamp - b.timestamp,
        );

        return {
            data: points,
            markers: allMarkers,
            cumulativeTotal: historicEnd,
            minTs: startTs,
            maxTs: endTs,
        };
    }, [policy]);

    const presentEventKinds = useMemo(
        () => new Set(policy.events.map((e) => e.kind)),
        [policy.events],
    );
    const hasFailedDispatch = policy.dispatches.some(
        (d) => d.status === 'failed',
    );
    const hasOkDispatch = policy.dispatches.some((d) => d.status !== 'failed');

    return (
        <div
            className={classNames(
                'flex select-none flex-col gap-3 rounded-xl border border-neutral-100 bg-neutral-0 p-4 md:p-6',
                className,
            )}
        >
            <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div className="flex flex-col">
                    <span className="font-normal text-neutral-500 text-sm leading-tight">
                        Cumulative {policy.verb}
                    </span>
                    <span className="font-semibold text-2xl text-neutral-800 leading-tight">
                        {formatFlowAmount(cumulativeTotal, policy.token)}{' '}
                        <span className="font-normal text-base text-neutral-500">
                            {policy.token}
                        </span>
                    </span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                    <LegendChip
                        color={color}
                        dim={!hasOkDispatch}
                        label={`${policy.token} dispatch`}
                    />
                    <LegendChip
                        color={FLOW_FAILED_COLOR}
                        dim={!hasFailedDispatch}
                        label="Failed dispatch"
                    />
                    {(
                        [
                            'policyInstalled',
                            'policyUninstalled',
                            'settingsUpdated',
                            'recipientsUpdated',
                            'paused',
                            'resumed',
                            'proposalApplied',
                        ] as FlowEventKind[]
                    ).map((kind) => (
                        <LegendChip
                            color={FLOW_EVENT_KIND_TONE[kind]}
                            dim={!presentEventKinds.has(kind)}
                            key={kind}
                            label={FLOW_EVENT_KIND_LABEL[kind]}
                            outline={true}
                        />
                    ))}
                </div>
            </div>

            <div className="h-[280px] w-full">
                <ResponsiveContainer height="100%" width="100%">
                    <ComposedChart
                        data={data}
                        margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
                                <stop
                                    offset="0%"
                                    stopColor={color}
                                    stopOpacity={0.22}
                                />
                                <stop
                                    offset="100%"
                                    stopColor={color}
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            stroke="#e5e7eb"
                            strokeDasharray="3 3"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="timestamp"
                            domain={[minTs, maxTs]}
                            hide={true}
                            type="number"
                        />
                        <YAxis
                            axisLine={false}
                            tick={{ fill: '#6b7280', fontSize: 11 }}
                            tickFormatter={(v: number) =>
                                formatFlowAmount(v, policy.token)
                            }
                            tickLine={false}
                            width={56}
                        />
                        <Tooltip
                            animationDuration={0}
                            content={(tooltipProps) => {
                                const payload = tooltipProps.payload as
                                    | ReadonlyArray<{ payload: IChartPoint }>
                                    | undefined;
                                return (
                                    <CumulativeTooltip
                                        active={tooltipProps.active ?? false}
                                        payload={
                                            payload
                                                ? Array.from(payload)
                                                : undefined
                                        }
                                        policy={policy}
                                    />
                                );
                            }}
                            cursor={{
                                stroke: '#9ca3af',
                                strokeDasharray: '3 3',
                            }}
                            isAnimationActive={false}
                        />
                        <Area
                            dataKey="historic"
                            fill={`url(#${id})`}
                            isAnimationActive={false}
                            stroke={color}
                            strokeWidth={2}
                            type="monotone"
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            <TimelineBand
                markers={markers}
                maxTs={maxTs}
                minTs={minTs}
                tokenColor={color}
            />

            <p className="font-normal text-neutral-500 text-xs leading-tight">
                Line shows cumulative {policy.verb} over time — hover for the
                exact value. Dots on the timeline below mark individual
                dispatches (red for failed) and lifecycle events.
            </p>
        </div>
    );
};

const LegendChip: React.FC<{
    color: string;
    label: string;
    outline?: boolean;
    dim?: boolean;
}> = ({ color, label, outline, dim }) => (
    <span
        className={classNames(
            'inline-flex items-center gap-1.5 font-normal text-neutral-500 text-xs leading-tight',
            dim && 'opacity-40',
        )}
    >
        <span
            className={classNames(
                'size-2 rounded-full',
                outline && 'ring-2 ring-neutral-0',
            )}
            style={{ backgroundColor: color }}
        />
        {label}
    </span>
);

interface ITimelineBandProps {
    markers: IFlowTimelineMarker[];
    minTs: number;
    maxTs: number;
    tokenColor: string;
}

interface ITimelineScatterPoint {
    x: number;
    y: number;
    marker: IFlowTimelineMarker;
    fill: string;
}

const TimelineBand: React.FC<ITimelineBandProps> = ({
    markers,
    minTs,
    maxTs,
    tokenColor,
}) => {
    const scatterData: ITimelineScatterPoint[] = useMemo(
        () =>
            markers.map((marker) => ({
                x: marker.timestamp,
                y: 0.5,
                marker,
                fill: getFlowMarkerColor(marker.kind, tokenColor),
            })),
        [markers, tokenColor],
    );

    return (
        <div className="h-[56px] w-full">
            <ResponsiveContainer height="100%" width="100%">
                <ScatterChart
                    margin={{ top: 4, right: 16, left: 56, bottom: 16 }}
                >
                    <XAxis
                        axisLine={{ stroke: '#e5e7eb' }}
                        dataKey="x"
                        domain={[minTs, maxTs]}
                        tick={{ fill: '#6b7280', fontSize: 11 }}
                        tickFormatter={(ts: number) =>
                            formatShortDate(new Date(ts).toISOString())
                        }
                        tickLine={{ stroke: '#e5e7eb' }}
                        type="number"
                    />
                    <YAxis
                        dataKey="y"
                        domain={[0, 1]}
                        hide={true}
                        type="number"
                    />
                    <ReferenceLine stroke="#e5e7eb" strokeWidth={1} y={0.5} />
                    <Tooltip
                        animationDuration={0}
                        content={(tooltipProps) => {
                            const payload = tooltipProps.payload as
                                | ReadonlyArray<{
                                      payload: ITimelineScatterPoint;
                                  }>
                                | undefined;
                            return (
                                <TimelineTooltip
                                    active={tooltipProps.active ?? false}
                                    payload={
                                        payload
                                            ? Array.from(payload)
                                            : undefined
                                    }
                                />
                            );
                        }}
                        cursor={false}
                        isAnimationActive={false}
                    />
                    <Scatter
                        data={scatterData}
                        isAnimationActive={false}
                        shape={(shapeProps: unknown) => (
                            <TimelineDotShape
                                {...(shapeProps as {
                                    cx?: number;
                                    cy?: number;
                                    payload?: ITimelineScatterPoint;
                                })}
                            />
                        )}
                    />
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
};

interface ITimelineDotShapeProps {
    cx?: number;
    cy?: number;
    payload?: ITimelineScatterPoint;
}

const TimelineDotShape: React.FC<ITimelineDotShapeProps> = ({
    cx = 0,
    cy = 0,
    payload,
}) => {
    if (payload == null) {
        return <g />;
    }
    return (
        <circle
            cx={cx}
            cy={cy}
            fill={payload.fill}
            r={4}
            stroke="#ffffff"
            strokeWidth={1.5}
        />
    );
};

interface ITimelineTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: ITimelineScatterPoint }>;
}

const TimelineTooltip: React.FC<ITimelineTooltipProps> = ({
    active,
    payload,
}) => {
    if (!active || payload == null || payload.length === 0) {
        return null;
    }
    const { marker, fill } = payload[0].payload;
    return (
        <div className="flex min-w-[200px] max-w-[280px] flex-col gap-1 rounded-lg border border-neutral-100 bg-neutral-0 p-3 shadow-neutral">
            <div className="flex items-center gap-2">
                <span
                    aria-hidden={true}
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: fill }}
                />
                <span className="font-semibold text-neutral-800 text-sm leading-tight">
                    {marker.label}
                </span>
            </div>
            <span className="font-normal text-neutral-500 text-xs leading-snug">
                {marker.detail}
            </span>
        </div>
    );
};

interface ICumulativeTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: IChartPoint }>;
    policy: IFlowPolicy;
}

const CumulativeTooltip: React.FC<ICumulativeTooltipProps> = (props) => {
    const { active, payload, policy } = props;
    if (!active || payload == null || payload.length === 0) {
        return null;
    }
    const point = payload[0].payload;
    return (
        <div className="flex min-w-[180px] flex-col gap-1 rounded-lg border border-neutral-100 bg-neutral-0 p-3 shadow-neutral">
            <span className="font-normal text-neutral-500 text-xs leading-tight">
                {formatShortDate(new Date(point.timestamp).toISOString())}
            </span>
            <span className="font-semibold text-base text-neutral-800 tabular-nums leading-tight">
                {formatFlowAmount(point.historic ?? 0, policy.token)}{' '}
                <span className="font-normal text-neutral-500 text-sm">
                    {policy.token}
                </span>
            </span>
            <span className="font-normal text-neutral-500 text-xs leading-tight">
                Cumulative {policy.verb}
            </span>
        </div>
    );
};
