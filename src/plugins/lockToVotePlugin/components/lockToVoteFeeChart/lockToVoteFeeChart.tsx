'use client';

import { useTranslations } from '@/shared/components/translationsProvider';
import { useState } from 'react';
import { Area, AreaChart, ReferenceDot, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import type { MouseHandlerDataParam } from 'recharts/types/synchronisation/types';
import { LockToVoteFeeMode } from '../../types';
import { lockToVoteFeeUtils } from '../../utils/lockToVoteFeeUtils';
import type { ILockToVoteFeeChartProps } from './lockToVoteFeeChart.api';

export const LockToVoteFeeChart: React.FC<ILockToVoteFeeChartProps> = (props) => {
    const { ticket, currentTime, className } = props;

    const { t } = useTranslations();

    const [hoveredIndex, setHoveredIndex] = useState<number | undefined>(undefined);

    const mode = lockToVoteFeeUtils.determineFeeMode(ticket);

    // Don't render chart for fixed fee mode
    if (mode === LockToVoteFeeMode.FIXED) {
        return null;
    }

    // Generate dense points for smooth line, but only show 6 x-axis labels
    const points = lockToVoteFeeUtils.getChartDataPoints({
        ticket,
        currentTime,
        pointCount: 100,
    });

    // If no points generated, don't render
    if (points.length === 0) {
        return null;
    }

    const timeElapsedNow = currentTime - ticket.queuedAt;
    const currentFeePercent = lockToVoteFeeUtils.calculateFeeAtTime({
        timeElapsed: timeElapsedNow,
        ticket,
    });

    const nowLabel = t('app.plugins.lockToVote.feeChart.now');
    const secondsPerDay = 24 * 60 * 60;

    const baseTickCount = 6;
    const baseTicks = Array.from({ length: baseTickCount }, (_, index) => {
        if (index === baseTickCount - 1) {
            return ticket.cooldown;
        }
        return (ticket.cooldown / (baseTickCount - 1)) * index;
    });

    const tickSet = new Set<number>(baseTicks);
    if (mode === LockToVoteFeeMode.TIERED) {
        tickSet.add(ticket.minCooldown);
    }
    const xAxisTicks = Array.from(tickSet).sort((a, b) => a - b);
    const xAxisTickCount = xAxisTicks.length;

    const nowX = ticket.cooldown === 0 ? 0 : Math.min(timeElapsedNow, ticket.cooldown);

    const dataMaxFeePercent = points.reduce((max, point) => Math.max(max, point.feePercent), currentFeePercent);
    const configuredMaxFeePercent = Math.max(ticket.feePercent / 100, 0);
    const yDomainMax = Math.max(configuredMaxFeePercent, dataMaxFeePercent, 1);

    const formatFeePercent = (value: number) => {
        if (!Number.isFinite(value)) {
            return '';
        }
        const decimals = value < 1 ? 2 : 2;
        const fixed = value.toFixed(decimals);
        const trimmed = fixed.replace(/\.?0+$/, '');
        return `${trimmed}%`;
    };

    const totalDays = Math.max(1, Math.ceil(ticket.cooldown / secondsPerDay));

    const tickDayNumbers: number[] = [];
    xAxisTicks.forEach((tickSeconds, index) => {
        if (index === 0) {
            tickDayNumbers.push(1);
            return;
        }
        if (index === xAxisTickCount - 1) {
            tickDayNumbers.push(totalDays);
            return;
        }

        const rawDays = tickSeconds / secondsPerDay;
        const prevDay = tickDayNumbers[index - 1] ?? 1;
        const candidate = Math.max(prevDay + 1, Math.ceil(rawDays));
        const upperBound = Math.max(1, totalDays - 1);
        const clamped = Math.min(upperBound, candidate);
        tickDayNumbers.push(clamped);
    });

    const formatDayTick = (_elapsedSeconds: number, index: number) => {
        if (index === 0) {
            return 'Day 1';
        }
        const day = tickDayNumbers.at(index);
        return day != null ? day.toString() : '';
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
    const formatPointLabel = (elapsed: number) => {
        const dayNumber = elapsed === 0 ? 1 : Math.max(1, Math.round(elapsed / secondsPerDay));
        return `Day ${dayNumber.toString()}`;
    };
    const activeLabel = hoveredPoint && hoveredIndex != null ? formatPointLabel(hoveredPoint.elapsedSeconds) : nowLabel;
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
                            domain={[0, ticket.cooldown]}
                            ticks={xAxisTicks}
                            tickFormatter={(value, index) => formatDayTick(Number(value), index)}
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
                            type={mode === LockToVoteFeeMode.TIERED ? 'stepAfter' : 'linear'}
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
