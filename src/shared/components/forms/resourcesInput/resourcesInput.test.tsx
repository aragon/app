import { FormWrapper } from '@/shared/testUtils';
import { IconType } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ResourcesInput } from './resourcesInput';
import type { IResourcesInputProps } from './resourcesInput.api';

describe('<ResourcesInput /> component', () => {
    const createTestComponent = (props?: Partial<IResourcesInputProps>) => {
        const completeProps: IResourcesInputProps = { name: 'resources', helpText: 'helpful text', ...props };
        return (
            <FormWrapper>
                <ResourcesInput {...completeProps} />
            </FormWrapper>
        );
    };

    it('renders the component with no initial resources', () => {
        render(createTestComponent({ helpText: 'Some helpful text' }));

        expect(screen.getByText(/shared.resourcesInput.title/)).toBeInTheDocument();
        expect(screen.getByText('Optional')).toBeInTheDocument();
        expect(screen.getByText('Some helpful text')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /shared.resourcesInput.add/ })).toBeInTheDocument();

        // Check that no input fields are initially present
        expect(screen.queryByPlaceholderText(/item.labelInput.placeholder/)).not.toBeInTheDocument();
        expect(screen.queryByPlaceholderText(/item.linkInput.placeholder/)).not.toBeInTheDocument();
    });

    it('adds a new resource when "Add" button is clicked', async () => {
        render(createTestComponent());

        const addButton = screen.getByRole('button', { name: /shared.resourcesInput.add/ });
        await userEvent.click(addButton);

        const labelInputs = screen.getAllByPlaceholderText(/item.labelInput.placeholder/);
        const linkInputs = screen.getAllByPlaceholderText(/item.linkInput.placeholder/);

        expect(labelInputs).toHaveLength(1);
        expect(linkInputs).toHaveLength(1);
    });

    it('adds multiple resources and removes one', async () => {
        render(createTestComponent());

        const addButton = screen.getByRole('button', { name: /shared.resourcesInput.add/ });

        // Add two resources
        await userEvent.click(addButton);
        await userEvent.click(addButton);

        let labelInputs = screen.getAllByPlaceholderText(/item.labelInput.placeholder/);
        let linkInputs = screen.getAllByPlaceholderText(/item.linkInput.placeholder/);
        expect(labelInputs).toHaveLength(2);
        expect(linkInputs).toHaveLength(2);

        // Click the dropdown for second resource
        const removeButtons = screen.getAllByTestId(IconType.DOTS_VERTICAL);
        await userEvent.click(removeButtons[1]);

        // Remove the resource
        const removeOption = screen.getByText(/item.removeResource/);
        await userEvent.click(removeOption);

        // Check we only have one remaining resource
        labelInputs = screen.getAllByPlaceholderText(/item.labelInput.placeholder/);
        linkInputs = screen.getAllByPlaceholderText(/item.linkInput.placeholder/);
        expect(labelInputs).toHaveLength(1);
        expect(linkInputs).toHaveLength(1);
    });
});
