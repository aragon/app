import { Button, type IButtonProps, IconType } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generateWizardContext } from '@/shared/testUtils';
import * as Wizard from '../../wizard';
import { type IWizardPageStepProps, WizardPageStep } from './wizardPageStep';

jest.mock('@aragon/gov-ui-kit', () => {
    const actual =
        jest.requireActual<typeof import('@aragon/gov-ui-kit')>(
            '@aragon/gov-ui-kit',
        );

    return {
        ...actual,
        // Observe the step's icon choice while keeping the real button rendered.
        Button: jest.fn((props: IButtonProps) => <actual.Button {...props} />),
    };
});

jest.mock('../../wizard', () => ({
    useWizardContext: jest.fn(),
    useWizardFooter: jest.fn(),
    Wizard: {
        Step: (props: Wizard.IWizardStepProps) => <div>{props.children}</div>,
    },
}));

describe('<WizardPageStep /> component', () => {
    const useWizardContextSpy = jest.spyOn(Wizard, 'useWizardContext');
    const useWizardFooterSpy = jest.spyOn(Wizard, 'useWizardFooter');

    beforeEach(() => {
        jest.mocked(Button).mockClear();
        useWizardContextSpy.mockReturnValue(generateWizardContext());
        useWizardFooterSpy.mockReturnValue({} as Wizard.IUseWizardFooterReturn);
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
        expect(
            screen.getByRole('heading', { level: 1, name: title }),
        ).toBeInTheDocument();
        expect(screen.getByText(description)).toBeInTheDocument();
    });

    it('renders a validation error when the wizard-footer utility returns error feedback', () => {
        useWizardFooterSpy.mockReturnValue({
            validationStatus: 'required',
            displayValidationError: true,
        } as Wizard.IUseWizardFooterReturn);
        render(createTestComponent());
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(
            screen.getByText(/wizardPage.step.error.required.title/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/wizardPage.step.error.required.description/),
        ).toBeInTheDocument();
    });

    it('renders a back button to go to the previous step when current step is not the first', async () => {
        const hasPrevious = true;
        const onPreviousClick = jest.fn();
        useWizardContextSpy.mockReturnValue(
            generateWizardContext({ hasPrevious }),
        );
        useWizardFooterSpy.mockReturnValue({
            onPreviousClick,
        } as unknown as Wizard.IUseWizardFooterReturn);
        render(createTestComponent());
        const button = screen.getByRole('button', {
            name: /wizardPage.step.back/,
        });
        expect(button).toBeInTheDocument();
        expect(button.classList).not.toContain('invisible');
        await userEvent.click(button);
        expect(onPreviousClick).toHaveBeenCalled();
    });

    it('hides the back button when step is the first step', () => {
        const hasPrevious = false;
        useWizardContextSpy.mockReturnValue(
            generateWizardContext({ hasPrevious }),
        );
        render(createTestComponent());
        expect(
            screen.getByRole('button', { name: /wizardPage.step.back/ })
                .classList,
        ).toContain('invisible');
    });

    it.each([
        { hideNextIcon: undefined, iconRight: IconType.CHEVRON_RIGHT },
        { hideNextIcon: false, iconRight: IconType.CHEVRON_RIGHT },
        { hideNextIcon: true, iconRight: undefined },
    ])(
        'renders the submit button with hideNextIcon=$hideNextIcon',
        ({ hideNextIcon, iconRight }) => {
            const submitLabel = 'Save';
            useWizardFooterSpy.mockReturnValue({
                submitLabel,
            } as Wizard.IUseWizardFooterReturn);
            render(createTestComponent({ hideNextIcon }));
            const button = screen.getByRole<HTMLButtonElement>('button', {
                name: submitLabel,
            });
            expect(button).toBeInTheDocument();
            expect(button.type).toEqual('submit');
            expect(Button).toHaveBeenCalledWith(
                expect.objectContaining({
                    children: submitLabel,
                    iconRight,
                    type: 'submit',
                }),
                undefined,
            );
        },
    );

    it('renders a submit help text when provided', () => {
        const submitHelpText = 'Some useful help text';
        useWizardFooterSpy.mockReturnValue({
            submitHelpText,
        } as Wizard.IUseWizardFooterReturn);
        render(createTestComponent());
        expect(screen.getByText(submitHelpText)).toBeInTheDocument();
    });
});
