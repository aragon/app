import { Button } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';

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
     * Handler for distributing votes evenly.
     */
    onEqualize: () => void;
    /**
     * Handler for resetting allocations.
     */
    onReset: () => void;
}

export const GaugeVoterVoteDialogFooter: React.FC<
    IGaugeVoterVoteDialogFooterProps
> = (props) => {
    const { totalVotingPower, tokenSymbol, onEqualize, onReset } = props;

    const { t } = useTranslations();

    return (
        <div className="flex flex-col gap-group md:flex-row md:items-center md:justify-between md:gap-x-section">
            <div className="flex flex-col gap-related md:grow md:flex-row md:items-center md:gap-x-section">
                <span className="type-supporting--compact-detail type-strong text-surface-primary uppercase">
                    {t(
                        'app.plugins.gaugeVoter.gaugeVoterVoteDialog.footer.totalVotingPower',
                    )}
                </span>
                <span className="type-supporting--body-size type-strong text-surface-primary">
                    {totalVotingPower} {tokenSymbol}
                </span>
            </div>
            <div className="flex gap-related--8-12">
                <Button
                    className="w-full md:w-fit"
                    onClick={onEqualize}
                    responsiveSize={{ md: 'md' }}
                    size="sm"
                    variant="secondary"
                >
                    {t(
                        'app.plugins.gaugeVoter.gaugeVoterVoteDialog.action.equalize',
                    )}
                </Button>
                <Button
                    className="w-full md:w-fit"
                    onClick={onReset}
                    responsiveSize={{ md: 'md' }}
                    size="sm"
                    variant="tertiary"
                >
                    {t(
                        'app.plugins.gaugeVoter.gaugeVoterVoteDialog.action.reset',
                    )}
                </Button>
            </div>
        </div>
    );
};
