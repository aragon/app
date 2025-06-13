import { tokenLocksDialogUtils } from '@/plugins/tokenPlugin/dialogs/tokenLocksDialog/tokenLocksDialogUtils';
import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import { formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import type { DotsItemSymbolProps } from '@nivo/core';
import { ResponsiveLine } from '@nivo/line';
import { DateTime } from 'luxon';
import { parseUnits } from 'viem';

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
     * The amount of tokens used to compute voting power.
     */
    amount: number;
    /**
     * Settings of the token plugin with escrow contract.
     */
    settings: ITokenPluginSettings;
}

const FirstPointSymbol = ({ datum }: DotsItemSymbolProps<IDatum['data'][number]>) => {
    if (!datum.x) {
        return null;
    }

    return datum.x === 'Now' ? <circle r={5} fill="#2979FF" /> : null;
};

export const TokenLockFormChart: React.FC<ITokenLockFormChartProps> = (props) => {
    const { amount, settings } = props;

    const { maxTime } = settings.votingEscrow!;

    const processedAmount = isNaN(amount) || amount < 0 ? 0 : amount;
    const parsedAmount = parseUnits(processedAmount.toString(), 18);

    const numPoints = 6;
    const step = maxTime / (numPoints - 1);

    const points = Array.from({ length: numPoints }, (_, i) => {
        const seconds = i * step;
        const label = i === 0 ? 'Now' : DateTime.now().plus({ seconds }).toFormat('LLL d');
        const votingPower = tokenLocksDialogUtils.calculateVotingPower(parsedAmount.toString(), seconds, settings);

        return { x: label, y: parseFloat(votingPower) };
    });

    const trendLine: IDatum = { id: 'Voting power', data: points };

    const data = [trendLine];

    const isFlat = processedAmount === 0;
    const maxY = isFlat
        ? '12500'
        : tokenLocksDialogUtils.calculateVotingPower(parsedAmount.toString(), maxTime, settings);
    const tickStep = parseFloat(maxY) / 5;
    const tickValues = Array.from({ length: 6 }, (_, i) => Math.round(i * tickStep));

    return (
        <div className="relative h-[300px] w-full">
            <div className="absolute top-4 left-4">
                <p className="font-semibold!">
                    {formatterUtils.formatNumber(processedAmount, { format: NumberFormat.TOKEN_AMOUNT_SHORT })}{' '}
                    <span className="font-normal">{trendLine.id}</span>
                </p>
                <span className="text-sm text-neutral-500 md:text-base">Now</span>
            </div>

            <ResponsiveLine
                data={data}
                xScale={{ type: 'point' }}
                yScale={{ type: 'linear', min: 0, max: parseFloat(maxY), stacked: false }}
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
