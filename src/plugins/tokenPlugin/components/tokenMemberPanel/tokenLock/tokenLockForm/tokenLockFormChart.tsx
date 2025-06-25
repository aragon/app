import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import { formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { Area, AreaChart, ReferenceDot, ResponsiveContainer, XAxis, YAxis } from 'recharts';
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

export const TokenLockFormChart: React.FC<ITokenLockFormChartProps> = (props) => {
    const { amount = '0', settings } = props;
    const { maxTime } = settings.votingEscrow!;

    const [hoveredPoint, setHoveredPoint] = useState<IChartPoint>();

    const parsedAmount = parseUnits(amount, 18);
    const processedAmount = parsedAmount > BigInt(1e30) ? BigInt(1e30) : parsedAmount;

    const points: IChartPoint[] = Array.from({ length: chartPoints }, (_, i) => {
        const step = maxTime / (chartPoints - 1);
        const seconds = i * step;

        const label = i === 0 ? 'Now' : DateTime.now().plus({ seconds }).toFormat('LLL d');
        const votingPower = tokenLockUtils.calculateVotingPower(processedAmount.toString(), seconds, settings);

        return { x: label, y: parseFloat(votingPower) };
    });

    const handleMouseMove = (data: { activePayload?: Array<{ payload: IChartPoint }> }) =>
        setHoveredPoint(data.activePayload?.[0].payload);

    const handleMouseLeave = () => setHoveredPoint(undefined);

    const displayPoint = hoveredPoint ?? points[0];

    return (
        <div className="w-full">
            <div className="-mb-10">
                <p className="font-semibold!">
                    {formatterUtils.formatNumber(displayPoint.y, { format: NumberFormat.TOKEN_AMOUNT_SHORT })}{' '}
                    <span className="font-normal">Voting power</span>
                </p>
                <span className="text-sm text-neutral-500 md:text-base">{displayPoint.x}</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                    data={points}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
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
                        tickFormatter={(value) =>
                            formatterUtils.formatNumber(value as number, { format: NumberFormat.GENERIC_SHORT }) ?? ''
                        }
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
                        x={displayPoint.x}
                        y={displayPoint.y}
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
