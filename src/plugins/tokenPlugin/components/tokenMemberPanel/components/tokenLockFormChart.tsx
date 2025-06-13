import { formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import type { DotsItemSymbolProps } from '@nivo/core';
import { ResponsiveLine } from '@nivo/line';
import { DateTime } from 'luxon';
import { formatUnits } from 'viem';

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
    slope: bigint;
    /**
     * The projected yield bias of the line chart.
     */
    bias: bigint;
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
    const step = maxTime / (numPoints - 1);

    const falseZero = 250;

    const slopeNum = Number(formatUnits(slope, 18));
    const biasNum = Number(formatUnits(bias, 18));

    const computedVotingPower = (time: number) =>
        safeAmount === 0 ? falseZero : safeAmount * (slopeNum * time + biasNum);

    const points = Array.from({ length: numPoints }, (_, i) => {
        const seconds = i * step;
        const label = i === 0 ? 'Now' : now.plus({ seconds }).toFormat('LLL d');
        return { x: label, y: computedVotingPower(seconds) };
    });

    const trendLine: IDatum = { id: 'Voting power', data: points };

    const data = [trendLine];

    const isFlat = safeAmount === 0;
    const maxY = isFlat ? 12500 : computedVotingPower(maxTime);
    const tickStep = maxY / 5;
    const tickValues = Array.from({ length: 6 }, (_, i) => Math.round(i * tickStep));

    return (
        <div className="relative h-[300px] w-full">
            <div className="absolute top-4 left-4">
                <p className="font-semibold!">
                    {formatterUtils.formatNumber(safeAmount, { format: NumberFormat.TOKEN_AMOUNT_SHORT })}{' '}
                    <span className="font-normal">{trendLine.id}</span>
                </p>
                <span className="text-sm text-neutral-500 md:text-base">Now</span>
            </div>

            <ResponsiveLine
                data={data}
                xScale={{ type: 'point' }}
                yScale={{ type: 'linear', min: 0, max: maxY, stacked: false }}
                margin={{ top: 24, right: 60, bottom: 40, left: 24 }}
                axisBottom={{
                    tickPadding: 12,
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
                        <text x={tick.x + 8} y={tick.y} className="fill-gray-500 text-sm">
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
                            { offset: 0, color: '#3164fa', opacity: 0.35 },
                            { offset: 100, color: '#3164fa', opacity: 0 },
                        ],
                    },
                ]}
                fill={[{ match: '*', id: 'gradientA' }]}
                colors="#3164fa"
                enablePoints={true}
                pointSymbol={FirstPointSymbol}
            />
        </div>
    );
};
