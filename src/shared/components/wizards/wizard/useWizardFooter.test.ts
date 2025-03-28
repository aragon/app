import { generateFormContext, generateFormContextState, generateWizardContext } from '@/shared/testUtils';
import { renderHook } from '@testing-library/react';
import * as ReactHookForm from 'react-hook-form';
import { useWizardFooter } from './useWizardFooter';
import * as WizardProvider from './wizardProvider';

describe('useWizardFooter hook', () => {
    const useWizardContextSpy = jest.spyOn(WizardProvider, 'useWizardContext');
    const useFormContextSpy = jest.spyOn(ReactHookForm, 'useFormContext');

    beforeEach(() => {
        useWizardContextSpy.mockReturnValue(generateWizardContext());
        useFormContextSpy.mockReturnValue(generateFormContext());
    });

    afterEach(() => {
        useWizardContextSpy.mockReset();
        useFormContextSpy.mockReset();
    });

    it('returns valid validation status when form has no error', () => {
        const formState = generateFormContextState({ errors: {} });
        useFormContextSpy.mockReturnValue(generateFormContext({ formState }));
        const { result } = renderHook(() => useWizardFooter());
        expect(result.current.validationStatus).toEqual('valid');
    });

    it('returns required validation status when form has required errors', () => {
        const errors = { fieldOne: { type: 'required' }, fieldTwo: { type: 'required' } };
        const formState = generateFormContextState({ errors });
        useFormContextSpy.mockReturnValue(generateFormContext({ formState }));
        const { result } = renderHook(() => useWizardFooter());
        expect(result.current.validationStatus).toEqual('required');
    });

    it('returns invalid validation status when form has invalid errors', () => {
        const errors = { fieldOne: { type: 'invalid' } };
        const formState = generateFormContextState({ errors });
        useFormContextSpy.mockReturnValue(generateFormContext({ formState }));
        const { result } = renderHook(() => useWizardFooter());
        expect(result.current.validationStatus).toEqual('invalid');
    });

    it('returns required-invalid validation status when form has both required and invalid errors', () => {
        const errors = { fieldOne: { type: 'invalid' }, fieldTwo: { type: 'required' } };
        const formState = generateFormContextState({ errors });
        useFormContextSpy.mockReturnValue(generateFormContext({ formState }));
        const { result } = renderHook(() => useWizardFooter());
        expect(result.current.validationStatus).toEqual('invalid-required');
    });

    it('returns displayValidationError set to true when form has errors and is submitted', () => {
        const errors = { fieldOne: { type: 'invalid' } };
        const isSubmitted = true;
        const formState = generateFormContextState({ errors, isSubmitted });
        useFormContextSpy.mockReturnValue(generateFormContext({ formState }));
        const { result } = renderHook(() => useWizardFooter());
        expect(result.current.displayValidationError).toBeTruthy();
    });

    it('returns displayValidationError set to false when form has errors but it is not submitted', () => {
        const errors = { fieldOne: { type: 'required' } };
        const isSubmitted = false;
        const formState = generateFormContextState({ errors, isSubmitted });
        useFormContextSpy.mockReturnValue(generateFormContext({ formState }));
        const { result } = renderHook(() => useWizardFooter());
        expect(result.current.displayValidationError).toBeFalsy();
    });

    it('returns a critical submit variant when displaying validation errors', () => {
        const errors = { fieldOne: { type: 'invalid' } };
        const isSubmitted = true;
        const formState = generateFormContextState({ errors, isSubmitted });
        useFormContextSpy.mockReturnValue(generateFormContext({ formState }));
        const { result } = renderHook(() => useWizardFooter());
        expect(result.current.submitVariant).toEqual('critical');
    });

    it('returns a primary submit variant when form has no errors and no next step', () => {
        const formState = generateFormContextState({ errors: {} });
        useWizardContextSpy.mockReturnValue(generateWizardContext({ hasNext: false }));
        useFormContextSpy.mockReturnValue(generateFormContext({ formState }));
        const { result } = renderHook(() => useWizardFooter());
        expect(result.current.submitVariant).toEqual('primary');
    });

    it('returns a secondary submit variant when form has no errors but has next step', () => {
        const formState = generateFormContextState({ errors: {} });
        useWizardContextSpy.mockReturnValue(generateWizardContext({ hasNext: true }));
        useFormContextSpy.mockReturnValue(generateFormContext({ formState }));
        const { result } = renderHook(() => useWizardFooter());
        expect(result.current.submitVariant).toEqual('secondary');
    });

    it('returns the submit label set on the wizard context when current step is last step', () => {
        const submitLabel = 'save';
        useWizardContextSpy.mockReturnValue(generateWizardContext({ submitLabel, hasNext: false }));
        const { result } = renderHook(() => useWizardFooter());
        expect(result.current.submitLabel).toEqual(submitLabel);
    });

    it('returns a default submit label when current step is not last step', () => {
        useWizardContextSpy.mockReturnValue(generateWizardContext({ hasNext: true }));
        const { result } = renderHook(() => useWizardFooter());
        expect(result.current.submitLabel).toMatch(/wizard.footer.next/);
    });

    it('returns a onPrevious click function to reset the submit state of the form and navigate to the previous step', () => {
        const reset = jest.fn();
        const previousStep = jest.fn();
        useFormContextSpy.mockReturnValue(generateFormContext({ reset }));
        useWizardContextSpy.mockReturnValue(generateWizardContext({ previousStep }));
        const { result } = renderHook(() => useWizardFooter());

        result.current.onPreviousClick();
        expect(reset).toHaveBeenCalledWith(undefined, { keepDefaultValues: true, keepValues: true });
        expect(previousStep).toHaveBeenCalled();
    });
});
