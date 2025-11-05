'use client';

import { TokenExitQueueFeeMode } from '@/plugins/tokenPlugin/types';
import { tokenExitQueueFeeUtils } from '@/plugins/tokenPlugin/utils/tokenExitQueueFeeUtils';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useMemo, useState } from 'react';
import { Area, AreaChart, ReferenceDot, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import type { MouseHandlerDataParam } from 'recharts/types/synchronisation/types';
import type { ITokenExitQueueFeeChartProps } from './tokenExitQueueFeeChart.api';

export const TokenExitQueueFeeChart: React.FC<ITokenExitQueueFeeChartProps> = (props) => {
    const { ticket, currentTime, className } = props;

    const { t } = useTranslations();

    const [hoveredIndex, setHoveredIndex] = useState<number | undefined>(undefined);

    const mode = tokenExitQueueFeeUtils.determineFeeMode(ticket);

    // Don't render chart for fixed fee mode
    if (mode === TokenExitQueueFeeMode.FIXED) {
        return null;
    }

    const secondsPerDay = 24 * 60 * 60;

    // Chart X-axis: 0 represents queuedAt (start of queue)
    // Duration is cooldown * 2 with step centered at cooldown (midpoint)
    const fallbackDuration = Math.max(secondsPerDay, 1);
    const domainDuration = ticket.cooldown > 0 ? ticket.cooldown * 2 : fallbackDuration;

    const minFeePercent = useMemo(
        () => tokenExitQueueFeeUtils.calculateFeeAtTime({ timeElapsed: ticket.cooldown, ticket }),
        [ticket],
    );

    const pointCount = 100;

    const points = useMemo(() => {
        if (pointCount < 2) {
            return [];
        }

        if (ticket.cooldown <= 0) {
            const startFee = tokenExitQueueFeeUtils.calculateFeeAtTime({ timeElapsed: 0, ticket });
            return [
                { elapsedSeconds: 0, feePercent: startFee },
                { elapsedSeconds: domainDuration, feePercent: startFee },
            ];
        }

        // Generate points from 0 to cooldown (first phase: max fee → step/decay → min fee)
        // X-axis position 0 = queuedAt, position cooldown = queuedAt + cooldown (step point, centered)
        const firstPhasePoints = Array.from({ length: pointCount }, (_, index) => {
            const ratio = index / (pointCount - 1);
            const timeElapsed = ratio * ticket.cooldown; // Both chart position AND actual time
            const feePercent = tokenExitQueueFeeUtils.calculateFeeAtTime({ timeElapsed, ticket });

            return {
                elapsedSeconds: timeElapsed,
                feePercent,
            };
        });

        // Ensure we have a point exactly at cooldown (step point)
        if (firstPhasePoints[firstPhasePoints.length - 1]?.elapsedSeconds !== ticket.cooldown) {
            firstPhasePoints.push({ elapsedSeconds: ticket.cooldown, feePercent: minFeePercent });
        }

        // Generate plateau points from cooldown to cooldown * 2 (second phase: min fee plateau)
        const plateauPoints = Array.from({ length: pointCount }, (_, index) => {
            const ratio = index / (pointCount - 1);
            const timeElapsed = ticket.cooldown + ratio * ticket.cooldown;
            return {
                elapsedSeconds: timeElapsed,
                feePercent: minFeePercent,
            };
        });

        return [...firstPhasePoints, ...plateauPoints];
    }, [domainDuration, minFeePercent, pointCount, ticket]);

    if (points.length === 0) {
        return null;
    }

    // Calculate current position on chart (X-axis starts at queuedAt as 0)
    const timeElapsedNow = currentTime - ticket.queuedAt;
    const nowX = ticket.cooldown > 0 ? Math.min(Math.max(0, timeElapsedNow), domainDuration) : 0;

    // Calculate current fee (clamp to chart bounds)
    const boundedTimeElapsed = Math.max(0, Math.min(timeElapsedNow, ticket.cooldown * 2));
    const currentFeePercent = tokenExitQueueFeeUtils.calculateFeeAtTime({
        timeElapsed: boundedTimeElapsed,
        ticket,
    });

    const nowLabel = t('app.plugins.tokenExitQueue.feeChart.now');

    const baseTickCount = 6;
    const baseTicks =
        domainDuration === 0
            ? [0]
            : Array.from({ length: baseTickCount }, (_, index) => {
                  if (index === baseTickCount - 1) {
                      return domainDuration;
                  }
                  return (domainDuration / (baseTickCount - 1)) * index;
              });

    const tickSet = new Set<number>(baseTicks);
    tickSet.add(0); // Start of chart (queuedAt)
    if (ticket.cooldown > 0) {
        tickSet.add(ticket.minCooldown); // Min cooldown (earliest withdraw time)
        tickSet.add(ticket.cooldown); // Step point (centered on chart)
        tickSet.add(ticket.cooldown * 2); // End of chart
    }
    tickSet.add(domainDuration);

    const xAxisTicks = Array.from(tickSet).sort((a, b) => a - b);

    const dataMaxFeePercent = points.reduce((max, point) => Math.max(max, point.feePercent), currentFeePercent);
    const configuredMaxFeePercent = Math.max(ticket.feePercent / 100, 0);
    const yDomainMax = Math.max(configuredMaxFeePercent, dataMaxFeePercent, 1);

    const formatFeePercent = (value: number) => {
        if (!Number.isFinite(value)) {
            return '';
        }
        const decimals = value < 1 ? 2 : 2;
        const fixed = value.toFixed(decimals);
        const trimmed = fixed.replace(/\.0+$/, '').replace(/\.0$/, '');
        return `${trimmed}%`;
    };

    const formatElapsed = (elapsedSeconds: number) => {
        if (!Number.isFinite(elapsedSeconds)) {
            return '';
        }

        if (elapsedSeconds < secondsPerDay) {
            const minutes = Math.max(0, Math.round(elapsedSeconds / 60));
            return minutes <= 1 ? '1 min' : `${minutes} mins`;
        }

        const days = Math.max(1, Math.round(elapsedSeconds / secondsPerDay));
        return days === 1 ? 'Day 1' : `Day ${days}`;
    };

    const handleMouseMove = (state?: MouseHandlerDataParam) => {
        if (!state) {
            setHoveredIndex(undefined);
            return;
        }

        const extendedState = state as MouseHandlerDataParam & {
            activeTooltipIndex?: number | string | null;
            isTooltipActive?: boolean;
        };

        if (extendedState.isTooltipActive && extendedState.activeTooltipIndex != null) {
            const nextIndex = Number(extendedState.activeTooltipIndex);
            setHoveredIndex(Number.isFinite(nextIndex) ? nextIndex : undefined);
            return;
        }

        if (extendedState.activeIndex != null) {
            setHoveredIndex(Number(extendedState.activeIndex));
            return;
        }

        setHoveredIndex(undefined);
    };

    const hoveredPoint = hoveredIndex != null ? points[hoveredIndex] : undefined;
    const activeLabel = hoveredPoint && hoveredIndex != null ? formatElapsed(hoveredPoint.elapsedSeconds) : nowLabel;
    const activeFeePercent = hoveredPoint ? hoveredPoint.feePercent : currentFeePercent;
    const activeFeeDisplay = formatFeePercent(activeFeePercent);
    const indicatorX = hoveredPoint ? hoveredPoint.elapsedSeconds : nowX;
    const indicatorY = hoveredPoint ? hoveredPoint.feePercent : currentFeePercent;

    return (
        <div className={className}>
            <div className="relative">
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart
                        data={points}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => setHoveredIndex(undefined)}
                        margin={{ top: 12, right: 28, left: 8, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorFee" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-primary-400)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-primary-400)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="elapsedSeconds"
                            className="text-xs"
                            tickLine={false}
                            axisLine={false}
                            type="number"
                            domain={[0, domainDuration]}
                            ticks={xAxisTicks}
                            tickFormatter={(value) => formatElapsed(Number(value))}
                            tickMargin={8}
                        />
                        <YAxis
                            tickFormatter={formatFeePercent}
                            className="text-xs"
                            width={40}
                            tickLine={false}
                            axisLine={false}
                            type="number"
                            tickCount={6}
                            orientation="left"
                            dataKey="feePercent"
                            domain={[0, yDomainMax]}
                        />
                        <Area
                            type={mode === TokenExitQueueFeeMode.TIERED ? 'stepAfter' : 'linear'}
                            dataKey="feePercent"
                            activeDot={false}
                            stroke="var(--color-primary-400)"
                            strokeWidth={1}
                            fillOpacity={1}
                            fill="url(#colorFee)"
                        />
                        <ReferenceDot
                            x={indicatorX}
                            y={indicatorY}
                            r={4}
                            fill="var(--color-primary-400)"
                            stroke="var(--color-neutral-0)"
                            strokeWidth={1}
                        />
                    </AreaChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute top-3 right-3 text-right">
                    <span className="block text-xs text-neutral-500">{activeLabel}</span>
                    <span className="block text-sm font-semibold text-neutral-800">{activeFeeDisplay}</span>
                </div>
            </div>
        </div>
    );
};
