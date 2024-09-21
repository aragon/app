import { renderHook } from '@testing-library/react';
import * as ReactHookForm from 'react-hook-form';
import { useFormField } from './useFormField';

// Needed to spy usage of useFormContext hook
jest.mock('react-hook-form', () => ({ __esModule: true, ...jest.requireActual('react-hook-form') }));

describe('useFormField hook', () => {
    const useControllerSpy = jest.spyOn(ReactHookForm, 'useController');

    afterEach(() => {
        useControllerSpy.mockReset();
    });

    it('register the form field with the specified name and options and returns the field values', () => {
        const name = 'title';
        const options = { disabled: false, defaultValue: 'My title' };
        const fieldValues = { field: { onChange: jest.fn() }, fieldState: {} };
        useControllerSpy.mockReturnValue(fieldValues as unknown as ReactHookForm.UseControllerReturn);
        const { result } = renderHook(() => useFormField<ReactHookForm.FieldValues, string>(name, options));
        expect(useControllerSpy).toHaveBeenCalledWith({ name, ...options });
        expect(result.current).toEqual(expect.objectContaining(fieldValues.field));
    });

    it('returns critical variant when field has error', () => {
        const fieldState = { error: 'some-error' };
        const fieldValues = { field: {}, fieldState };
        useControllerSpy.mockReturnValue(fieldValues as unknown as ReactHookForm.UseControllerReturn);
        const { result } = renderHook(() => useFormField<ReactHookForm.FieldValues, string>('field'));
        expect(result.current.variant).toEqual('critical');
    });

    it('returns default variant when field has no error', () => {
        const fieldState = { error: undefined };
        const fieldValues = { field: {}, fieldState };
        useControllerSpy.mockReturnValue(fieldValues as unknown as ReactHookForm.UseControllerReturn);
        const { result } = renderHook(() => useFormField<ReactHookForm.FieldValues, string>('field'));
        expect(result.current.variant).toEqual('default');
    });

    it('returns correct alert message when field has error', () => {
        const error = { type: 'required' };
        const fieldState = { error };
        const fieldValues = { field: {}, fieldState };
        const label = 'Summary';
        useControllerSpy.mockReturnValue(fieldValues as unknown as ReactHookForm.UseControllerReturn);
        const { result } = renderHook(() => useFormField<ReactHookForm.FieldValues, string>('field-name', { label }));
        expect(result.current.alert?.message).toMatch(/formField.error.required \(name=Summary/);
        expect(result.current.alert?.variant).toEqual('critical');
    });

    it('defaults alert message field name to name property when label is not set', () => {
        const error = { type: 'minLength' };
        const fieldState = { error };
        const fieldValues = { field: {}, fieldState };
        const name = 'field-name';
        useControllerSpy.mockReturnValue(fieldValues as unknown as ReactHookForm.UseControllerReturn);
        const { result } = renderHook(() => useFormField<ReactHookForm.FieldValues, string>(name));
        expect(result.current.alert?.message).toMatch(/formField.error.minLength \(name=field-name/);
    });

    it('returns alert set to undefined when field has no errors', () => {
        const fieldState = { error: undefined };
        const fieldValues = { field: {}, fieldState };
        useControllerSpy.mockReturnValue(fieldValues as unknown as ReactHookForm.UseControllerReturn);
        const { result } = renderHook(() => useFormField<ReactHookForm.FieldValues, string>('field'));
        expect(result.current.alert).toBeUndefined();
    });

    it('forwards the shouldUnregister option correctly to useController', () => {
        const options = { shouldUnregister: true };
        const fieldValues = { field: {}, fieldState: {} };
        useControllerSpy.mockReturnValue(fieldValues as unknown as ReactHookForm.UseControllerReturn);
        renderHook(() => useFormField<ReactHookForm.FieldValues, string>('test', options));
        expect(useControllerSpy).toHaveBeenCalledWith(expect.objectContaining({ shouldUnregister: true }));
    });

    it('appends the fieldPrefix to the field name when specified', () => {
        const name = 'test';
        const fieldPrefix = 'proposalContext';
        const expectedName = `${fieldPrefix}.${name}`;
        const fieldValues = { field: {}, fieldState: {} };
        useControllerSpy.mockReturnValue(fieldValues as unknown as ReactHookForm.UseControllerReturn);
        renderHook(() => useFormField<ReactHookForm.FieldValues, string>(name, { fieldPrefix }));
        expect(useControllerSpy).toHaveBeenCalledWith(expect.objectContaining({ name: expectedName }));
    });

    it('uses the min value set on the rule to generate the alert message', () => {
        const error = { type: 'min' };
        const fieldState = { error };
        const fieldValues = { field: {}, fieldState };
        const fieldName = 'amount';
        useControllerSpy.mockReturnValue(fieldValues as unknown as ReactHookForm.UseControllerReturn);
        const rules = { min: 10 };
        const { result } = renderHook(() => useFormField<ReactHookForm.FieldValues, string>(fieldName, { rules }));
        expect(result.current.alert?.message).toMatch(/formField.error.min \(name=amount,value=10\)/);
    });

    it('uses the max value set on the rule to generate the alert message', () => {
        const error = { type: 'max' };
        const fieldState = { error };
        const fieldValues = { field: {}, fieldState };
        const fieldName = 'tokens';
        useControllerSpy.mockReturnValue(fieldValues as unknown as ReactHookForm.UseControllerReturn);
        const rules = { max: 123 };
        const { result } = renderHook(() => useFormField<ReactHookForm.FieldValues, string>(fieldName, { rules }));
        expect(result.current.alert?.message).toMatch(/formField.error.max \(name=tokens,value=123\)/);
    });
});
