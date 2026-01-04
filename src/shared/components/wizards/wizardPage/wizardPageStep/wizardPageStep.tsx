import {
    AlertCard,
    Button,
    Dropdown,
    Heading,
    IconType,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    type IWizardStepProps,
    useWizardContext,
    useWizardFooter,
    Wizard,
} from '../../wizard';

export interface IWizardPageStepDropdownItem {
    /**
     * Label of the dropdown item.
     */
    label: string;
    /**
     * ID of the form to trigger the submit for.
     */
    formId?: string;
    /**
     * Function triggered on dropdown item click.
     */
    onClick?: () => void;
}

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
    nextDropdownItems?: IWizardPageStepDropdownItem[];
}

export const WizardPageStep: React.FC<IWizardPageStepProps> = (props) => {
    const {
        title,
        description,
        children,
        className,
        nextDropdownItems,
        ...otherProps
    } = props;

    const { t } = useTranslations();

    const { hasPrevious } = useWizardContext();
    const {
        displayValidationError,
        validationStatus,
        submitLabel,
        submitVariant,
        onPreviousClick,
        submitHelpText,
    } = useWizardFooter();

    return (
        <Wizard.Step
            className={classNames(
                'flex h-full flex-col justify-between gap-10 md:gap-20',
                className,
            )}
            {...otherProps}
        >
            <div className="flex flex-col gap-6 md:gap-12">
                <div className="flex flex-col gap-2">
                    <Heading size="h1">{title}</Heading>
                    <p className="font-normal text-base text-neutral-500 leading-normal md:text-lg">
                        {description}
                    </p>
                </div>
                {children}
            </div>
            <div className="flex flex-col gap-6">
                {displayValidationError && (
                    <AlertCard
                        message={t(
                            `app.shared.wizardPage.step.error.${validationStatus}.title`,
                        )}
                        variant="critical"
                    >
                        {t(
                            `app.shared.wizardPage.step.error.${validationStatus}.description`,
                        )}
                    </AlertCard>
                )}
                <div className="flex flex-col gap-3">
                    <div className="flex flex-row justify-between">
                        <Button
                            className={hasPrevious ? undefined : 'invisible'}
                            iconLeft={IconType.CHEVRON_LEFT}
                            onClick={onPreviousClick}
                            size="lg"
                            variant="tertiary"
                        >
                            {t('app.shared.wizardPage.step.back')}
                        </Button>
                        {nextDropdownItems != null &&
                        nextDropdownItems.length > 0 ? (
                            <Dropdown.Container
                                label={submitLabel}
                                size="lg"
                                variant={submitVariant}
                            >
                                {nextDropdownItems.map(
                                    ({ label, onClick, formId }) => (
                                        <Dropdown.Item
                                            formId={formId}
                                            key={label}
                                            onClick={onClick}
                                        >
                                            {label}
                                        </Dropdown.Item>
                                    ),
                                )}
                            </Dropdown.Container>
                        ) : (
                            <Button
                                iconRight={IconType.CHEVRON_RIGHT}
                                size="lg"
                                type="submit"
                                variant={submitVariant}
                            >
                                {submitLabel}
                            </Button>
                        )}
                    </div>
                    {submitHelpText && (
                        <p className="text-right font-normal text-neutral-500 text-sm leading-tight">
                            {submitHelpText}
                        </p>
                    )}
                </div>
            </div>
        </Wizard.Step>
    );
};
