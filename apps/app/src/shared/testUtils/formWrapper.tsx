import type { ReactNode } from 'react';
import { type DefaultValues, FormProvider, useForm } from 'react-hook-form';

export interface IFormWrapperProps {
    /**
     * Initial values of the form.
     */
    defaultValues?: DefaultValues<Record<string, unknown>>;
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
