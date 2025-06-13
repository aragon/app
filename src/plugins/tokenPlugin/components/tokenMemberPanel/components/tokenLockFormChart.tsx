import { tokenLocksDialogUtils } from '@/plugins/tokenPlugin/dialogs/tokenLocksDialog/tokenLocksDialogUtils';
import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import { formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
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

    return (
        <div className="w-full">
            <div className="-mb-10">
                <p className="font-semibold!">
                    {formatterUtils.formatNumber(processedAmount, { format: NumberFormat.TOKEN_AMOUNT_SHORT })}{' '}
                    <span className="font-normal">Voting power</span>
                </p>
                <span className="text-sm text-neutral-500 md:text-base">Now</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={points}>
                    <defs>
                        <linearGradient id="colorY" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3164fa" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3164fa" stopOpacity={0} />
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
                        stroke="#3164FA"
                        strokeWidth={1}
                        fillOpacity={1}
                        fill="url(#colorY)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
