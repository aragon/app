import { render, screen } from '@testing-library/react';
import type { IWizardFormProps, IWizardRootProps } from '../../wizard';
import { type IWizardPageContainerProps, WizardPageContainer } from './wizardPageContainer';

jest.mock('../../wizard', () => ({
    Wizard: {
        Root: (props: IWizardRootProps) => <div data-testid="wizard-root">{props.children}</div>,
        Form: (props: IWizardFormProps) => <div data-testid="wizard-form">{props.children}</div>,
    },
}));

jest.mock('./wizardPageContainerProgress', () => ({
    WizardPageContainerProgress: () => <div data-testid="container-progress" />,
}));

describe('<WizardPageContainer /> component', () => {
    const createTestComponent = (props?: Partial<IWizardPageContainerProps>) => {
        const completeProps: IWizardPageContainerProps = {
            submitLabel: 'submit',
            ...props,
        };

        return <WizardPageContainer {...completeProps} />;
    };

    it('renders the wizard root, form and current progress', () => {
        const children = 'wizard-steps';
        render(createTestComponent({ children }));
        expect(screen.getByTestId('wizard-root')).toBeInTheDocument();
        expect(screen.getByTestId('wizard-form')).toBeInTheDocument();
        expect(screen.getByTestId('container-progress')).toBeInTheDocument();
        expect(screen.getByText(children)).toBeInTheDocument();
    });
});
