import type { ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

export interface IFormWrapperProps {
    /**
     * Children of the component.
     */
    children?: ReactNode;
}

export const FormWrapper: React.FC<IFormWrapperProps> = (props) => {
    const { children } = props;

    const formMethods = useForm();

    return <FormProvider {...formMethods}>{children}</FormProvider>;
};
