import { useTranslations } from '@/shared/components/translationsProvider';
import { Button } from '@aragon/gov-ui-kit';

export interface IGaugeVoterGaugeDetailsDialogFooterProps {
    /**
     * Handler for navigating to the previous gauge.
     */
    onPrevious: () => void;
    /**
     * Handler for navigating to the next gauge.
     */
    onNext: () => void;
}

export const GaugeVoterGaugeDetailsDialogFooter: React.FC<IGaugeVoterGaugeDetailsDialogFooterProps> = (props) => {
    const { onPrevious, onNext } = props;

    const { t } = useTranslations();

    return (
        <div className="flex w-full grow justify-between px-4 pb-4 md:px-6 md:pb-6">
            <Button variant="tertiary" size="md" onClick={onPrevious}>
                {t('app.plugins.gaugeVoter.gaugeVoterGaugeDetailsDialog.footer.previous')}
            </Button>
            <Button variant="secondary" size="md" onClick={onNext}>
                {t('app.plugins.gaugeVoter.gaugeVoterGaugeDetailsDialog.footer.next')}
            </Button>
        </div>
    );
};
