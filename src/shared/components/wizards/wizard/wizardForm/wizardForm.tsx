import type { ComponentProps, FormEvent } from 'react';
import { useFormContext, type FieldValues } from 'react-hook-form';
import { useWizardContext } from '../wizardProvider';

export interface IWizardFormProps<TFormData extends FieldValues = FieldValues>
    extends Omit<ComponentProps<'form'>, 'onSubmit'> {
    /**
     * Callback called at the end of the wizard with the form data when the form is valid.
     */
    onSubmit?: (data: TFormData) => void;
}

export const WizardForm = <TFormData extends FieldValues = FieldValues>(props: IWizardFormProps<TFormData>) => {
    const { children, onSubmit = () => null, ...otherProps } = props;

    const { hasNext, nextStep } = useWizardContext();
    const { handleSubmit } = useFormContext<TFormData>();

    const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const submitCallback = hasNext ? nextStep : onSubmit;
        void handleSubmit(submitCallback)(event);
    };

    return (
        <form onSubmit={handleFormSubmit} {...otherProps}>
            {children}
        </form>
    );
};
