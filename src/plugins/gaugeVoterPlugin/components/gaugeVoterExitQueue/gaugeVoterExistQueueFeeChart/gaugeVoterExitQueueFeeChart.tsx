'use client';

import { useMemo, useState } from 'react';
import {
    Area,
    AreaChart,
    ReferenceDot,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from 'recharts';
import type { MouseHandlerDataParam } from 'recharts/types/synchronisation/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import { GaugeVoterExitQueueFeeMode } from '../../../types/enum';
import { gaugeVoterExitQueueFeeUtils } from '../../../utils/gaugeVoterExitQueueFeeUtils';
import {
    CHART_POINT_COUNT,
    type IGaugeVoterExitQueueFeeChartProps,
} from './gaugeVoterExitQueueFeeChart.api';

export const GaugeVoterExitQueueFeeChart: React.FC<
    IGaugeVoterExitQueueFeeChartProps
> = (props) => {
    const { ticket, currentTime, className } = props;

    const { t } = useTranslations();

    const [hoveredIndex, setHoveredIndex] = useState<number | undefined>(
        undefined,
    );

    const mode = gaugeVoterExitQueueFeeUtils.determineFeeMode(ticket);
    const isFixedMode = mode === GaugeVoterExitQueueFeeMode.FIXED;

    const secondsPerDay = 24 * 60 * 60;

    const decayDuration = Math.max(ticket.cooldown - ticket.minCooldown, 0);
    const fallbackDuration = Math.max(secondsPerDay, 1);
    // Extend x-axis to 1.5x decay duration so slope line hits at 2/3 of chart (e.g., 10 min decay → 15 min x-axis)
    const domainDuration =
        decayDuration > 0 ? decayDuration * 1.5 : fallbackDuration;

    const minFeePercent = useMemo(
        () =>
            gaugeVoterExitQueueFeeUtils.calculateFeeAtTime({
                timeElapsed: ticket.cooldown,
                ticket,
            }),
        [ticket],
    );

    const points = useMemo(() => {
        if (isFixedMode) {
            return [];
        }

        if (decayDuration <= 0) {
            const startFee = gaugeVoterExitQueueFeeUtils.calculateFeeAtTime({
                timeElapsed: ticket.minCooldown,
                ticket,
            });
            return [
                { elapsedSeconds: 0, feePercent: startFee },
                { elapsedSeconds: domainDuration, feePercent: startFee },
            ];
        }

        const firstPhasePoints = Array.from(
            { length: CHART_POINT_COUNT },
            (_, index) => {
                const ratio = index / (CHART_POINT_COUNT - 1);
                const xPosition = ratio * decayDuration;
                const timeElapsed = ticket.minCooldown + xPosition;
                const feePercent =
                    gaugeVoterExitQueueFeeUtils.calculateFeeAtTime({
                        timeElapsed,
                        ticket,
                    });

                return {
                    elapsedSeconds: xPosition,
                    feePercent,
                };
            },
        );

        if (firstPhasePoints.at(-1)?.elapsedSeconds !== decayDuration) {
            firstPhasePoints.push({
                elapsedSeconds: decayDuration,
                feePercent: minFeePercent,
            });
        }

        // Plateau extends from end of decay to domainDuration (1.5x cooldown)
        const plateauDuration = domainDuration - decayDuration;
        const plateauPoints = Array.from(
            { length: CHART_POINT_COUNT },
            (_, index) => {
                const ratio = index / (CHART_POINT_COUNT - 1);
                const xPosition = decayDuration + ratio * plateauDuration;
                return {
                    elapsedSeconds: xPosition,
                    feePercent: minFeePercent,
                };
            },
        );

        return [...firstPhasePoints, ...plateauPoints];
    }, [decayDuration, domainDuration, isFixedMode, minFeePercent, ticket]);

    if (isFixedMode || points.length === 0) {
        return null;
    }

    const timeElapsedNow = currentTime - ticket.queuedAt;
    const elapsedSinceMinCooldown = Math.max(
        0,
        timeElapsedNow - ticket.minCooldown,
    );
    const nowX =
        decayDuration > 0
            ? Math.min(elapsedSinceMinCooldown, domainDuration)
            : 0;

    const boundedTimeElapsed = Math.max(
        ticket.minCooldown,
        Math.min(timeElapsedNow, ticket.cooldown + ticket.cooldown),
    );
    const currentFeePercent = gaugeVoterExitQueueFeeUtils.calculateFeeAtTime({
        timeElapsed: boundedTimeElapsed,
        ticket,
    });

    const nowLabel = t('app.plugins.tokenExitQueue.feeChart.now');

    // Generate nice round ticks that will format cleanly
    const generateTicks = () => {
        if (domainDuration === 0) {
            return [0];
        }

        const secondsPerMinute = 60;
        const secondsPerHour = 60 * 60;
        const domainMinutes = domainDuration / secondsPerMinute;
        const domainHours = domainDuration / secondsPerHour;

        const ticks: number[] = [0];

        // Choose appropriate interval based on scale
        let interval: number;
        if (domainHours >= 24) {
            // Days scale: use day intervals
            interval = secondsPerDay;
        } else if (domainHours >= 2) {
            // Hours scale: use hour intervals
            interval = secondsPerHour;
        } else if (domainMinutes >= 20) {
            // Use 5-minute intervals for 20+ minutes
            interval = 5 * secondsPerMinute;
        } else if (domainMinutes >= 10) {
            // Use 3-minute intervals for 10-20 minutes
            interval = 3 * secondsPerMinute;
        } else {
            // Use 2-minute intervals for <10 minutes
            interval = 2 * secondsPerMinute;
        }

        // Generate ticks at round intervals up to domainDuration
        let current = interval;
        while (current < domainDuration) {
            ticks.push(current);
            current += interval;
        }

        // Always include domain end
        ticks.push(domainDuration);

        return ticks.sort((a, b) => a - b);
    };

    const xAxisTicks = generateTicks();

    const dataMaxFeePercent = points.reduce(
        (max, point) => Math.max(max, point.feePercent),
        currentFeePercent,
    );
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
        const secondsPerHour = 60 * 60;
        const secondsPerYear = secondsPerDay * 365;

        if (elapsedSeconds >= secondsPerYear) {
            const years = Math.max(
                1,
                Math.round(elapsedSeconds / secondsPerYear),
            );
            formatted = `${String(years)}${t('app.plugins.tokenExitQueue.feeChart.timeUnit.year')}`;
        } else if (elapsedSeconds >= secondsPerDay) {
            const days = Math.max(
                1,
                Math.round(elapsedSeconds / secondsPerDay),
            );
            formatted = `${String(days)}${t('app.plugins.tokenExitQueue.feeChart.timeUnit.day')}`;
        } else if (elapsedSeconds >= secondsPerHour) {
            const hours = Math.max(
                1,
                Math.round(elapsedSeconds / secondsPerHour),
            );
            formatted = `${String(hours)}${t('app.plugins.tokenExitQueue.feeChart.timeUnit.hour')}`;
        } else {
            const minutes = Math.max(0, Math.round(elapsedSeconds / 60));
            formatted = `${String(minutes)}${t('app.plugins.tokenExitQueue.feeChart.timeUnit.minute')}`;
        }

        return isLastTick ? `>${formatted}` : formatted;
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

        if (
            extendedState.isTooltipActive &&
            extendedState.activeTooltipIndex != null
        ) {
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

    const hoveredPoint =
        hoveredIndex != null ? points[hoveredIndex] : undefined;
    const activeLabel =
        hoveredPoint && hoveredIndex != null
            ? formatElapsed(hoveredPoint.elapsedSeconds)
            : nowLabel;
    const activeFeePercent = hoveredPoint
        ? hoveredPoint.feePercent
        : currentFeePercent;
    const activeFeeDisplay = formatFeePercent(activeFeePercent);
    const indicatorX = hoveredPoint ? hoveredPoint.elapsedSeconds : nowX;
    const indicatorY = hoveredPoint
        ? hoveredPoint.feePercent
        : currentFeePercent;

    return (
        <div className={className}>
            <div className="relative">
                <ResponsiveContainer height={200} width="100%">
                    <AreaChart
                        data={points}
                        margin={{ top: 12, right: 28, left: 8, bottom: 0 }}
                        onMouseLeave={() => setHoveredIndex(undefined)}
                        onMouseMove={handleMouseMove}
                    >
                        <defs>
                            <linearGradient
                                id="colorFee"
                                x1="0"
                                x2="0"
                                y1="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-primary-400)"
                                    stopOpacity={0.4}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-primary-400)"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>
                        <XAxis
                            axisLine={false}
                            className="text-xs"
                            dataKey="elapsedSeconds"
                            domain={[0, domainDuration]}
                            tickFormatter={(value) => {
                                const numValue = Number(value);
                                const isFirstTick = numValue === 0;
                                const isLastTick = numValue === domainDuration;
                                if (isFirstTick) {
                                    return '0';
                                }
                                return formatElapsed(numValue, isLastTick);
                            }}
                            tickLine={false}
                            tickMargin={8}
                            ticks={xAxisTicks}
                            type="number"
                        />
                        <YAxis
                            axisLine={false}
                            className="text-xs"
                            dataKey="feePercent"
                            domain={[0, yDomainMax]}
                            orientation="left"
                            tickCount={6}
                            tickFormatter={formatFeePercent}
                            tickLine={false}
                            type="number"
                            width={40}
                        />
                        <Area
                            activeDot={false}
                            dataKey="feePercent"
                            fill="url(#colorFee)"
                            fillOpacity={1}
                            stroke="var(--color-primary-400)"
                            strokeWidth={1}
                            type={
                                mode === GaugeVoterExitQueueFeeMode.TIERED
                                    ? 'stepAfter'
                                    : 'linear'
                            }
                        />
                        <ReferenceDot
                            fill="var(--color-primary-400)"
                            r={4}
                            stroke="var(--color-neutral-0)"
                            strokeWidth={1}
                            x={indicatorX}
                            y={indicatorY}
                        />
                    </AreaChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute top-3 right-3 text-right">
                    <span className="block font-semibold text-lg text-neutral-800">
                        {activeFeeDisplay}
                    </span>
                    <span className="block text-neutral-500 text-sm">
                        {activeLabel}
                    </span>
                </div>
            </div>
        </div>
    );
};
