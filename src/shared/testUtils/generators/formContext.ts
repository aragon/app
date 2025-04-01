import type { Control, FormState, UseFormReturn } from 'react-hook-form';

export const generateFormContextState = <TFormValues extends object = object>(
    state?: Partial<FormState<TFormValues>>,
): FormState<TFormValues> => ({
    isDirty: false,
    isLoading: false,
    isSubmitted: false,
    isSubmitSuccessful: false,
    isSubmitting: false,
    isValidating: false,
    isValid: false,
    disabled: false,
    submitCount: 0,
    dirtyFields: {},
    touchedFields: {},
    validatingFields: {},
    errors: {},
    ...state,
});

export const generateFormContext = (values?: Partial<UseFormReturn>): UseFormReturn => ({
    watch: jest.fn(),
    getValues: jest.fn(),
    getFieldState: jest.fn(),
    setError: jest.fn(),
    clearErrors: jest.fn(),
    setValue: jest.fn(),
    trigger: jest.fn(),
    resetField: jest.fn(),
    reset: jest.fn(),
    handleSubmit: jest.fn(),
    unregister: jest.fn(),
    register: jest.fn(),
    setFocus: jest.fn(),
    control: {} as Control,
    formState: generateFormContextState(values?.formState),
    subscribe: jest.fn(),
    ...values,
});
