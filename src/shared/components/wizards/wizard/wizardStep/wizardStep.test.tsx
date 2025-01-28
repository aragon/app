import { generateStepperResult } from '@/shared/testUtils';
import { render, screen } from '@testing-library/react';
import * as ReactHookForm from 'react-hook-form';
import { type IWizardContext, WizardProvider } from '../wizardProvider';
import { type IWizardStepProps, WizardStep } from './wizardStep';

// Needed to spy usage of useFormContext hook
jest.mock('react-hook-form', () => ({
    __esModule: true,
    ...jest.requireActual<typeof ReactHookForm>('react-hook-form'),
}));

describe('<WizardStep /> component', () => {
    const useFormContextSpy = jest.spyOn(ReactHookForm, 'useFormContext');

    beforeEach(() => {
        useFormContextSpy.mockReturnValue({
            formState: { isSubmitted: false, errors: {} },
        } as unknown as ReactHookForm.UseFormReturn);
    });

    afterEach(() => {
        useFormContextSpy.mockReset();
    });

    const createTestComponent = (values?: { props?: Partial<IWizardStepProps>; context?: Partial<IWizardContext> }) => {
        const completeProps: IWizardStepProps = {
            title: 'step-title',
            description: 'step-description',
            id: '001',
            order: 0,
            meta: { name: 'step-name' },
            ...values?.props,
        };

        const completeContext: IWizardContext = {
            submitLabel: 'submit',
            ...generateStepperResult(),
            ...values?.context,
        };

        return (
            <WizardProvider value={completeContext}>
                <WizardStep {...completeProps} />
            </WizardProvider>
        );
    };

    it('returns empty container if step is not active', () => {
        const context = { activeStep: '001' };
        const props = { id: '005' };
        const { container } = render(createTestComponent({ props, context }));
        expect(container).toBeEmptyDOMElement();
    });

    it('registers the step on mount', () => {
        const step = { id: 'a', order: 2, meta: { name: 'A step' } };
        const registerStep = jest.fn();
        const context = { registerStep };
        render(createTestComponent({ context, props: step }));
        expect(registerStep).toHaveBeenCalledWith(step);
    });

    it('unregisters the step when the hidden property is set to true', () => {
        const id = '123';
        const hidden = true;
        const unregisterStep = jest.fn();
        const context = { unregisterStep };
        const props = { hidden, id };
        render(createTestComponent({ context, props }));
        expect(unregisterStep).toHaveBeenCalledWith(id);
    });

    it('renders the step title, description and children property when active', () => {
        const title = 'Step 001';
        const description = 'A description for the wizard step';
        const children = 'step-content';
        const id = '001';
        const context = { activeStep: id };
        const props = { title, description, id, children };
        render(createTestComponent({ context, props }));
        expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
        expect(screen.getByText(description)).toBeInTheDocument();
        expect(screen.getByText(children)).toBeInTheDocument();
    });

    it('renders a submit button with default label when step is not the last step', () => {
        const hasNext = true;
        const id = '000';
        const context = { activeStep: id, hasNext };
        const props = { id };
        render(createTestComponent({ context, props }));
        const button = screen.getByRole<HTMLButtonElement>('button', { name: /wizard.step.next/ });
        expect(button).toBeInTheDocument();
        expect(button.type).toEqual('submit');
    });

    it('renders the submit button with the submit-label set on the wizard context when step is the last step', () => {
        const hasNext = false;
        const id = '000';
        const submitLabel = 'Submit proposal';
        const context = { activeStep: id, hasNext, submitLabel };
        const props = { id };
        render(createTestComponent({ context, props }));
        const button = screen.getByRole<HTMLButtonElement>('button', { name: submitLabel });
        expect(button).toBeInTheDocument();
        expect(button.type).toEqual('submit');
    });

    it('renders a back button when step is not the first step', () => {
        const hasPrevious = true;
        const id = '123';
        const context = { activeStep: id, hasPrevious };
        const props = { id };
        render(createTestComponent({ context, props }));
        const button = screen.getByRole('button', { name: /wizard.step.back/ });
        expect(button).toBeInTheDocument();
        expect(button.classList).not.toContain('invisible');
    });

    it('hides the back button when step is the first step', () => {
        const hasPrevious = false;
        const id = '123';
        const context = { activeStep: id, hasPrevious };
        const props = { id };
        render(createTestComponent({ context, props }));
        const button = screen.getByRole('button', { name: /wizard.step.back/ });
        expect(button).toBeInTheDocument();
        expect(button.classList).toContain('invisible');
    });

    it('displays a required error feedback when form is submitted with required validation errors', () => {
        const errors = { fieldName: { type: 'required' }, anotherField: { type: 'required' } };
        const formState = { isSubmitted: true, errors };
        useFormContextSpy.mockReturnValue({ formState } as unknown as ReactHookForm.UseFormReturn);
        render(createTestComponent({ props: { id: '0' }, context: { activeStep: '0' } }));
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('app.shared.wizard.step.error.required.title')).toBeInTheDocument();
    });

    it('displays an invalid error feedback when form is submitted with invalid validation errors', () => {
        const errors = { fieldName: { type: 'minLength' }, anotherField: { type: 'customErrorType' } };
        const formState = { isSubmitted: true, errors };
        useFormContextSpy.mockReturnValue({ formState } as unknown as ReactHookForm.UseFormReturn);
        render(createTestComponent({ props: { id: '0' }, context: { activeStep: '0' } }));
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('app.shared.wizard.step.error.invalid.title')).toBeInTheDocument();
    });

    it('displays an invalid-required error feedback when form is submitted with invalid and required validation errors', () => {
        const errors = { fieldName: { type: 'minLength' }, anotherField: { type: 'required' } };
        const formState = { isSubmitted: true, errors };
        useFormContextSpy.mockReturnValue({ formState } as unknown as ReactHookForm.UseFormReturn);
        render(createTestComponent({ props: { id: '0' }, context: { activeStep: '0' } }));
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('app.shared.wizard.step.error.invalid-required.title')).toBeInTheDocument();
    });

    it('does not display an error when form is submitted without validation errors', () => {
        const errors = {};
        const formState = { isSubmitted: true, errors };
        useFormContextSpy.mockReturnValue({ formState } as unknown as ReactHookForm.UseFormReturn);
        render(createTestComponent({ props: { id: '0' }, context: { activeStep: '0' } }));
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
});
