import { generateWizardContext } from '@/shared/testUtils';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as Wizard from '../../wizard';
import { type IWizardPageStepProps, WizardPageStep } from './wizardPageStep';

jest.mock('../../wizard', () => ({
    useWizardContext: jest.fn(),
    useWizardFooter: jest.fn(),
    Wizard: { Step: (props: Wizard.IWizardStepProps) => <div>{props.children}</div> },
}));

describe('<WizardPageStep /> component', () => {
    const useWizardContextSpy = jest.spyOn(Wizard, 'useWizardContext');
    const useWizardFooterSpy = jest.spyOn(Wizard, 'useWizardFooter');

    beforeEach(() => {
        useWizardContextSpy.mockReturnValue(generateWizardContext());
        useWizardFooterSpy.mockReturnValue({
            submitLabel: '',
            submitVariant: 'primary',
            validationStatus: 'valid',
            displayValidationError: false,
        });
    });

    afterEach(() => {
        useWizardContextSpy.mockReset();
        useWizardFooterSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IWizardPageStepProps>) => {
        const completeProps: IWizardPageStepProps = {
            title: 'step-title',
            description: 'step-description',
            id: '001',
            order: 0,
            meta: { name: 'step-name' },
            ...props,
        };

        return <WizardPageStep {...completeProps} />;
    };

    it('renders the step title and description', () => {
        const title = 'Step title';
        const description = 'Step description';
        render(createTestComponent({ title, description }));
        expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
        expect(screen.getByText(description)).toBeInTheDocument();
    });

    it('renders a validation error when the wizard-footer utility returns error feedback', () => {
        useWizardFooterSpy.mockReturnValue({
            submitLabel: '',
            submitVariant: 'critical',
            validationStatus: 'required',
            displayValidationError: true,
        });
        render(createTestComponent());
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/wizardPage.step.error.required.title/)).toBeInTheDocument();
        expect(screen.getByText(/wizardPage.step.error.required.description/)).toBeInTheDocument();
    });

    it('renders a back button to go to the previous step when current step is not the first', async () => {
        const hasPrevious = true;
        const previousStep = jest.fn();
        useWizardContextSpy.mockReturnValue(generateWizardContext({ hasPrevious, previousStep }));
        render(createTestComponent());
        const button = screen.getByRole('button', { name: /wizardPage.step.back/ });
        expect(button).toBeInTheDocument();
        expect(button.classList).not.toContain('invisible');
        await userEvent.click(button);
        expect(previousStep).toHaveBeenCalled();
    });

    it('hides the back button when step is the first step', () => {
        const hasPrevious = false;
        useWizardContextSpy.mockReturnValue(generateWizardContext({ hasPrevious }));
        render(createTestComponent());
        expect(screen.getByRole('button', { name: /wizardPage.step.back/ }).classList).toContain('invisible');
    });

    it('renders a submit button to submit the values of the current step', () => {
        const submitLabel = 'Save';
        useWizardFooterSpy.mockReturnValue({
            submitLabel,
            submitVariant: 'critical',
            validationStatus: '',
            displayValidationError: false,
        });
        render(createTestComponent());
        const button = screen.getByRole<HTMLButtonElement>('button', { name: submitLabel });
        expect(button).toBeInTheDocument();
        expect(button.type).toEqual('submit');
    });
});
