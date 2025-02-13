import { render } from '@testing-library/react';
import { type IWizardDialogContainerProps, WizardDialogContainer } from './wizardDialogContainer';

describe('<WizardDialogContainer /> component', () => {
    const createTestComponent = (props?: Partial<IWizardDialogContainerProps>) => {
        const completeProps: IWizardDialogContainerProps = {
            title: 'title',
            description: 'description',
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
});
