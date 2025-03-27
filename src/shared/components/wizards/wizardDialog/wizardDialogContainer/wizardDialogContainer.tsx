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
    descriptionKey: string;
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
    const {
        title,
        descriptionKey,
        formId,
        onClose,
        isOpen,
        initialSteps,
        submitLabel,
        onSubmit,
        children,
        ...formProps
    } = props;

    if (!isOpen) {
        return null;
    }

    return (
        <Dialog.Root size="lg" open={true} hiddenDescription={descriptionKey} onOpenChange={onClose}>
            <Wizard.Root submitLabel={submitLabel} initialSteps={initialSteps}>
                <Dialog.Header title={title} onClose={onClose} />
                <Dialog.Content className="pb-1.5 pt-6">
                    <Wizard.Form onSubmit={onSubmit} id={formId} {...formProps}>
                        {children}
                    </Wizard.Form>
                </Dialog.Content>
                <WizardDialogContainerFooter formId={formId} onClose={onClose} />
            </Wizard.Root>
        </Dialog.Root>
    );
};
