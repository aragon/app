import { FormWrapper } from '@/shared/testUtils';
import { IconType } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { type IResourcesInputProps, ResourcesInput } from './resourceInput';

describe('<ResourceInput /> component', () => {
    const createTestComponent = (props?: Partial<IResourcesInputProps>) => {
        const completeProps: IResourcesInputProps = { name: 'resources', ...props };
        return (
            <FormWrapper>
                <ResourcesInput {...completeProps} />
            </FormWrapper>
        );
    };

    it('renders the component with no initial resources', () => {
        render(createTestComponent());

        expect(screen.getByText(/createProposalForm.metadata.resources.title/)).toBeInTheDocument();
        expect(screen.getByText('Optional')).toBeInTheDocument();
        expect(screen.getByText(/createProposalForm.metadata.resources.helpText/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /createProposalForm.metadata.resources.add/ })).toBeInTheDocument();

        // Check that no input fields are initially present
        expect(
            screen.queryByPlaceholderText(/createProposalForm.metadata.resources.labelInput.placeholder/),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByPlaceholderText(/createProposalForm.metadata.resources.linkInput.placeholder/),
        ).not.toBeInTheDocument();
    });

    it('adds a new resource when "Add" button is clicked', async () => {
        render(createTestComponent());

        const addButton = screen.getByRole('button', { name: /createProposalForm.metadata.resources.add/ });
        await userEvent.click(addButton);

        const labelInputs = screen.getAllByPlaceholderText(
            /createProposalForm.metadata.resources.labelInput.placeholder/,
        );
        const linkInputs = screen.getAllByPlaceholderText(
            /createProposalForm.metadata.resources.linkInput.placeholder/,
        );

        expect(labelInputs).toHaveLength(1);
        expect(linkInputs).toHaveLength(1);
    });

    it('adds multiple resources and removes one', async () => {
        render(createTestComponent());

        const addButton = screen.getByRole('button', { name: /createProposalForm.metadata.resources.add/ });

        // Add two resources
        await userEvent.click(addButton);
        await userEvent.click(addButton);

        let labelInputs = screen.getAllByPlaceholderText(
            /createProposalForm.metadata.resources.labelInput.placeholder/,
        );
        let linkInputs = screen.getAllByPlaceholderText(/createProposalForm.metadata.resources.linkInput.placeholder/);
        expect(labelInputs).toHaveLength(2);
        expect(linkInputs).toHaveLength(2);

        // Click the dropdown for second resource
        const removeButtons = screen.getAllByTestId(IconType.DOTS_VERTICAL);
        await userEvent.click(removeButtons[1]);

        // Remove the resource
        const removeOption = screen.getByText(/createProposalForm.metadata.resources.removeResource/);
        await userEvent.click(removeOption);

        // Check we only have one remaining resource
        labelInputs = screen.getAllByPlaceholderText(/createProposalForm.metadata.resources.labelInput.placeholder/);
        linkInputs = screen.getAllByPlaceholderText(/createProposalForm.metadata.resources.linkInput.placeholder/);
        expect(labelInputs).toHaveLength(1);
        expect(linkInputs).toHaveLength(1);
    });
});
