import { render, screen } from '@testing-library/react';
import type { IWizardStepProps } from '../../wizard/wizardStep';
import { type IWizardDialogStepProps, WizardDialogStep } from './wizardDialogStep';

jest.mock('../../wizard', () => ({
    Wizard: { Step: (props: IWizardStepProps) => <div data-testid="wizard-step">{props.children}</div> },
}));

describe('<WizardDialogStep /> component', () => {
    const createTestComponent = (props?: Partial<IWizardDialogStepProps>) => {
        const completeProps: IWizardDialogStepProps = {
            id: 'id',
            order: 0,
            meta: { name: 'step' },
            ...props,
        };

        return <WizardDialogStep {...completeProps} />;
    };

    it('renders a wizard step with the children content', () => {
        const children = 'step-content';
        render(createTestComponent({ children }));
        expect(screen.getByTestId('wizard-step')).toBeInTheDocument();
        expect(screen.getByText(children)).toBeInTheDocument();
    });
});
