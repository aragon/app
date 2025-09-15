import { useTranslations } from '@/shared/components/translationsProvider';
import { AlertCard, Button, Dropdown, Heading, IconType } from '@aragon/gov-ui-kit';
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
    /**
     * Instead of "Next" button, render a dropdown with given items.
     */
    nextDropdownItems?: Array<{ label: string; formId?: string; onClick?: () => void }>;
}

export const WizardPageStep: React.FC<IWizardPageStepProps> = (props) => {
    const { title, description, children, className, nextDropdownItems, ...otherProps } = props;

    const { t } = useTranslations();

    const { hasPrevious } = useWizardContext();
    const { displayValidationError, validationStatus, submitLabel, submitVariant, onPreviousClick, submitHelpText } =
        useWizardFooter();

    return (
        <Wizard.Step
            className={classNames('flex h-full flex-col justify-between gap-10 md:gap-20', className)}
            {...otherProps}
        >
            <div className="flex flex-col gap-6 md:gap-12">
                <div className="flex flex-col gap-2">
                    <Heading size="h1">{title}</Heading>
                    <p className="text-base leading-normal font-normal text-neutral-500 md:text-lg">{description}</p>
                </div>
                {children}
            </div>
            <div className="flex flex-col gap-6">
                {displayValidationError && (
                    <AlertCard
                        message={t(`app.shared.wizardPage.step.error.${validationStatus}.title`)}
                        variant="critical"
                    >
                        {t(`app.shared.wizardPage.step.error.${validationStatus}.description`)}
                    </AlertCard>
                )}
                <div className="flex flex-col gap-3">
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
                        {nextDropdownItems != null && nextDropdownItems.length > 0 ? (
                            <Dropdown.Container size="lg" label={submitLabel} variant={submitVariant}>
                                {nextDropdownItems.map(({ label, onClick, formId }) => (
                                    <Dropdown.Item key={label} onClick={onClick} formId={formId}>
                                        {label}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Container>
                        ) : (
                            <Button iconRight={IconType.CHEVRON_RIGHT} variant={submitVariant} size="lg" type="submit">
                                {submitLabel}
                            </Button>
                        )}
                    </div>
                    {submitHelpText && (
                        <p className="text-right text-sm leading-tight font-normal text-neutral-500">
                            {submitHelpText}
                        </p>
                    )}
                </div>
            </div>
        </Wizard.Step>
    );
};
