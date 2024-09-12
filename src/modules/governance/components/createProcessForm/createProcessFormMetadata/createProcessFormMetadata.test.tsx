import { FormWrapper } from '@/shared/testUtils';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CreateProcessFormMetadata, type ICreateProcessFormMetadataProps } from './createProcessFormMetadata';

describe('<CreateProcessFormMetadata /> component', () => {
    const createTestComponent = (props?: Partial<ICreateProcessFormMetadataProps>) => {
        const completeProps: ICreateProcessFormMetadataProps = { ...props };

        return (
            <FormWrapper>
                <CreateProcessFormMetadata {...completeProps} />
            </FormWrapper>
        );
    };

    it('renders all form fields', () => {
        render(createTestComponent());

        expect(screen.getByRole('textbox', { name: /createProcessForm.metadata.title.title/ })).toBeInTheDocument();
        expect(screen.getByText(/createProcessForm.metadata.title.helpText/)).toBeInTheDocument();

        expect(screen.getByRole('textbox', { name: /createProcessForm.metadata.summary.title/ })).toBeInTheDocument();
        expect(screen.getByText(/createProcessForm.metadata.summary.helpText/)).toBeInTheDocument();

        expect(screen.getByText(/createProcessForm.metadata.body.title/)).toBeInTheDocument();
        expect(screen.getByText(/createProcessForm.metadata.body.helpText/)).toBeInTheDocument();

        expect(screen.getByText(/shared.resourcesInput.title/)).toBeInTheDocument();

        expect(screen.getByRole('switch', { name: /createProcessForm.metadata.actions.label/ })).toBeInTheDocument();
        expect(screen.getByText(/createProcessForm.metadata.actions.helpText/)).toBeInTheDocument();
    });

    it('allows input in title field', async () => {
        render(createTestComponent());

        const titleInput = screen.getByRole('textbox', { name: /createProcessForm.metadata.title.title/ });
        await userEvent.type(titleInput, 'Test Process');

        expect(titleInput).toHaveValue('Test Process');
    });

    it('renders ResourcesInput component', () => {
        render(createTestComponent());

        expect(screen.getByText(/shared.resourcesInput.title/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /shared.resourcesInput.add/ })).toBeInTheDocument();
    });

    it('allows toggling of addActions switch', async () => {
        render(createTestComponent());

        const addActionsSwitch = screen.getByRole('switch', {
            name: /createProcessForm.metadata.actions.label/,
        });

        // Switch should be on by default
        expect(addActionsSwitch).toBeChecked();

        // Toggle switch off
        await userEvent.click(addActionsSwitch);
        await waitFor(() => {
            expect(addActionsSwitch).not.toBeChecked();
        });

        // Toggle switch back on
        await userEvent.click(addActionsSwitch);
        await waitFor(() => {
            expect(addActionsSwitch).toBeChecked();
        });
    });
});
