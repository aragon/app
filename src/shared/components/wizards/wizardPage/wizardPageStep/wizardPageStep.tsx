import { useTranslations } from '@/shared/components/translationsProvider';
import { AlertCard, Button, Heading, IconType } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useWizardContext, useWizardFooter, Wizard, type IWizardStepProps } from '../../wizard';

export interface IWizardPageStepProps extends IWizardStepProps {
    /**
     * Title of the step.
     */
    title: string;
    /**
     * Description of the step.
     */
    description: string;
}

export const WizardPageStep: React.FC<IWizardPageStepProps> = (props) => {
    const { title, description, children, className, ...otherProps } = props;

    const { hasPrevious } = useWizardContext();

    const { t } = useTranslations();
    const { displayValidationError, validationStatus, submitLabel, submitVariant, onPreviousClick } = useWizardFooter();

    return (
        <Wizard.Step
            className={classNames('flex h-full flex-col justify-between gap-10 md:gap-20', className)}
            {...otherProps}
        >
            <div className="flex flex-col gap-6 md:gap-12">
                <div className="flex flex-col gap-2">
                    <Heading size="h1">{title}</Heading>
                    <p className="text-base font-normal leading-normal text-neutral-500 md:text-lg">{description}</p>
                </div>
                {children}
            </div>
            <div className="flex flex-col gap-6">
                {displayValidationError && (
                    <AlertCard
                        message={t(`app.shared.wizardPage.step.error.${validationStatus}.title`)}
                        description={t(`app.shared.wizardPage.step.error.${validationStatus}.description`)}
                        variant="critical"
                    />
                )}
                <div className="flex flex-row justify-between">
                    <Button
                        className={!hasPrevious ? 'invisible' : undefined}
                        iconLeft={IconType.CHEVRON_LEFT}
                        onClick={onPreviousClick}
                        variant="tertiary"
                        size="lg"
                    >
                        {t('app.shared.wizardPage.step.back')}
                    </Button>
                    <Button iconRight={IconType.CHEVRON_RIGHT} variant={submitVariant} size="lg" type="submit">
                        {submitLabel}
                    </Button>
                </div>
            </div>
        </Wizard.Step>
    );
};
