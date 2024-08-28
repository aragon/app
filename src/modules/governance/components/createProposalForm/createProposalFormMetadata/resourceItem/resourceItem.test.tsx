import { FormWrapper } from '@/shared/testUtils';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { type IResourceItemProps, ResourceItem } from './resourceItem';
import * as useFormField from '@/shared/hooks/useFormField';

describe('<ResourceItem /> component', () => {
    const mockRemove = jest.fn();
    const useFormFieldSpy = jest.spyOn(useFormField, 'useFormField');

    beforeEach(() => {
        useFormFieldSpy.mockImplementation(() => ({
            name: 'name',
            onChange: jest.fn(),
            onBlur: jest.fn(),
            value: '',
            ref: jest.fn(),
            variant: 'default',
            alert: undefined,
            label: 'Label',
        }));
    });

    afterEach(() => {
        useFormFieldSpy.mockReset();
        mockRemove.mockReset();
    });

    const createTestComponent = (props?: Partial<IResourceItemProps>) => {
        const defaultProps: IResourceItemProps = {
            index: 0,
            remove: mockRemove,
        };

        const completeProps: IResourceItemProps = { ...defaultProps, ...props };

        return (
            <FormWrapper>
                <ResourceItem {...completeProps} />
            </FormWrapper>
        );
    };

    it('renders the label and link input fields', () => {
        render(createTestComponent());
        expect(
            screen.getByPlaceholderText(/createProposal.createProposalForm.resources.labelInput.placeholder/),
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText(/createProposal.createProposalForm.resources.linkInput.placeholder/),
        ).toBeInTheDocument();
    });

    it('calls remove function when remove button is clicked', async () => {
        render(createTestComponent());
        const dropdownTrigger = screen.getByTestId('DOTS_VERTICAL');
        await userEvent.click(dropdownTrigger);

        const removeButton = screen.getByText(/createProposal.createProposalForm.resources.removeResource/);
        await userEvent.click(removeButton);

        expect(mockRemove).toHaveBeenCalledWith(0);
    });

    it('accepts valid URL format in link input', async () => {
        render(createTestComponent());
        const linkInput = screen.getByPlaceholderText(
            /createProposal.createProposalForm.resources.linkInput.placeholder/,
        );

        await userEvent.type(linkInput, 'https://example.com');
        await userEvent.tab();

        expect(screen.queryByText(/shared.formField.error.pattern/)).not.toBeInTheDocument();
    });

    it('validates URL format in link input', async () => {
        useFormFieldSpy.mockImplementationOnce((name, options) => ({
            name,
            onChange: jest.fn(),
            onBlur: jest.fn(),
            value: '',
            ref: jest.fn(),
            variant: 'critical',
            alert: {
                message: 'Invalid URL format',
                variant: 'critical',
            },
            label: options?.label,
        }));

        render(createTestComponent());

        const linkInput = screen.getByPlaceholderText(
            /createProposal.createProposalForm.resources.linkInput.placeholder/,
        );

        await userEvent.type(linkInput, 'broken link');
        await userEvent.tab();

        await waitFor(() => {
            expect(screen.getByText('Invalid URL format')).toBeInTheDocument();
        });
    });
});
