import { useTranslations } from '@/shared/components/translationsProvider';
import { Avatar, Button } from '@aragon/gov-ui-kit';

export interface IGaugeVoterVoteDialogFooterProps {
    /**
     * Total voting power available.
     */
    totalVotingPower: string;
    /**
     * Token symbol for display.
     */
    tokenSymbol?: string;
    /**
     * Total percentage used.
     */
    totalPercentageUsed: number;
    /**
     * Handler for distributing votes evenly.
     */
    onEqualize: () => void;
    /**
     * Handler for resetting allocations.
     */
    onReset: () => void;
}

export const GaugeVoterVoteDialogFooter: React.FC<IGaugeVoterVoteDialogFooterProps> = (props) => {
    const { totalVotingPower, tokenSymbol, totalPercentageUsed, onEqualize, onReset } = props;

    const { t } = useTranslations();

    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-x-6">
            <div className="flex flex-col gap-3 md:grow md:flex-row md:items-center md:gap-x-6">
                <span className="text-sm font-semibold text-neutral-800 uppercase">
                    {t('app.plugins.gaugeVoter.gaugeVoterVoteDialog.footer.yourVotes')}
                </span>
                <div className="flex items-center gap-x-3">
                    <div className="flex items-center gap-x-2">
                        <Avatar
                            size="sm"
                            responsiveSize={{ md: 'sm' }}
                            alt="Token logo"
                            src="https://pbs.twimg.com/profile_images/1851934141782331394/Z0ZqlyIo_400x400.png"
                        />
                        <span className="text-base font-semibold text-neutral-800">
                            {totalVotingPower} {tokenSymbol}
                        </span>
                    </div>
                    <div className="flex items-center gap-x-1 text-lg">
                        {totalPercentageUsed}%
                        <span className="text-base text-neutral-500">
                            {' '}
                            {t('app.plugins.gaugeVoter.gaugeVoterVoteDialog.content.used')}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex gap-2 md:gap-3">
                <Button
                    variant="secondary"
                    size="sm"
                    responsiveSize={{ md: 'md' }}
                    onClick={onEqualize}
                    className="w-full md:w-fit"
                >
                    {t('app.plugins.gaugeVoter.gaugeVoterVoteDialog.action.equalize')}
                </Button>
                <Button
                    variant="tertiary"
                    size="sm"
                    responsiveSize={{ md: 'md' }}
                    onClick={onReset}
                    className="w-full md:w-fit"
                >
                    {t('app.plugins.gaugeVoter.gaugeVoterVoteDialog.action.reset')}
                </Button>
            </div>
        </div>
    );
};
