import { useTranslations } from '@/shared/components/translationsProvider/translationsProvider';
import { Avatar, Button, formatterUtils, NumberFormat, Tag } from '@aragon/gov-ui-kit';

export interface IGaugeVoterVotingTerminalProps {
    /**
     * Number of days left to vote in the current epoch.
     */
    daysLeftToVote: number;
    /**
     * Whether the user has already voted in the current epoch.
     */
    hasVoted: boolean;
    /**
     * Total voting power available
     */
    totalVotingPower: string;
    /**
     * Used voting power amount
     */
    usedVotingPower: string;
    /**
     * Number of selected gauges
     */
    selectedCount: number;
    /**
     * Token symbol for voting power
     */
    tokenSymbol: string;
    /**
     * Token logo URL
     */
    tokenLogo?: string;
    /**
     * Function to handle vote action
     */
    onVote?: () => void;
}

export const GaugeVoterVotingTerminal: React.FC<IGaugeVoterVotingTerminalProps> = (props) => {
    const {
        hasVoted,
        daysLeftToVote,
        totalVotingPower,
        usedVotingPower,
        selectedCount,
        tokenSymbol,
        tokenLogo,
        onVote,
    } = props;
    const { t } = useTranslations();

    const formattedTotalPower = formatterUtils.formatNumber(totalVotingPower, {
        format: NumberFormat.TOKEN_AMOUNT_SHORT,
    });

    const usagePercentage = totalVotingPower !== '0' ? (Number(usedVotingPower) / Number(totalVotingPower)) * 100 : 0;

    const formattedUsagePercentage = formatterUtils.formatNumber(usagePercentage, {
        format: NumberFormat.PERCENTAGE_SHORT,
    });

    const showVoteButton = hasVoted || selectedCount > 0;

    return (
        <div className="bg-neutral-0 border-primary-100 flex items-center justify-between rounded-xl border px-6 py-3">
            <div className="flex items-center gap-6">
                <p className="text-sm font-semibold text-neutral-800 uppercase">
                    {t('app.plugins.gaugeVoter.gaugeVoterVotingTerminal.yourVotes')}
                </p>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        {tokenLogo && <Avatar size="sm" src={tokenLogo} alt={`${tokenSymbol} token`} />}
                        <div className="flex items-baseline gap-0.5">
                            <span className="text-lg text-neutral-800">{formattedTotalPower}</span>
                            <span className="text-base text-neutral-500">{tokenSymbol}</span>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-0.5">
                        <span className="text-lg text-neutral-800">{formattedUsagePercentage}</span>
                        <span className="text-base text-neutral-500">
                            {t('app.plugins.gaugeVoter.gaugeVoterVotingTerminal.used')}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                {showVoteButton && (
                    <>
                        <Tag
                            label={t('app.plugins.gaugeVoter.gaugeVoterVotingTerminal.selected', {
                                count: selectedCount,
                            })}
                            variant="primary"
                        />
                        <Button size="sm" variant="primary" onClick={onVote} disabled={selectedCount === 0}>
                            {t('app.plugins.gaugeVoter.gaugeVoterVotingTerminal.voteOnSelected')}
                        </Button>
                    </>
                )}
                {!showVoteButton && (
                    <>
                        <span className="text-sm text-neutral-500">
                            {t('app.plugins.gaugeVoter.gaugeVoterVotingTerminal.daysLeft', { count: daysLeftToVote })}
                        </span>
                        <Tag label={t('app.plugins.gaugeVoter.gaugeVoterVotingTerminal.notVoted')} />
                    </>
                )}
            </div>
        </div>
    );
};
