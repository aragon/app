import { useDialogContext } from '@/shared/components/dialogProvider';
import { Dialog } from '@aragon/gov-ui-kit';
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
     * ID of the form, needed to link the submit button to the form element.
     */
    formId: string;
}

export const WizardDialogContainer = <TFormData extends FieldValues = FieldValues>(
    props: IWizardDialogContainerProps<TFormData>,
) => {
    const { title, formId, initialSteps, submitLabel, onSubmit, children, defaultValues, ...formProps } = props;

    const { close } = useDialogContext();

    return (
        <>
            <Wizard.Root submitLabel={submitLabel} initialSteps={initialSteps} defaultValues={defaultValues}>
                <Dialog.Header title={title} onClose={close} />
                <Dialog.Content className="pb-1.5 pt-6">
                    <Wizard.Form onSubmit={onSubmit} id={formId} {...formProps}>
                        {children}
                    </Wizard.Form>
                </Dialog.Content>
                <WizardDialogContainerFooter formId={formId} />
            </Wizard.Root>
        </>
    );
};
