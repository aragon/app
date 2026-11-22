import {
    Avatar,
    Button,
    formatterUtils,
    NumberFormat,
    Tag,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useTranslations } from '@/shared/components/translationsProvider/translationsProvider';

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

export const GaugeVoterVotingTerminal: React.FC<
    IGaugeVoterVotingTerminalProps
> = (props) => {
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
        'flex flex-col gap-group-stepped--12-24 md:flex-row md:items-center md:justify-between',
        'sticky bottom-3 md:bottom-6 lg:-mx-4',
        'rounded-xl border border-b-0 bg-surface-primary px-inset-surface-flat--12-16 md:h-[64px] max-md:py-inset-surface-flat',
        {
            'border-surface-secondary shadow-surface-md': !showVoteButton,
            'border-accent-primary-terminal shadow-primary-xl': showVoteButton,
        },
    );

    return (
        <div className={wrapperClassName}>
            <div className="flex flex-col md:flex-row md:items-center md:gap-section">
                <p className="type-caption--framework-leading type-strong text-surface-primary uppercase">
                    {t(
                        'app.plugins.gaugeVoter.gaugeVoterVotingTerminal.yourVotes',
                    )}
                </p>
                <div className="flex items-center gap-section--fixed-32 md:gap-related">
                    <div className="flex items-center gap-tight--fixed-8">
                        {tokenLogo && <Avatar size="sm" src={tokenLogo} />}
                        <div className="flex flex-wrap items-baseline gap-phrase--fixed-2">
                            <span className="type-stat--voting-terminal text-surface-primary">
                                {displayVotingPower}
                            </span>
                            <span className="type-caption--voting-terminal text-surface-secondary">
                                {tokenSymbol}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-phrase--fixed-2">
                        <span className="type-stat--voting-terminal text-surface-primary">
                            {formattedUsagePercentage}
                        </span>
                        <span className="type-caption--voting-terminal text-surface-secondary">
                            {t(
                                'app.plugins.gaugeVoter.gaugeVoterVotingTerminal.used',
                            )}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex w-full items-center justify-between gap-related--12-16 md:w-auto">
                {!isVotingPeriod && (
                    <Button
                        className="w-full md:w-auto"
                        disabled={true}
                        size="sm"
                        variant="primary"
                    >
                        {t(
                            'app.plugins.gaugeVoter.gaugeVoterVotingTerminal.nextVotingIn',
                            { count: daysToNextVoting },
                        )}
                    </Button>
                )}
                {showVoteButton && (
                    <>
                        <Tag
                            label={t(
                                'app.plugins.gaugeVoter.gaugeVoterVotingTerminal.selected',
                                {
                                    count: selectedCount,
                                },
                            )}
                            variant="primary"
                        />
                        <Button
                            className="flex-1 md:w-auto md:flex-initial"
                            disabled={selectedCount === 0 || isLoading}
                            onClick={onVote}
                            size="sm"
                            variant="primary"
                        >
                            {hasVoted
                                ? t(
                                      'app.plugins.gaugeVoter.gaugeVoterVotingTerminal.updateVote',
                                  )
                                : t(
                                      'app.plugins.gaugeVoter.gaugeVoterVotingTerminal.voteOnSelected',
                                  )}
                        </Button>
                    </>
                )}
                {!showVoteButton && isVotingPeriod && (
                    <>
                        <span className="type-supporting--compact-detail text-surface-secondary">
                            {t(
                                'app.plugins.gaugeVoter.gaugeVoterVotingTerminal.daysLeft',
                                { count: daysLeftToVote },
                            )}
                        </span>
                        <Tag
                            label={t(
                                'app.plugins.gaugeVoter.gaugeVoterVotingTerminal.notVoted',
                            )}
                        />
                    </>
                )}
            </div>
        </div>
    );
};
