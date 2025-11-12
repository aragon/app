import { useTranslations } from '@/shared/components/translationsProvider/translationsProvider';
import { Avatar, Button, formatterUtils, NumberFormat, Tag } from '@aragon/gov-ui-kit';
import classNames from 'classnames';

export interface IGaugeVoterVotingTerminalProps {
    /**
     * Number of days left to vote in the current epoch.
     */
    daysLeftToVote: number;
    /**
     * Number of days left for the next epoch to start. Valid only in the case
     * when voting is inactive.
     */
    daysToNextVoting?: number;
    /**
     * Whether the user has already voted in the current epoch.
     */
    hasVoted: boolean;
    /**
     * Formatted total voting power (e.g., "1.5K")
     */
    formattedVotingPower: string;
    /**
     * Usage percentage (0-1)
     */
    usagePercentage: number;
    /**
     * Number of selected gauges
     */
    selectedCount: number;
    /**
     * Token symbol for voting power
     */
    tokenSymbol?: string;
    /**
     * Token logo URL
     */
    tokenLogo?: string;
    /**
     * Function to handle vote action
     */
    onVote?: () => void;
    /**
     * Whether voting is active
     */
    isVotingPeriod: boolean;
    /**
     * Whether the voting data is loading
     */
    isLoading?: boolean;
}

export const GaugeVoterVotingTerminal: React.FC<IGaugeVoterVotingTerminalProps> = (props) => {
    const {
        hasVoted,
        daysLeftToVote,
        daysToNextVoting,
        formattedVotingPower,
        usagePercentage,
        selectedCount,
        tokenSymbol,
        tokenLogo,
        onVote,
        isVotingPeriod,
        isLoading = false,
    } = props;
    const { t } = useTranslations();

    const displayVotingPower = isLoading ? '--' : formattedVotingPower;

    const formattedUsagePercentage = isLoading
        ? '--'
        : formatterUtils.formatNumber(usagePercentage, {
              format: NumberFormat.PERCENTAGE_SHORT,
          });

    const showVoteButton = isVotingPeriod && (hasVoted || selectedCount > 0);

    const wrapperClassName = classNames(
        'flex flex-col gap-3 md:flex-row md:gap-6 md:items-center md:justify-between',
        'sticky bottom-3 md:bottom-6 lg:-mx-4',
        'bg-neutral-0 border border-b-0 rounded-xl p-3 md:h-[64px] md:px-4 md:py-0',
        {
            'border-neutral-100 shadow-neutral-md': !showVoteButton,
            'border-primary-100 shadow-primary-xl': showVoteButton,
        },
    );

    return (
        <div className={wrapperClassName}>
            <div className="flex flex-col gap-0 md:flex-row md:items-center md:gap-6">
                <p className="text-xs font-semibold text-neutral-800 uppercase md:text-sm">
                    {t('app.plugins.gaugeVoter.gaugeVoterVotingTerminal.yourVotes')}
                </p>
                <div className="flex items-center gap-8 md:gap-3">
                    <div className="flex items-center gap-2">
                        {tokenLogo && <Avatar size="sm" src={tokenLogo} />}
                        <div className="flex items-baseline gap-0.5">
                            <span className="text-sm text-neutral-800 md:text-lg">{displayVotingPower}</span>
                            <span className="text-xs text-neutral-500 md:text-base">{tokenSymbol}</span>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-0.5">
                        <span className="text-sm text-neutral-800 md:text-lg">{formattedUsagePercentage}</span>
                        <span className="text-xs text-neutral-500 md:text-base">
                            {t('app.plugins.gaugeVoter.gaugeVoterVotingTerminal.used')}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex w-full items-center justify-between gap-3 md:w-auto md:gap-4">
                {!isVotingPeriod && (
                    <Button size="sm" variant="primary" disabled={true} className="w-full md:w-auto">
                        {t('app.plugins.gaugeVoter.gaugeVoterVotingTerminal.nextVotingIn', { count: daysToNextVoting })}
                    </Button>
                )}
                {showVoteButton && (
                    <>
                        <Tag
                            label={t('app.plugins.gaugeVoter.gaugeVoterVotingTerminal.selected', {
                                count: selectedCount,
                            })}
                            variant="primary"
                        />
                        <Button
                            size="sm"
                            variant="primary"
                            onClick={onVote}
                            disabled={selectedCount === 0 || isLoading}
                            className="flex-1 md:w-auto md:flex-initial"
                        >
                            {hasVoted
                                ? t('app.plugins.gaugeVoter.gaugeVoterVotingTerminal.updateVote')
                                : t('app.plugins.gaugeVoter.gaugeVoterVotingTerminal.voteOnSelected')}
                        </Button>
                    </>
                )}
                {!showVoteButton && isVotingPeriod && (
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
