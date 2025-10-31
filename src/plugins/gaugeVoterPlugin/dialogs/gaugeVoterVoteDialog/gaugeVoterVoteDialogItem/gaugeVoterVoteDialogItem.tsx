import {
    addressUtils,
    Avatar,
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

export const GaugeVoterVoteDialogItem: React.FC<IGaugeVoterVoteDialogItemProps> = (props) => {
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

    const displayGaugeName = gaugeName ?? addressUtils.truncateAddress(gaugeAddress);
    const avatarFallback = (
        <span className="bg-primary-400 text-neutral-0 flex size-full items-center justify-center">
            {displayGaugeName.slice(0, 2).toUpperCase()}
        </span>
    );

    // Calculate display votes based on whether user has modified allocations
    const calculatedVotes = (percentage / 100) * totalVotingPower;
    const displayVotes = !hasModified
        ? formattedExistingVotes
        : formatterUtils.formatNumber(calculatedVotes, {
              format: NumberFormat.TOKEN_AMOUNT_SHORT,
          });

    // Only show token amount if there are votes (either existing or newly allocated)
    const hasVotes = !hasModified ? existingVotes > 0 : calculatedVotes > 0;
    const showTokenAmount = hasVotes && displayVotes && displayVotes !== '0';

    return (
        <DataList.Item className="bg-neutral-0 flex flex-col gap-4 rounded-xl border border-neutral-100 p-4 md:flex-row md:items-center md:justify-between">
            <div className="b-0 flex flex-1 items-center gap-3 border-b border-neutral-100 pb-4 md:border-b-0 md:border-none md:pb-0">
                {gaugeAvatar && (
                    <Avatar
                        src={gaugeAvatar}
                        size="md"
                        responsiveSize={{ md: 'lg' }}
                        alt={displayGaugeName}
                        fallback={avatarFallback}
                    />
                )}
                <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-base text-neutral-800">{displayGaugeName}</span>
                    <span className="truncate text-sm text-neutral-500">
                        {addressUtils.truncateAddress(gaugeAddress)}
                    </span>
                </div>
                <Button
                    iconLeft={IconType.CLOSE}
                    onClick={() => onRemove(gaugeAddress)}
                    variant="tertiary"
                    size="sm"
                    className="md:hidden"
                />
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:self-end">
                {showTokenAmount && (
                    <span className="text-base text-neutral-800">
                        {displayVotes} {tokenSymbol}
                    </span>
                )}

                <InputNumber
                    min={0}
                    max={100}
                    suffix="%"
                    value={percentage.toString()}
                    className="w-full md:max-w-40 md:flex-initial"
                    onChange={(value) => onUpdatePercentage(gaugeAddress, Number(value))}
                />

                <Button
                    iconLeft={IconType.CLOSE}
                    onClick={() => onRemove(gaugeAddress)}
                    variant="tertiary"
                    size="sm"
                    className="hidden md:inline-flex"
                />
            </div>
        </DataList.Item>
    );
};
