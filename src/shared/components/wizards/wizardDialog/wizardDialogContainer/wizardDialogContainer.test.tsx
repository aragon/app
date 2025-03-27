import * as useDialogContext from '@/shared/components/dialogProvider';
import { generateDialogContext } from '@/shared/testUtils';
import { Dialog } from '@aragon/gov-ui-kit';
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
    const useDialogContextSpy = jest.spyOn(useDialogContext, 'useDialogContext');

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue(generateDialogContext());
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IWizardDialogContainerProps>) => {
        const completeProps: IWizardDialogContainerProps = {
            title: 'title',
            formId: 'formId',
            submitLabel: 'submit',
            ...props,
        };

        return (
            <Dialog.Root open={true}>
                <WizardDialogContainer {...completeProps} />;
            </Dialog.Root>
        );
    };

    it('renders a dialog with the specified title, content and footer when dialog is open', () => {
        const title = 'wizard-title';
        const children = 'wizard-steps';
        render(createTestComponent({ title, children }));
        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.getByText(children)).toBeInTheDocument();
        expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
});
