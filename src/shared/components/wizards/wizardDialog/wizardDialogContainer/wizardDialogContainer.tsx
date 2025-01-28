import { DialogRootHiddenElement } from '@/shared/components/dialogRoot';
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
     * Translation key of the wizard description, hidden and only used for dialog accessibility.
     */
    description: string;
    /**
     * ID of the form, needed to link the submit button to the form element.
     */
    formId: string;
    /**
     * Callback called on dialog close.
     */
    onClose: () => void;
    /**
     * Defines if the dialog should be rendered or not.
     */
    isOpen?: boolean;
}

export const WizardDialogContainer = <TFormData extends FieldValues = FieldValues>(
    props: IWizardDialogContainerProps<TFormData>,
) => {
    const { title, description, formId, onClose, isOpen, initialSteps, submitLabel, onSubmit, ...formProps } = props;

    if (!isOpen) {
        return null;
    }

    return (
        <Dialog.Root size="lg" open={true} onOpenChange={onClose}>
            <Wizard.Root submitLabel={submitLabel} initialSteps={initialSteps}>
                <Dialog.Header title={title} />
                <DialogRootHiddenElement type="description" labelKey={description} />
                <Dialog.Content>
                    <Wizard.Form onSubmit={onSubmit} id={formId} {...formProps}>
                        <Wizard.Step id="1" order={1} meta={{ name: 'step 1' }}>
                            <p>Step 1</p>
                        </Wizard.Step>
                        <Wizard.Step id="2" order={2} meta={{ name: 'step 2' }}>
                            <p>Step 2</p>
                        </Wizard.Step>
                    </Wizard.Form>
                </Dialog.Content>
                <WizardDialogContainerFooter formId={formId} />
            </Wizard.Root>
        </Dialog.Root>
    );
};
