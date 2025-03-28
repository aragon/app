import * as useDialogContext from '@/shared/components/dialogProvider';
import { generateDialogContext, generateWizardContext } from '@/shared/testUtils';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as Wizard from '../../wizard';
import { WizardDialogContainerFooter, type IWizardDialogContainerFooterProps } from './wizardDialogContainerFooter';

describe('<WizardDialogContainerFooter /> component', () => {
    const useWizardContextSpy = jest.spyOn(Wizard, 'useWizardContext');
    const useWizardFooterSpy = jest.spyOn(Wizard, 'useWizardFooter');
    const useDialogContextSpy = jest.spyOn(useDialogContext, 'useDialogContext');

    beforeEach(() => {
        useWizardContextSpy.mockReturnValue(generateWizardContext());
        useWizardFooterSpy.mockReturnValue({
            submitLabel: '',
            displayValidationError: false,
        } as Wizard.IUseWizardFooterReturn);
        useDialogContextSpy.mockReturnValue(generateDialogContext());
    });

    afterEach(() => {
        useWizardContextSpy.mockReset();
        useWizardFooterSpy.mockReset();
        useDialogContextSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IWizardDialogContainerFooterProps>) => {
        const completeProps: IWizardDialogContainerFooterProps = {
            formId: 'id',
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
        const close = jest.fn();
        useWizardContextSpy.mockReturnValue(generateWizardContext({ hasPrevious }));
        useDialogContextSpy.mockReturnValue(generateDialogContext({ close }));
        render(createTestComponent());
        const closeButton = screen.getByRole('button', { name: /wizardDialog.container.close/ });
        expect(closeButton).toBeInTheDocument();
        await userEvent.click(closeButton);
        expect(close).toHaveBeenCalled();
    });

    it('renders a back button when step is not the first step', async () => {
        const onPreviousClick = jest.fn();
        const hasPrevious = true;
        useWizardContextSpy.mockReturnValue(generateWizardContext({ hasPrevious }));
        useWizardFooterSpy.mockReturnValue({ onPreviousClick } as unknown as Wizard.IUseWizardFooterReturn);
        render(createTestComponent());
        const backButton = screen.getByRole('button', { name: /wizardDialog.container.back/ });
        expect(backButton).toBeInTheDocument();
        await userEvent.click(backButton);
        expect(onPreviousClick).toHaveBeenCalled();
    });

    it('does not render the back button when current step is the first step', () => {
        const hasPrevious = false;
        useWizardContextSpy.mockReturnValue(generateWizardContext({ hasPrevious }));
        render(createTestComponent());
        expect(screen.queryByRole('button', { name: /wizardDialog.container.back/ })).not.toBeInTheDocument();
    });
});
