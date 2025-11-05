'use client';

import { TokenExitQueueFeeMode } from '@/plugins/tokenPlugin/types';
import { tokenExitQueueFeeUtils } from '@/plugins/tokenPlugin/utils/tokenExitQueueFeeUtils';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useMemo, useState } from 'react';
import { Area, AreaChart, ReferenceDot, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import type { MouseHandlerDataParam } from 'recharts/types/synchronisation/types';
import { type ITokenExitQueueFeeChartProps } from './tokenExitQueueFeeChart.api';

export const TokenExitQueueFeeChart: React.FC<ITokenExitQueueFeeChartProps> = (props) => {
    const { ticket, currentTime, className } = props;

    const { t } = useTranslations();

    const [hoveredIndex, setHoveredIndex] = useState<number | undefined>(undefined);

    const mode = tokenExitQueueFeeUtils.determineFeeMode(ticket);
    const isFixedMode = mode === TokenExitQueueFeeMode.FIXED;

    const secondsPerDay = 24 * 60 * 60;

    const decayDuration = Math.max(ticket.cooldown - ticket.minCooldown, 0);
    const fallbackDuration = Math.max(secondsPerDay, 1);
    const domainDuration = decayDuration > 0 ? decayDuration * 2 : fallbackDuration;

    const minFeePercent = useMemo(() => {
        return tokenExitQueueFeeUtils.calculateFeeAtTime({ timeElapsed: ticket.cooldown, ticket });
    }, [ticket]);

    const points = useMemo(() => {
        if (isFixedMode) {
            return [];
        }

        if (decayDuration <= 0) {
            const startFee = tokenExitQueueFeeUtils.calculateFeeAtTime({ timeElapsed: ticket.minCooldown, ticket });
            return [
                { elapsedSeconds: 0, feePercent: startFee },
                { elapsedSeconds: domainDuration, feePercent: startFee },
            ];
        }

        const firstPhasePoints = Array.from({ length: CHART_POINT_COUNT }, (_, index) => {
            const ratio = index / (CHART_POINT_COUNT - 1);
            const xPosition = ratio * decayDuration;
            const timeElapsed = ticket.minCooldown + xPosition;
            const feePercent = tokenExitQueueFeeUtils.calculateFeeAtTime({ timeElapsed, ticket });

            return {
                elapsedSeconds: xPosition,
                feePercent,
            };
        });

        if (firstPhasePoints[firstPhasePoints.length - 1]?.elapsedSeconds !== decayDuration) {
            firstPhasePoints.push({ elapsedSeconds: decayDuration, feePercent: minFeePercent });
        }

        const plateauPoints = Array.from({ length: CHART_POINT_COUNT }, (_, index) => {
            const ratio = index / (CHART_POINT_COUNT - 1);
            const xPosition = decayDuration + ratio * decayDuration;
            return {
                elapsedSeconds: xPosition,
                feePercent: minFeePercent,
            };
        });

        return [...firstPhasePoints, ...plateauPoints];
    }, [decayDuration, domainDuration, isFixedMode, minFeePercent, ticket]);

    if (isFixedMode || points.length === 0) {
        return null;
    }

    const timeElapsedNow = currentTime - ticket.queuedAt;
    const elapsedSinceMinCooldown = Math.max(0, timeElapsedNow - ticket.minCooldown);
    const nowX = decayDuration > 0 ? Math.min(elapsedSinceMinCooldown, domainDuration) : 0;

    const boundedTimeElapsed = Math.max(
        ticket.minCooldown,
        Math.min(timeElapsedNow, ticket.cooldown + ticket.cooldown),
    );
    const currentFeePercent = tokenExitQueueFeeUtils.calculateFeeAtTime({
        timeElapsed: boundedTimeElapsed,
        ticket,
    });

    const nowLabel = t('app.plugins.tokenExitQueue.feeChart.now');

    const minuteDuration = Math.round(domainDuration / 60);
    const baseTickCount = Math.min(6, Math.max(2, minuteDuration + 1));
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
    tickSet.add(0);
    if (decayDuration > 0) {
        tickSet.add(decayDuration);
        tickSet.add(decayDuration * 2);
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

    const formatElapsed = (elapsedSeconds: number, isLastTick = false) => {
        if (!Number.isFinite(elapsedSeconds)) {
            return '';
        }

        let formatted: string;
        if (elapsedSeconds < secondsPerDay) {
            const minutes = Math.max(0, Math.round(elapsedSeconds / 60));
            formatted = minutes <= 1 ? '1 min' : `${String(minutes)} mins`;
        } else {
            const days = Math.max(1, Math.round(elapsedSeconds / secondsPerDay));
            formatted = days === 1 ? 'Day 1' : `Day ${String(days)}`;
        }

        return isLastTick ? `${formatted}+` : formatted;
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
                            tickFormatter={(value) => {
                                const numValue = Number(value);
                                const isFirstTick = numValue === 0;
                                const isLastTick = numValue === domainDuration;
                                if (isFirstTick) {
                                    return t('app.plugins.tokenExitQueue.feeChart.exit');
                                }
                                return formatElapsed(numValue, isLastTick);
                            }}
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
