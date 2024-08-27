import { FormWrapper } from '@/shared/testUtils';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { type IResourcesInputProps, ResourcesInput } from './resourcesInput';

describe('<ResourceInput /> component', () => {
    const createTestComponent = (props?: Partial<IResourcesInputProps>) => {
        const completeProps: IResourcesInputProps = { ...props };
        return (
            <FormWrapper>
                <ResourcesInput {...completeProps} />
            </FormWrapper>
        );
    };

    it('renders the component with initial empty resource', () => {
        render(createTestComponent());

        expect(screen.getByText('app.createProposal.createProposalForm.resources.title')).toBeInTheDocument();
        expect(screen.getByText('Optional')).toBeInTheDocument();
        expect(screen.getByText('app.createProposal.createProposalForm.resources.helpText')).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText('app.createProposal.createProposalForm.resources.labelInput.placeholder'),
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText('app.createProposal.createProposalForm.resources.linkInput.placeholder'),
        ).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add/i })).toBeInTheDocument();
    });

    it('adds a new resource when "Add" button is clicked', async () => {
        render(createTestComponent());

        const addButton = screen.getByRole('button', { name: /Add/i });
        await userEvent.click(addButton);

        const labelInputs = screen.getAllByPlaceholderText(
            'app.createProposal.createProposalForm.resources.labelInput.placeholder',
        );
        const linkInputs = screen.getAllByPlaceholderText(
            'app.createProposal.createProposalForm.resources.linkInput.placeholder',
        );

        expect(labelInputs).toHaveLength(2);
        expect(linkInputs).toHaveLength(2);
    });

    it('removes a resource when remove button is clicked', async () => {
        render(createTestComponent());

        // Add a second resource
        const addButton = screen.getByRole('button', { name: /Add/i });
        await userEvent.click(addButton);

        // Chewck second resource was added
        let labelInputs = screen.getAllByPlaceholderText(
            'app.createProposal.createProposalForm.resources.labelInput.placeholder',
        );
        let linkInputs = screen.getAllByPlaceholderText(
            'app.createProposal.createProposalForm.resources.linkInput.placeholder',
        );
        expect(labelInputs).toHaveLength(2);
        expect(linkInputs).toHaveLength(2);

        // Click the dropdown for second resource
        const removeButtons = screen.getAllByTestId('DOTS_VERTICAL');
        await userEvent.click(removeButtons[1]);

        // remove the resource
        const removeOption = screen.getByText('app.createProposal.createProposalForm.resources.removeResource');
        await userEvent.click(removeOption);

        // Check we only have one remaining resource
        labelInputs = screen.getAllByPlaceholderText(
            'app.createProposal.createProposalForm.resources.labelInput.placeholder',
        );
        linkInputs = screen.getAllByPlaceholderText(
            'app.createProposal.createProposalForm.resources.linkInput.placeholder',
        );
        expect(labelInputs).toHaveLength(1);
        expect(linkInputs).toHaveLength(1);
    });
});
