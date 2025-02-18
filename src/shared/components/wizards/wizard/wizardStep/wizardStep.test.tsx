import { generateStepperResult } from '@/shared/testUtils';
import { render, screen } from '@testing-library/react';
import { type IWizardContext, WizardProvider } from '../wizardProvider';
import { type IWizardStepProps, WizardStep } from './wizardStep';

describe('<WizardStep /> component', () => {
    const createTestComponent = (values?: { props?: Partial<IWizardStepProps>; context?: Partial<IWizardContext> }) => {
        const completeProps: IWizardStepProps = {
            title: 'step-title',
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

    it('renders the children content when active', () => {
        const children = 'step-content';
        const id = '001';
        const context = { activeStep: id };
        const props = { id, children };
        render(createTestComponent({ context, props }));
        expect(screen.getByText(children)).toBeInTheDocument();
    });
});
