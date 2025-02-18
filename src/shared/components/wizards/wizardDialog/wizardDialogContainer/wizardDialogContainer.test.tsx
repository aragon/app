import { render, screen } from '@testing-library/react';
import type { IWizardFormProps, IWizardRootProps } from '../../wizard';
import { type IWizardDialogContainerProps, WizardDialogContainer } from './wizardDialogContainer';

jest.mock('../../wizard', () => ({
    Wizard: {
        Root: (props: IWizardRootProps) => <div>{props.children}</div>,
        Form: (props: IWizardFormProps) => <div>{props.children}</div>,
    },
}));

jest.mock('./wizardDialogContainerFooter', () => ({ WizardDialogContainerFooter: () => <div data-testid="footer" /> }));

describe('<WizardDialogContainer /> component', () => {
    const createTestComponent = (props?: Partial<IWizardDialogContainerProps>) => {
        const completeProps: IWizardDialogContainerProps = {
            title: 'title',
            descriptionKey: 'description',
            formId: 'formId',
            onClose: jest.fn(),
            submitLabel: 'submit',
            ...props,
        };

        return <WizardDialogContainer {...completeProps} />;
    };

    it('returns empty container when isOpen property is set to false', () => {
        const isOpen = false;
        const { container } = render(createTestComponent({ isOpen }));
        expect(container).toBeEmptyDOMElement();
    });

    it('renders a dialog with the specified title, description, content and footer when dialog is open', () => {
        const title = 'wizard-title';
        const descriptionKey = 'wizard-description';
        const children = 'wizard-steps';
        render(createTestComponent({ title, descriptionKey, children, isOpen: true }));
        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.getByText(descriptionKey)).toBeInTheDocument();
        expect(screen.getByText(children)).toBeInTheDocument();
        expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
});
