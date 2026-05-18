import {
    Avatar,
    addressUtils,
    Button,
    DataList,
    formatterUtils,
    IconType,
    InputNumber,
    NumberFormat,
} from '@aragon/gov-ui-kit';
import { formatUnits, parseUnits } from 'viem';

const WEIGHT_PRECISION = 2;

const WEIGHT_MAX = 1000;

export interface IGaugeVoterVoteDialogItemProps {
    /**
     * The gauge address.
     */
    gaugeAddress: string;
    /**
     * The gauge name.
     */
    gaugeName?: string | null;
    /**
     * The gauge avatar URL.
     */
    gaugeAvatar?: string | null;
    /**
     * The current relative weight for this gauge (scaled by 10^WEIGHT_PRECISION).
     */
    weight: bigint;
    /**
     * Sum of all weights — used to compute this row's share.
     */
    totalWeight: bigint;
    /**
     * Total voting power available to the user.
     */
    totalVotingPower: number;
    /**
     * Token symbol for display.
     */
    tokenSymbol?: string;
    /**
     * Handler for updating the vote weight.
     */
    onUpdateWeight: (gaugeAddress: string, weight: bigint) => void;
    /**
     * Handler for removing this gauge from the vote list.
     */
    onRemove: (gaugeAddress: string) => void;
}

export const GaugeVoterVoteDialogItem: React.FC<
    IGaugeVoterVoteDialogItemProps
> = (props) => {
    const {
        gaugeAddress,
        gaugeName,
        gaugeAvatar,
        weight,
        totalWeight,
        totalVotingPower,
        tokenSymbol,
        onUpdateWeight,
        onRemove,
    } = props;

    const displayGaugeName =
        gaugeName ?? addressUtils.truncateAddress(gaugeAddress);
    const avatarFallback = (
        <span className="flex size-full items-center justify-center bg-primary-400 text-neutral-0">
            {displayGaugeName.slice(0, 2).toUpperCase()}
        </span>
    );

    const shareBps =
        totalWeight > BigInt(0)
            ? (weight * BigInt(10_000)) / totalWeight
            : BigInt(0);
    const sharePercent = Number(shareBps) / 100;

    const calculatedVotes = (sharePercent / 100) * totalVotingPower;
    const displayVotes = formatterUtils.formatNumber(calculatedVotes, {
        format: NumberFormat.TOKEN_AMOUNT_SHORT,
    });

    const showTokenAmount =
        weight > BigInt(0) && displayVotes && displayVotes !== '0';

    return (
        <DataList.Item className="flex flex-col gap-4 rounded-xl border border-neutral-100 bg-neutral-0 p-4 md:flex-row md:items-center md:justify-between">
            <div className="b-0 flex flex-1 items-center gap-3 border-neutral-100 border-b pb-4 md:border-b-0 md:border-none md:pb-0">
                {gaugeAvatar && (
                    <Avatar
                        alt={displayGaugeName}
                        fallback={avatarFallback}
                        responsiveSize={{ md: 'lg' }}
                        size="md"
                        src={gaugeAvatar}
                    />
                )}
                <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-base text-neutral-800">
                        {displayGaugeName}
                    </span>
                    <span className="truncate text-neutral-500 text-sm">
                        {addressUtils.truncateAddress(gaugeAddress)}
                    </span>
                </div>
                <Button
                    className="md:hidden"
                    iconLeft={IconType.CLOSE}
                    onClick={() => onRemove(gaugeAddress)}
                    size="sm"
                    variant="tertiary"
                />
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:self-end">
                <div className="flex flex-col items-end">
                    {showTokenAmount && (
                        <span className="text-base text-neutral-800">
                            {displayVotes} {tokenSymbol}
                        </span>
                    )}
                    {totalWeight > BigInt(0) && (
                        <span className="text-neutral-500 text-sm">
                            {sharePercent.toFixed(2)}%
                        </span>
                    )}
                </div>

                <InputNumber
                    className="w-full md:max-w-40 md:flex-initial"
                    max={WEIGHT_MAX}
                    min={0}
                    onChange={(value) => {
                        const parsed = parseUnits(
                            value || '0',
                            WEIGHT_PRECISION,
                        );
                        const capped =
                            parsed >
                            parseUnits(String(WEIGHT_MAX), WEIGHT_PRECISION)
                                ? parseUnits(
                                      String(WEIGHT_MAX),
                                      WEIGHT_PRECISION,
                                  )
                                : parsed;
                        onUpdateWeight(gaugeAddress, capped);
                    }}
                    value={formatUnits(weight, WEIGHT_PRECISION)}
                />

                <Button
                    className="hidden md:inline-flex"
                    iconLeft={IconType.CLOSE}
                    onClick={() => onRemove(gaugeAddress)}
                    size="sm"
                    variant="tertiary"
                />
            </div>
        </DataList.Item>
    );
};
