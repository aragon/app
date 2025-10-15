import { useTranslations } from '@/shared/components/translationsProvider/translationsProvider';
import { Avatar, Button, formatterUtils, NumberFormat, Tag } from '@aragon/gov-ui-kit';
import classNames from 'classnames';

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
    totalVotingPower?: string | number;
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
    /**
     * Whether voting is active
     */
    isVotingActive: boolean;
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
        isVotingActive,
    } = props;
    const { t } = useTranslations();

    const formattedTotalPower = formatterUtils.formatNumber(totalVotingPower, {
        format: NumberFormat.TOKEN_AMOUNT_SHORT,
    });

    const usagePercentage = totalVotingPower !== '0' ? Number(usedVotingPower) / Number(totalVotingPower) : 0;

    const formattedUsagePercentage = formatterUtils.formatNumber(usagePercentage, {
        format: NumberFormat.PERCENTAGE_SHORT,
    });

    const showVoteButton = isVotingActive && (hasVoted || selectedCount > 0);

    const wrapperClassName = classNames(
        'bg-neutral-0 sticky bottom-3 flex flex-col gap-3 rounded-xl border px-4 py-3 md:bottom-6 lg:-mx-8 md:h-[58px] md:flex-row md:items-center md:justify-between md:gap-6 md:px-6',
        {
            'border-neutral-100 shadow-neutral-md': !showVoteButton,
            'border-primary-100 shadow-primary-xl': showVoteButton,
        },
    );

    return (
        <div className={wrapperClassName}>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
                <p className="text-sm font-semibold text-neutral-800 uppercase">
                    {t('app.plugins.gaugeVoter.gaugeVoterVotingTerminal.yourVotes')}
                </p>
                <div className="flex items-center gap-4">
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
            <div className="flex w-full items-center justify-between gap-3 md:w-auto md:gap-4">
                {!isVotingActive && (
                    <Button size="sm" variant="primary" disabled={true} className="w-full md:w-auto">
                        {t('app.plugins.gaugeVoter.gaugeVoterVotingTerminal.nextVotingIn', { count: 7 })}
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
                            disabled={selectedCount === 0}
                            className="flex-1 md:w-auto md:flex-initial"
                        >
                            {hasVoted
                                ? t('app.plugins.gaugeVoter.gaugeVoterVotingTerminal.updateVote')
                                : t('app.plugins.gaugeVoter.gaugeVoterVotingTerminal.voteOnSelected')}
                        </Button>
                    </>
                )}
                {!showVoteButton && isVotingActive && (
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
