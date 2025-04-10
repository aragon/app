import classNames from 'classnames';
import type { FieldValues } from 'react-hook-form';
import { type IWizardFormProps, type IWizardRootProps, Wizard } from '../../wizard';
import { WizardPageContainerProgress } from './wizardPageContainerProgress';

export interface IWizardPageContainerProps<TFormData extends FieldValues = FieldValues>
    extends IWizardRootProps<TFormData>,
        IWizardFormProps<TFormData> {
    /**
     * Name of the final step. The "next" label is hidden when not set.
     */
    finalStep?: string;
}

export const WizardPageContainer = <TFormData extends FieldValues = FieldValues>(
    props: IWizardPageContainerProps<TFormData>,
) => {
    const {
        submitLabel,
        submitHelpText,
        initialSteps,
        defaultValues,
        finalStep,
        children,
        className,
        ...wizardFormProps
    } = props;

    return (
        <Wizard.Root
            submitLabel={submitLabel}
            submitHelpText={submitHelpText}
            initialSteps={initialSteps}
            defaultValues={defaultValues}
            useDevTool={true}
        >
            <Wizard.Form className={classNames('flex h-full flex-col gap-4 md:gap-6', className)} {...wizardFormProps}>
                <WizardPageContainerProgress finalStep={finalStep} />
                {children}
            </Wizard.Form>
        </Wizard.Root>
    );
};
