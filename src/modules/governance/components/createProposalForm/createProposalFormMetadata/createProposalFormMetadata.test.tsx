import { FormWrapper } from '@/shared/testUtils';
import { render, screen, waitFor } from '@testing-library/react';
import { CreateProposalFormMetadata, type ICreateProposalFormMetadataProps } from './createProposalFormMetadata';
import { userEvent } from '@testing-library/user-event';

describe('<CreateProposalFormMetadata /> component', () => {
    const createTestComponent = (props?: Partial<ICreateProposalFormMetadataProps>) => {
        const completeProps: ICreateProposalFormMetadataProps = { ...props };

        return (
            <FormWrapper>
                <CreateProposalFormMetadata {...completeProps} />
            </FormWrapper>
        );
    };

    it('renders the title field', () => {
        render(createTestComponent());
        expect(
            screen.getByRole('textbox', { name: /createProposal.createProposalForm.title.title/ }),
        ).toBeInTheDocument();
    });

    it('renders all form fields', () => {
        render(createTestComponent());

        expect(
            screen.getByRole('textbox', { name: /createProposal.createProposalForm.title.title/ }),
        ).toBeInTheDocument();
        expect(screen.getByText(/createProposal.createProposalForm.title.helpText/)).toBeInTheDocument();

        expect(
            screen.getByRole('textbox', { name: /createProposal.createProposalForm.summary.title/ }),
        ).toBeInTheDocument();
        expect(screen.getByText(/createProposal.createProposalForm.summary.helpText/)).toBeInTheDocument();

        expect(screen.getByText(/createProposal.createProposalForm.body.title/)).toBeInTheDocument();
        expect(screen.getByText(/createProposal.createProposalForm.body.helpText/)).toBeInTheDocument();

        expect(screen.getByText(/createProposal.createProposalForm.resources.title/)).toBeInTheDocument();

        expect(
            screen.getByRole('switch', { name: /createProposal.createProposalForm.actions.label/ }),
        ).toBeInTheDocument();
        expect(screen.getByText(/createProposal.createProposalForm.actions.helpText/)).toBeInTheDocument();
    });

    it('allows input in title field', async () => {
        render(createTestComponent());

        const titleInput = screen.getByRole('textbox', { name: /createProposal.createProposalForm.title.title/ });
        await userEvent.type(titleInput, 'Test Proposal');

        expect(titleInput).toHaveValue('Test Proposal');
    });

    it('renders ResourcesInput component', () => {
        render(createTestComponent());

        expect(screen.getByText('app.createProposal.createProposalForm.resources.title')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add/ })).toBeInTheDocument();
    });

    it('allows toggling of addActions switch', async () => {
        render(createTestComponent());

        const addActionsSwitch = screen.getByRole('switch', {
            name: /createProposal.createProposalForm.actions.label/,
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
