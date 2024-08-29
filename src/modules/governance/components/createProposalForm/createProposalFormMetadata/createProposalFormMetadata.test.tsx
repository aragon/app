import { FormWrapper } from '@/shared/testUtils';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CreateProposalFormMetadata, type ICreateProposalFormMetadataProps } from './createProposalFormMetadata';

describe('<CreateProposalFormMetadata /> component', () => {
    const createTestComponent = (props?: Partial<ICreateProposalFormMetadataProps>) => {
        const completeProps: ICreateProposalFormMetadataProps = { ...props };

        return (
            <FormWrapper>
                <CreateProposalFormMetadata {...completeProps} />
            </FormWrapper>
        );
    };

    it('renders all form fields', () => {
        render(createTestComponent());

        expect(screen.getByRole('textbox', { name: /createProposalForm.metadata.title.title/ })).toBeInTheDocument();
        expect(screen.getByText(/createProposalForm.metadata.title.helpText/)).toBeInTheDocument();

        expect(screen.getByRole('textbox', { name: /createProposalForm.metadata.summary.title/ })).toBeInTheDocument();
        expect(screen.getByText(/createProposalForm.metadata.summary.helpText/)).toBeInTheDocument();

        expect(screen.getByText(/createProposalForm.metadata.body.title/)).toBeInTheDocument();
        expect(screen.getByText(/createProposalForm.metadata.body.helpText/)).toBeInTheDocument();

        expect(screen.getByText(/createProposalForm.metadata.resources.title/)).toBeInTheDocument();

        expect(screen.getByRole('switch', { name: /createProposalForm.metadata.actions.label/ })).toBeInTheDocument();
        expect(screen.getByText(/createProposalForm.metadata.actions.helpText/)).toBeInTheDocument();
    });

    it('allows input in title field', async () => {
        render(createTestComponent());

        const titleInput = screen.getByRole('textbox', { name: /createProposalForm.metadata.title.title/ });
        await userEvent.type(titleInput, 'Test Proposal');

        expect(titleInput).toHaveValue('Test Proposal');
    });

    it('renders ResourcesInput component', () => {
        render(createTestComponent());

        expect(screen.getByText(/createProposalForm.metadata.resources.title/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /createProposalForm.metadata.resources.add/ })).toBeInTheDocument();
    });

    it('allows toggling of addActions switch', async () => {
        render(createTestComponent());

        const addActionsSwitch = screen.getByRole('switch', {
            name: /createProposalForm.metadata.actions.label/,
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
