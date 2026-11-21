import { Dialog } from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
import type { FieldValues } from 'react-hook-form';
import { useDialogContext } from '@/shared/components/dialogProvider';
import {
    type IWizardFormProps,
    type IWizardRootProps,
    Wizard,
} from '../../wizard';
import { WizardDialogContainerFooter } from './wizardDialogContainerFooter';

export interface IWizardDialogContainerProps<
    TFormData extends FieldValues = FieldValues,
> extends IWizardRootProps<TFormData>,
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
    /**
     * Id of this dialog: the footer's Close then closes only this dialog of the stack; omitted closes all. The header
     * close button already closes only its own dialog, through the dialog root.
     */
    dialogId?: string;
}

export const WizardDialogContainer = <
    TFormData extends FieldValues = FieldValues,
>(
    props: IWizardDialogContainerProps<TFormData>,
) => {
    const {
        title,
        description,
        formId,
        dialogId,
        initialSteps,
        submitLabel,
        onSubmit,
        children,
        defaultValues,
        ...formProps
    } = props;

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const { close, updateOptions } = useDialogContext();

    useEffect(() => {
        updateOptions({ disableOutsideClick: true });
    }, [updateOptions]);

    return (
        <Wizard.Root
            defaultValues={defaultValues}
            initialSteps={initialSteps}
            submitLabel={submitLabel}
        >
            <Dialog.Header
                description={description}
                onClose={close}
                title={title}
            />
            <Dialog.Content className="pb-1.5">
                <Wizard.Form
                    className="pt-6"
                    id={formId}
                    onSubmit={onSubmit}
                    {...formProps}
                >
                    {children}
                </Wizard.Form>
            </Dialog.Content>
            <WizardDialogContainerFooter dialogId={dialogId} formId={formId} />
        </Wizard.Root>
    );
};
