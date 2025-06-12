import { formatterUtils, Heading, NumberFormat } from '@aragon/gov-ui-kit';
import type { DotsItemSymbolProps } from '@nivo/core';
import { ResponsiveLine } from '@nivo/line';
import { DateTime } from 'luxon';

export interface IDatum {
    /**
     * Unique identifier for the data point.
     */
    id: string;
    /**
     * Array of data points for the line chart.
     */
    data: Array<{ x: string | number; y: number }>;
}

export interface ITokenLockFormChartProps {
    /**
     * The projected yield slope of the line chart.
     */
    slope: number;
    /**
     * The projected yield bias (y-intercept) of the line chart.
     */
    bias: number;
    /**
     * The amount of tokens used to compute voting power.
     */
    amount: number;
    /**
     * Maximum future time in seconds to calculate projection for.
     */
    maxTime: number;
}

const FirstPointSymbol = ({ datum }: DotsItemSymbolProps<IDatum['data'][number]>) => {
    if (!datum.x) {
        return null;
    }

    const isNow = datum.x === 'Now';
    return isNow ? <circle r={5} fill="#2979FF" /> : null;
};

export const TokenLockFormChart: React.FC<ITokenLockFormChartProps> = (props) => {
    const { amount, maxTime, slope, bias } = props;

    const safeAmount = isNaN(amount) || amount < 0 ? 0 : amount;

    const now = DateTime.now();
    const numPoints = 6;
    const step = maxTime / (numPoints - 1); // 5 intervals, 6 points
    const labels: string[] = [];
    const values: number[] = [];

    for (let i = 0; i < numPoints; i++) {
        const seconds = i * step;
        const label = i === 0 ? 'Now' : now.plus({ seconds }).toFormat('LLL d');
        const y = safeAmount * (slope * seconds + bias);
        labels.push(label);
        values.push(y);
    }

    const trendLine: IDatum = {
        id: 'Voting power',
        data: labels.map((x, i) => ({ x, y: values[i] })),
    };

    const data = [trendLine];

    const isFlat = values.every((val) => val === 0);
    const maxY = isFlat ? 12500 : Math.max(...values);
    const tickStep = maxY / 5;
    const tickValues = Array.from({ length: 6 }, (_, i) => Math.round(i * tickStep));

    return (
        <div className="relative h-[300px] w-full">
            <div className="absolute top-4 left-6">
                <Heading size="h2" className="font-semibold!">
                    {formatterUtils.formatNumber(amount, { format: NumberFormat.TOKEN_AMOUNT_SHORT })}{' '}
                    <span className="font-normal">{trendLine.id}</span>
                </Heading>
                <span className="text-sm text-neutral-500 md:text-base">Now</span>
            </div>

            <ResponsiveLine
                data={data}
                xScale={{ type: 'point' }}
                yScale={{ type: 'linear', min: 0, max: maxY, stacked: false }}
                margin={{ top: 24, right: 60, bottom: 40, left: 24 }}
                axisBottom={{
                    tickPadding: 20,
                    renderTick: (tick) => (
                        <text x={tick.x} y={tick.y + 32} className="fill-gray-500 text-sm" textAnchor="middle">
                            {tick.value}
                        </text>
                    ),
                }}
                axisLeft={null}
                axisRight={{
                    tickValues,
                    renderTick: (tick) => (
                        <text x={tick.x + 12} y={tick.y} className="fill-gray-500 text-sm">
                            {formatterUtils.formatNumber(tick.value as number, {
                                format: NumberFormat.TOKEN_AMOUNT_SHORT,
                            })}
                        </text>
                    ),
                }}
                enableGridX={false}
                enableGridY={false}
                enableArea={true}
                areaOpacity={1}
                defs={[
                    {
                        id: 'gradientA',
                        type: 'linearGradient',
                        colors: [
                            { offset: 0, color: '#2979FF', opacity: 0.35 },
                            { offset: 100, color: '#2979FF', opacity: 0 },
                        ],
                    },
                ]}
                fill={[{ match: '*', id: 'gradientA' }]}
                colors="#2979FF"
                enablePoints={true}
                pointSymbol={FirstPointSymbol}
                useMesh={safeAmount !== 0 ? true : false}
            />
        </div>
    );
};
