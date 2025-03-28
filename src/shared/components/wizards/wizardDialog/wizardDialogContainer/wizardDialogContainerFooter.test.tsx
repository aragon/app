import { generateWizardContext } from '@/shared/testUtils';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as Wizard from '../../wizard';
import { WizardDialogContainerFooter, type IWizardDialogContainerFooterProps } from './wizardDialogContainerFooter';

describe('<WizardDialogContainerFooter /> component', () => {
    const useWizardContextSpy = jest.spyOn(Wizard, 'useWizardContext');
    const useWizardFooterSpy = jest.spyOn(Wizard, 'useWizardFooter');

    beforeEach(() => {
        useWizardContextSpy.mockReturnValue(generateWizardContext());
        useWizardFooterSpy.mockReturnValue({
            submitLabel: '',
            displayValidationError: false,
        } as Wizard.IUseWizardFooterReturn);
    });

    afterEach(() => {
        useWizardContextSpy.mockReset();
        useWizardFooterSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IWizardDialogContainerFooterProps>) => {
        const completeProps: IWizardDialogContainerFooterProps = {
            formId: 'id',
            onClose: jest.fn(),
            ...props,
        };

        return <WizardDialogContainerFooter {...completeProps} />;
    };

    it('renders the wizard submit button', () => {
        const submitLabel = 'Save';
        useWizardFooterSpy.mockReturnValue({
            submitLabel,
            displayValidationError: false,
        } as Wizard.IUseWizardFooterReturn);
        render(createTestComponent());
        expect(screen.getByRole('button', { name: submitLabel })).toBeInTheDocument();
    });

    it('renders a close button when step is the first step', async () => {
        const hasPrevious = false;
        const onClose = jest.fn();
        useWizardContextSpy.mockReturnValue(generateWizardContext({ hasPrevious }));
        render(createTestComponent({ onClose }));
        const closeButton = screen.getByRole('button', { name: /wizardDialog.container.close/ });
        expect(closeButton).toBeInTheDocument();
        await userEvent.click(closeButton);
        expect(onClose).toHaveBeenCalled();
    });

    it('renders a back button when step is not the first step', async () => {
        const previousStep = jest.fn();
        const hasPrevious = true;
        useWizardContextSpy.mockReturnValue(generateWizardContext({ previousStep, hasPrevious }));
        render(createTestComponent());
        const backButton = screen.getByRole('button', { name: /wizardDialog.container.back/ });
        expect(backButton).toBeInTheDocument();
        await userEvent.click(backButton);
        expect(previousStep).toHaveBeenCalled();
    });

    it('does not render the back button when current step is the first step', () => {
        const hasPrevious = false;
        useWizardContextSpy.mockReturnValue(generateWizardContext({ hasPrevious }));
        render(createTestComponent());
        expect(screen.queryByRole('button', { name: /wizardDialog.container.back/ })).not.toBeInTheDocument();
    });
});
