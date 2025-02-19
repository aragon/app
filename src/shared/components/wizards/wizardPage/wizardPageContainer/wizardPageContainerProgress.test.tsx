import { generateWizardContext } from '@/shared/testUtils';
import { render, screen } from '@testing-library/react';
import * as Wizard from '../../wizard';
import { type IWizardPageContainerProgressProps, WizardPageContainerProgress } from './wizardPageContainerProgress';

describe('<WizardPageContainerProgress /> component', () => {
    const useWizardContextSpy = jest.spyOn(Wizard, 'useWizardContext');

    beforeEach(() => {
        useWizardContextSpy.mockReturnValue(generateWizardContext());
    });

    afterEach(() => {
        useWizardContextSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IWizardPageContainerProgressProps>) => {
        const completeProps: IWizardPageContainerProgressProps = {
            ...props,
        };

        return <WizardPageContainerProgress {...completeProps} />;
    };

    it('renders the current step, the total number of steps and current progress', async () => {
        const activeStepIndex = 0;
        const hasNext = true;
        const steps = [
            { id: '0', order: 0, meta: { name: 'step-0' } },
            { id: '1', order: 1, meta: { name: 'step-1' } },
            { id: '2', order: 2, meta: { name: 'step-2' } },
            { id: '3', order: 3, meta: { name: 'step-3' } },
        ];
        useWizardContextSpy.mockReturnValue(generateWizardContext({ activeStepIndex, hasNext, steps }));
        render(createTestComponent());
        expect(await screen.findByText(/wizardPage.container.step \(number=1\)/)).toBeInTheDocument();
        expect(screen.getByText(/wizardPage.container.total \(total=4\)/)).toBeInTheDocument();
        expect(screen.getByText(/wizardPage.container.next/)).toBeInTheDocument();
        expect(screen.getByText(steps[activeStepIndex + 1].meta.name)).toBeInTheDocument();
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
        useWizardContextSpy.mockReturnValue(generateWizardContext({ activeStepIndex, hasNext, steps }));
        render(createTestComponent({ finalStep }));
        expect(screen.getByText(finalStep)).toBeInTheDocument();
    });

    it('does not render the next label when active step is the last step and finalStep property is not defined', () => {
        const activeStepIndex = 0;
        const hasNext = false;
        const steps = [{ id: '0', order: 0, meta: { name: 'step-0' } }];
        useWizardContextSpy.mockReturnValue(generateWizardContext({ activeStepIndex, hasNext, steps }));
        render(createTestComponent());
        expect(screen.queryByText(/wizard.container.next/)).not.toBeInTheDocument();
    });
});
