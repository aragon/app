import * as useStepper from '@/shared/hooks/useStepper';
import { Button } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { type IWizardContainerProps, WizardContainer } from './wizardContainer';

describe('<WizardContainer /> component', () => {
    const useStepperSpy = jest.spyOn(useStepper, 'useStepper');

    afterEach(() => {
        useStepperSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IWizardContainerProps>) => {
        const completeProps: IWizardContainerProps = {
            submitLabel: 'submit',
            ...props,
        };

        return <WizardContainer {...completeProps} />;
    };

    it('renders the current step, the total number of steps and current progress', () => {
        const activeStepIndex = 0;
        const hasNext = true;
        const steps = [
            { id: '0', order: 0, meta: { name: 'step-0' } },
            { id: '1', order: 1, meta: { name: 'step-1' } },
            { id: '2', order: 2, meta: { name: 'step-2' } },
            { id: '3', order: 3, meta: { name: 'step-3' } },
        ];
        useStepperSpy.mockReturnValue({ activeStepIndex, hasNext, steps } as useStepper.IUseStepperReturn<unknown>);
        render(createTestComponent());
        expect(screen.getByText(/wizard.container.step \(number=1\)/)).toBeInTheDocument();
        expect(screen.getByText(/wizard.container.total \(total=4\)/)).toBeInTheDocument();
        expect(screen.getByText(/wizard.container.next/)).toBeInTheDocument();
        expect(screen.getByText(steps[1].meta.name)).toBeInTheDocument();
        const progressbar = screen.getByRole('progressbar');
        expect(progressbar).toBeInTheDocument();
        expect(progressbar.dataset.value).toEqual('25');
    });

    it('renders the final step name when active step is the last step', () => {
        const activeStepIndex = 1;
        const hasNext = false;
        const steps = [
            { id: '0', order: 0, meta: { name: 'step-0' } },
            { id: '1', order: 1, meta: { name: 'step-1' } },
        ];
        const finalStep = 'publish';
        useStepperSpy.mockReturnValue({ activeStepIndex, hasNext, steps } as useStepper.IUseStepperReturn<unknown>);
        render(createTestComponent({ finalStep }));
        expect(screen.getByText(finalStep)).toBeInTheDocument();
    });

    it('does not render the next label when active step is the last step and finalStep property is not defined', () => {
        const activeStepIndex = 0;
        const hasNext = false;
        const steps = [{ id: '0', order: 0, meta: { name: 'step-0' } }];
        useStepperSpy.mockReturnValue({ activeStepIndex, hasNext, steps } as useStepper.IUseStepperReturn<unknown>);
        render(createTestComponent());
        expect(screen.queryByText(/wizard.container.next/)).not.toBeInTheDocument();
    });

    it('proceeds to the next step when active step is not the last step on submit', async () => {
        const children = <Button type="submit">Submit</Button>;
        const hasNext = true;
        const nextStep = jest.fn();
        const activeStepIndex = 0;
        const steps = [
            { id: '0', order: 0, meta: { name: 'step-0' } },
            { id: '1', order: 1, meta: { name: 'step-1' } },
        ];
        useStepperSpy.mockReturnValue({
            hasNext,
            nextStep,
            activeStepIndex,
            steps,
        } as unknown as useStepper.IUseStepperReturn<unknown>);
        render(createTestComponent({ children }));
        await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
        expect(nextStep).toHaveBeenCalled();
    });

    it('triggers the onSubmit callback when active step is the last step on submit', async () => {
        const children = <Button type="submit">Submit</Button>;
        const hasNext = false;
        const onSubmit = jest.fn();
        const activeStepIndex = 0;
        const steps = [{ id: '0', order: 0, meta: { name: 'step-0' } }];
        useStepperSpy.mockReturnValue({
            hasNext,
            steps,
            activeStepIndex,
        } as unknown as useStepper.IUseStepperReturn<unknown>);
        render(createTestComponent({ children, onSubmit }));
        await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
        expect(onSubmit).toHaveBeenCalled();
    });
});
