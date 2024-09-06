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
        const { result } = renderHook(() => useFormField(name, options));
        expect(useControllerSpy).toHaveBeenCalledWith({ name, ...options });
        expect(result.current).toEqual(expect.objectContaining(fieldValues.field));
    });

    it('returns critical variant when field has error', () => {
        const fieldState = { error: 'some-error' };
        const fieldValues = { field: {}, fieldState };
        useControllerSpy.mockReturnValue(fieldValues as unknown as ReactHookForm.UseControllerReturn);
        const { result } = renderHook(() => useFormField('field'));
        expect(result.current.variant).toEqual('critical');
    });

    it('returns default variant when field has no error', () => {
        const fieldState = { error: undefined };
        const fieldValues = { field: {}, fieldState };
        useControllerSpy.mockReturnValue(fieldValues as unknown as ReactHookForm.UseControllerReturn);
        const { result } = renderHook(() => useFormField('field'));
        expect(result.current.variant).toEqual('default');
    });

    it('returns correct alert message when field has error', () => {
        const error = { type: 'required' };
        const fieldState = { error };
        const fieldValues = { field: {}, fieldState };
        const label = 'Summary';
        useControllerSpy.mockReturnValue(fieldValues as unknown as ReactHookForm.UseControllerReturn);
        const { result } = renderHook(() => useFormField('field-name', { label }));
        expect(result.current.alert?.message).toMatch(/formField.error.required \(name=Summary\)/);
        expect(result.current.alert?.variant).toEqual('critical');
    });

    it('defaults alert message field name to name property when label is not set', () => {
        const error = { type: 'minLength' };
        const fieldState = { error };
        const fieldValues = { field: {}, fieldState };
        const name = 'field-name';
        useControllerSpy.mockReturnValue(fieldValues as unknown as ReactHookForm.UseControllerReturn);
        const { result } = renderHook(() => useFormField(name));
        expect(result.current.alert?.message).toMatch(/formField.error.minLength \(name=field-name\)/);
    });

    it('returns alert set to undefined when field has no errors', () => {
        const fieldState = { error: undefined };
        const fieldValues = { field: {}, fieldState };
        useControllerSpy.mockReturnValue(fieldValues as unknown as ReactHookForm.UseControllerReturn);
        const { result } = renderHook(() => useFormField('field'));
        expect(result.current.alert).toBeUndefined();
    });

    it('passes shouldUnregister option correctly to useController', () => {
        const name = 'testField';
        const options = { shouldUnregister: true, label: 'Test Field' };
        const fieldValues = { field: {}, fieldState: {} };
        useControllerSpy.mockReturnValue(fieldValues as unknown as ReactHookForm.UseControllerReturn);

        renderHook(() => useFormField(name, options));

        expect(useControllerSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                name,
                shouldUnregister: true,
            }),
        );
    });

    it('does not pass shouldUnregister to useController when not provided', () => {
        const name = 'testField';
        const options = { label: 'Test Field' };
        const fieldValues = { field: {}, fieldState: {} };
        useControllerSpy.mockReturnValue(fieldValues as unknown as ReactHookForm.UseControllerReturn);

        renderHook(() => useFormField(name, options));

        expect(useControllerSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                shouldUnregister: undefined,
            }),
        );
    });
});
