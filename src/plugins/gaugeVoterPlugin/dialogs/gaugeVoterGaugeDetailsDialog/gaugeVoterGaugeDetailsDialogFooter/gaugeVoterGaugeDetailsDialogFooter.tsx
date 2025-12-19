import { Button } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IGaugeVoterGaugeDetailsDialogFooterProps {
    /**
     * Handler for navigating to the previous gauge.
     */
    onPrevious: () => void;
    /**
     * Handler for navigating to the next gauge.
     */
    onNext: () => void;
    /**
     * Whether the previous button should be disabled.
     */
    disablePrevious?: boolean;
    /**
     * Whether the next button should be disabled.
     */
    disableNext?: boolean;
    /**
     * Current gauge number (1-based).
     */
    currentGaugeNumber: number;
    /**
     * Total number of gauges.
     */
    totalGauges: number;
}

export const GaugeVoterGaugeDetailsDialogFooter: React.FC<
    IGaugeVoterGaugeDetailsDialogFooterProps
> = (props) => {
    const {
        onPrevious,
        onNext,
        disablePrevious = false,
        disableNext = false,
        currentGaugeNumber,
        totalGauges,
    } = props;

    const { t } = useTranslations();

    return (
        <div className="flex w-full grow items-center justify-between px-4 pb-4 md:px-6 md:pb-6">
            <Button
                disabled={disablePrevious}
                onClick={onPrevious}
                size="md"
                variant="tertiary"
            >
                {t(
                    'app.plugins.gaugeVoter.gaugeVoterGaugeDetailsDialog.footer.previous',
                )}
            </Button>
            <span className="text-neutral-500 text-sm">
                {currentGaugeNumber} / {totalGauges}
            </span>
            <Button
                disabled={disableNext}
                onClick={onNext}
                size="md"
                variant="secondary"
            >
                {t(
                    'app.plugins.gaugeVoter.gaugeVoterGaugeDetailsDialog.footer.next',
                )}
            </Button>
        </div>
    );
};
