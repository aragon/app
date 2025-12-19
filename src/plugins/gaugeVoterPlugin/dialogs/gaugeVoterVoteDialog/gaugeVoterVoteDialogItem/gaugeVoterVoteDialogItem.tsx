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
     * The current percentage allocation for this gauge.
     */
    percentage: number;
    /**
     * The user's existing votes for this gauge (BigInt).
     */
    existingVotes: bigint;
    /**
     * The user's existing votes for this gauge (formatted string).
     */
    formattedExistingVotes: string;
    /**
     * Total voting power available to the user.
     */
    totalVotingPower: number;
    /**
     * Token symbol for display.
     */
    tokenSymbol?: string;
    /**
     * Whether the user has modified allocations.
     */
    hasModified: boolean;
    /**
     * Handler for updating the vote percentage.
     */
    onUpdatePercentage: (gaugeAddress: string, newPercentage: number) => void;
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
        percentage,
        existingVotes,
        formattedExistingVotes,
        totalVotingPower,
        tokenSymbol,
        hasModified,
        onUpdatePercentage,
        onRemove,
    } = props;

    const displayGaugeName =
        gaugeName ?? addressUtils.truncateAddress(gaugeAddress);
    const avatarFallback = (
        <span className="flex size-full items-center justify-center bg-primary-400 text-neutral-0">
            {displayGaugeName.slice(0, 2).toUpperCase()}
        </span>
    );

    // Calculate display votes based on whether user has modified allocations
    const calculatedVotes = (percentage / 100) * totalVotingPower;
    const displayVotes = hasModified
        ? formatterUtils.formatNumber(calculatedVotes, {
              format: NumberFormat.TOKEN_AMOUNT_SHORT,
          })
        : formattedExistingVotes;

    // Only show token amount if there are votes (either existing or newly allocated)
    const hasVotes = hasModified ? calculatedVotes > 0 : existingVotes > 0;
    const showTokenAmount = hasVotes && displayVotes && displayVotes !== '0';

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
                {showTokenAmount && (
                    <span className="text-base text-neutral-800">
                        {displayVotes} {tokenSymbol}
                    </span>
                )}

                <InputNumber
                    className="w-full md:max-w-40 md:flex-initial"
                    max={100}
                    min={0}
                    onChange={(value) =>
                        onUpdatePercentage(gaugeAddress, Number(value))
                    }
                    suffix="%"
                    value={percentage.toString()}
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
