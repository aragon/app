import { useTranslations } from '@/shared/components/translationsProvider';
import { Progress } from '@aragon/gov-ui-kit';
import { useWizardContext } from '../../wizard';

export interface IWizardPageContainerProgressProps {
    /**
     * Name of the final step. The "next" label is hidden when not set.
     */
    finalStep?: string;
}

export const WizardPageContainerProgress = (props: IWizardPageContainerProgressProps) => {
    const { finalStep } = props;

    const { t } = useTranslations();
    const { steps, activeStepIndex, hasNext } = useWizardContext();

    const nextStepName = hasNext ? steps[activeStepIndex + 1].meta.name : finalStep;
    const wizardProgress = ((activeStepIndex + 1) * 100) / steps.length;

    return (
        <div className="flex flex-col gap-1.5 md:gap-3">
            <div className="flex flex-row justify-between">
                <div className="flex flex-row gap-1 text-base font-normal leading-tight">
                    <span className="text-primary-400">
                        {t('app.shared.wizardPage.container.step', { number: activeStepIndex + 1 })}
                    </span>
                    <span className="text-neutral-500">
                        {t('app.shared.wizardPage.container.total', { total: steps.length })}
                    </span>
                </div>
                {nextStepName != null && (
                    <div className="flex flex-row gap-1 text-base font-normal leading-tight">
                        <span className="text-neutral-500">{t('app.shared.wizardPage.container.next')}</span>
                        <span className="text-neutral-800">{nextStepName}</span>
                    </div>
                )}
            </div>
            <Progress value={wizardProgress} variant="primary" size="sm" />
        </div>
    );
};
