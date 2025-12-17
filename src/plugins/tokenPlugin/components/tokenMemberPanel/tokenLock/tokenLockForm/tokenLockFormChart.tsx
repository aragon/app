import { formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { Area, AreaChart, ReferenceDot, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import type { MouseHandlerDataParam } from 'recharts/types/synchronisation/types';
import { parseUnits } from 'viem';
import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import { tokenLockUtils } from '../tokenLockUtils';

export interface IChartPoint {
    /**
     * The x-axis label of the chart point - time.
     */
    x: string;
    /**
     * The y-axis value of the chart point - voting power.
     */
    y: number;
}

export interface ITokenLockFormChartProps {
    /**
     * The amount of tokens used to compute voting power.
     */
    amount?: string;
    /**
     * Settings of the token plugin with escrow contract.
     */
    settings: ITokenPluginSettings;
}

const chartPoints = 6;
const maxAmount = 1_000_000_000_000;

export const TokenLockFormChart: React.FC<ITokenLockFormChartProps> = (props) => {
    const { amount = '0', settings } = props;
    const { maxTime } = settings.votingEscrow!;

    const { t } = useTranslations();

    const [hoveredPoint, setHoveredPoint] = useState<IChartPoint>();

    const processedAmount = Number.parseFloat(amount) > maxAmount ? maxAmount.toString() : amount;
    const processedAmountWei = parseUnits(processedAmount, 18).toString();

    const oneYearInSeconds = 365 * 24 * 60 * 60;
    const chartTimeframe = Math.min(maxTime, oneYearInSeconds);
    const secondsStep = chartTimeframe / (chartPoints - 1);
    const nowLabel = t('app.plugins.token.tokenLockForm.chart.now');

    const points: IChartPoint[] = Array.from({ length: chartPoints }, (_, index) => {
        const lockDuration = index * secondsStep;
        const futureDate = DateTime.now().plus({ seconds: lockDuration });
        const dateLabel = index === 0 ? nowLabel : futureDate.toFormat('LLL d');
        const votingPower = tokenLockUtils.calculateVotingPower(processedAmountWei, lockDuration, settings);

        return { x: dateLabel, y: Number.parseFloat(votingPower) };
    });

    const formatVotingPower = (value: number) =>
        formatterUtils.formatNumber(value, {
            format: NumberFormat.GENERIC_SHORT,
        }) ?? '';

    const handleMouseMove = (data: MouseHandlerDataParam) => {
        const { activeIndex } = data;
        setHoveredPoint(activeIndex ? points[Number(activeIndex)] : points[0]);
    };

    const activePoint = hoveredPoint ?? points[0];

    // Calculate dynamic Y-axis domain with rounded values for clean display
    const minY = Math.min(...points.map((p) => p.y));
    const maxY = Math.max(...points.map((p) => p.y));
    const range = maxY - minY;

    // For zero values, show a reasonable default range (0 to 50K)
    const hasZeroValues = maxY === 0;

    // Add 20% padding below and above for visual breathing room
    const yPadding = range * 0.2;
    const paddedMax = maxY + yPadding;

    // Round to nice numbers based on scale
    const roundToNice = (value: number, roundUp: boolean): number => {
        if (value === 0) {
            return 0;
        }
        const magnitude = 10 ** Math.floor(Math.log10(value));
        const normalized = value / magnitude;

        // Round to nearest 1, 2, 5, or 10
        let rounded: number;
        if (normalized <= 1) {
            rounded = 1;
        } else if (normalized <= 2) {
            rounded = 2;
        } else if (normalized <= 5) {
            rounded = 5;
        } else {
            rounded = 10;
        }

        const result = rounded * magnitude;

        // For min values, round down to avoid cutting off data
        if (!roundUp && result > value) {
            if (rounded === 10) {
                rounded = 5;
            } else if (rounded === 5) {
                rounded = 2;
            } else if (rounded === 2) {
                rounded = 1;
            } else {
                rounded = normalized; // Use smaller step
            }
            return rounded * magnitude;
        }

        return result;
    };

    // Use actual min value as baseline (the "Now" point), round max for clean upper bound
    const yDomainMin = hasZeroValues ? 0 : minY;
    const yDomainMax = hasZeroValues ? 50_000 : roundToNice(paddedMax, true);

    // Dynamic tick count based on the domain range
    const domainRange = yDomainMax - yDomainMin;
    const trillion = 1_000_000_000_000;
    const billion = 1_000_000_000;
    const million = 1_000_000;
    const tickCount = domainRange >= trillion ? 6 : domainRange >= billion ? 5 : domainRange >= million ? 5 : 4;

    // Generate evenly-spaced ticks for visual consistency
    const yAxisTicks = Array.from({ length: tickCount }, (_, i) => yDomainMin + (domainRange / (tickCount - 1)) * i);

    return (
        <div className="w-full py-2">
            <div className="mb-3">
                <p className="font-semibold!">
                    {formatterUtils.formatNumber(activePoint.y, {
                        format: NumberFormat.TOKEN_AMOUNT_SHORT,
                    })}{' '}
                    <span className="font-normal">{t('app.plugins.token.tokenLockForm.chart.votingPower')}</span>
                </p>
                <span className="text-neutral-500 text-sm md:text-base">{activePoint.x}</span>
            </div>
            <ResponsiveContainer height={200} width="100%">
                <AreaChart
                    data={points}
                    margin={{ top: 10, right: 10, bottom: 5, left: 12 }}
                    onMouseLeave={() => setHoveredPoint(undefined)}
                    onMouseMove={handleMouseMove}
                >
                    <defs>
                        <linearGradient id="colorY" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-primary-400)" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="var(--color-primary-400)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        axisLine={false}
                        className="text-xs"
                        dataKey="x"
                        interval={0}
                        tick={{ dy: 12 }}
                        tickLine={false}
                        ticks={points.map((p) => p.x)}
                        type="category"
                    />
                    <YAxis
                        axisLine={false}
                        className="text-xs"
                        dataKey="y"
                        domain={[yDomainMin, yDomainMax]}
                        orientation="right"
                        tickFormatter={formatVotingPower}
                        tickLine={false}
                        ticks={yAxisTicks}
                        type="number"
                        width={45}
                    />
                    <Area
                        dataKey="y"
                        fill="url(#colorY)"
                        fillOpacity={1}
                        stroke="var(--color-primary-400)"
                        strokeWidth={1}
                        type="monotone"
                    />
                    <ReferenceDot
                        fill="var(--color-primary-400)"
                        r={4}
                        stroke="var(--color-neutral-0)"
                        strokeWidth={1}
                        x={activePoint.x}
                        y={activePoint.y}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
