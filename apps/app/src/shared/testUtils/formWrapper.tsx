import type { ReactNode } from 'react';
import {
    type FieldValues,
    FormProvider,
    type UseFormProps,
    useForm,
} from 'react-hook-form';

export interface IFormWrapperProps {
    /**
     * Default values of the form, needed to test components reading values seeded by their host form
     * (e.g. field-arrays initialised through the form default values).
     */
    defaultValues?: UseFormProps<FieldValues>['defaultValues'];
    /**
     * Children of the component.
     */
    children?: ReactNode;
}

export const FormWrapper: React.FC<IFormWrapperProps> = (props) => {
    const { defaultValues, children } = props;

    const formMethods = useForm({ defaultValues });

    return <FormProvider {...formMethods}>{children}</FormProvider>;
};
