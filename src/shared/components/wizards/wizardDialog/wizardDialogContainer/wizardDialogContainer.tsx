import { useDialogContext } from '@/shared/components/dialogProvider';
import { Dialog } from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
import type { FieldValues } from 'react-hook-form';
import { type IWizardFormProps, type IWizardRootProps, Wizard } from '../../wizard';
import { WizardDialogContainerFooter } from './wizardDialogContainerFooter';

export interface IWizardDialogContainerProps<TFormData extends FieldValues = FieldValues>
    extends IWizardRootProps<TFormData>,
        Omit<IWizardFormProps<TFormData>, 'id'> {
    /**
     * Title of the wizard.
     */
    title: string;
    /**
     * Optional description of the wizard.
     */
    description?: string;
    /**
     * ID of the form, needed to link the submit button to the form element.
     */
    formId: string;
}

export const WizardDialogContainer = <TFormData extends FieldValues = FieldValues>(
    props: IWizardDialogContainerProps<TFormData>,
) => {
    const { title, description, formId, initialSteps, submitLabel, onSubmit, children, defaultValues, ...formProps } =
        props;

    const { close, updateOptions } = useDialogContext();

    useEffect(() => {
        updateOptions({ disableOutsideClick: true });
    }, [updateOptions]);

    return (
        <>
            <Wizard.Root submitLabel={submitLabel} initialSteps={initialSteps} defaultValues={defaultValues}>
                <Dialog.Header title={title} onClose={close} />
                <Dialog.Content description={description} className="pb-1.5">
                    <Wizard.Form onSubmit={onSubmit} id={formId} className="pt-6" {...formProps}>
                        {children}
                    </Wizard.Form>
                </Dialog.Content>
                <WizardDialogContainerFooter formId={formId} />
            </Wizard.Root>
        </>
    );
};
