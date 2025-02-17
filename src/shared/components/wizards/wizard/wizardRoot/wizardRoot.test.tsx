import { generateFormContext, generateFormContextState } from '@/shared/testUtils';
import { render, screen } from '@testing-library/react';
import * as ReactHookForm from 'react-hook-form';
import { type IWizardRootProps, WizardRoot } from './wizardRoot';

jest.mock('next/dynamic', () => ({ __esModule: true, default: () => () => <div data-testid="dev-tool" /> }));

describe('<WizardRoot /> component', () => {
    const useFormSpy = jest.spyOn(ReactHookForm, 'useForm');

    beforeEach(() => {
        useFormSpy.mockReturnValue(generateFormContext());
    });

    afterEach(() => {
        useFormSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IWizardRootProps>) => {
        const completeProps: IWizardRootProps = {
            submitLabel: 'submit',
            ...props,
        };

        return <WizardRoot {...completeProps} />;
    };

    it('initializes the form with the default value and correct mode', () => {
        const defaultValues = { key: 'value' };
        render(createTestComponent({ defaultValues }));
        expect(useFormSpy).toHaveBeenCalledWith({ mode: 'onTouched', defaultValues });
    });

    it('renders the dev-tools for the form manager', () => {
        render(createTestComponent());
        expect(screen.getByTestId('dev-tool')).toBeInTheDocument();
    });

    it('resets the form submit state on submit success', () => {
        const reset = jest.fn();
        const formState = generateFormContextState({ isSubmitSuccessful: true });
        useFormSpy.mockReturnValue(generateFormContext({ formState, reset }));
        render(createTestComponent());
        expect(reset).toHaveBeenCalledWith(undefined, { keepDirty: true, keepValues: true });
    });
});
