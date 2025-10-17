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
    gaugeName: string;
    /**
     * The gauge logo URL.
     */
    gaugeLogo?: string;
    /**
     * The current percentage allocation for this gauge.
     */
    percentage: number;
    /**
     * The user's existing votes for this gauge.
     */
    userVotes: number;
    /**
     * Total voting power available to the user.
     */
    totalVotingPower: number;
    /**
     * Token symbol for display.
     */
    tokenSymbol: string;
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
        gaugeLogo,
        percentage,
        userVotes,
        totalVotingPower,
        tokenSymbol,
        hasModified,
        onUpdatePercentage,
        onRemove,
    } = props;

    const displayVotes = !hasModified
        ? formatterUtils.formatNumber(userVotes, { format: NumberFormat.TOKEN_AMOUNT_SHORT })
        : formatterUtils.formatNumber((percentage / 100) * totalVotingPower, {
              format: NumberFormat.TOKEN_AMOUNT_SHORT,
          });

    return (
        <DataList.Item className="bg-neutral-0 flex flex-col gap-4 rounded-xl border border-neutral-100 p-4 md:flex-row md:items-center md:justify-between">
            <div className="b-0 flex flex-1 items-center gap-3 border-b border-neutral-100 pb-4 md:border-b-0 md:border-none md:pb-0">
                <Avatar src={gaugeLogo} size="md" responsiveSize={{ md: 'lg' }} alt={gaugeName} />
                <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-base text-neutral-800">{gaugeName}</span>
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
                <span className="text-base text-neutral-800">
                    {displayVotes} {tokenSymbol}
                </span>

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
