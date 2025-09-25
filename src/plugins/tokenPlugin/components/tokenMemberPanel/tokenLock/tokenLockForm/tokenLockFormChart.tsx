import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import { formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { Area, AreaChart, ReferenceDot, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import type { MouseHandlerDataParam } from 'recharts/types/synchronisation/types';
import { parseUnits } from 'viem';
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

    const processedAmount = parseFloat(amount) > maxAmount ? maxAmount.toString() : amount;
    const processedAmountWei = parseUnits(processedAmount, 18).toString();

    const secondsStep = maxTime / (chartPoints - 1);
    const nowLabel = t('app.plugins.token.tokenLockForm.chart.now');

    const points: IChartPoint[] = Array.from({ length: chartPoints }, (_, index) => {
        const pointSeconds = index * secondsStep;

        const dateLabel = index === 0 ? nowLabel : DateTime.now().plus({ seconds: pointSeconds }).toFormat('LLL d');
        const votingPower = tokenLockUtils.calculateVotingPower(processedAmountWei, pointSeconds, settings);

        return { x: dateLabel, y: parseFloat(votingPower) };
    });

    const formatVotingPower = (value: number) =>
        formatterUtils.formatNumber(value, { format: NumberFormat.GENERIC_SHORT }) ?? '';

    const handleMouseMove = (data: MouseHandlerDataParam) => {
        const { activeIndex } = data;
        setHoveredPoint(activeIndex ? points[Number(activeIndex)] : points[0]);
    };

    const activePoint = hoveredPoint ?? points[0];

    return (
        <div className="w-full">
            <div className="-mb-10">
                <p className="font-semibold!">
                    {formatterUtils.formatNumber(activePoint.y, { format: NumberFormat.TOKEN_AMOUNT_SHORT })}{' '}
                    <span className="font-normal">{t('app.plugins.token.tokenLockForm.chart.votingPower')}</span>
                </p>
                <span className="text-sm text-neutral-500 md:text-base">{activePoint.x}</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                    data={points}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setHoveredPoint(undefined)}
                    margin={{ right: 16, left: 4 }}
                >
                    <defs>
                        <linearGradient id="colorY" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-primary-400)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--color-primary-400)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="x"
                        className="text-xs"
                        tickLine={false}
                        axisLine={false}
                        type="category"
                        tickCount={points.length}
                        tick={{ dx: -25 }}
                    />
                    <YAxis
                        tickFormatter={formatVotingPower}
                        className="text-xs"
                        width={25}
                        tickLine={false}
                        axisLine={false}
                        type="number"
                        tickCount={points.length}
                        dataKey="y"
                        orientation="right"
                    />
                    <Area
                        type="monotone"
                        dataKey="y"
                        stroke="var(--color-primary-400)"
                        strokeWidth={1}
                        fillOpacity={1}
                        fill="url(#colorY)"
                    />
                    <ReferenceDot
                        x={activePoint.x}
                        y={activePoint.y}
                        r={4}
                        fill="var(--color-primary-400)"
                        stroke="var(--color-neutral-0)"
                        strokeWidth={1}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
