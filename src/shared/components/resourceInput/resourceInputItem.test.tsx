import * as useFormField from '@/shared/hooks/useFormField';
import { FormWrapper } from '@/shared/testUtils';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { type IResourceInputItemProps, ResourceInputItem } from './resourceInputItem';

describe('<ResourceItem /> component', () => {
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
    });

    const createTestComponent = (props?: Partial<IResourceInputItemProps>) => {
        const completeProps: IResourceInputItemProps = {
            index: 0,
            remove: jest.fn(),
            ...props,
        };

        return (
            <FormWrapper>
                <ResourceInputItem {...completeProps} />
            </FormWrapper>
        );
    };

    it('renders the label and link input fields', () => {
        render(createTestComponent());
        expect(screen.getByPlaceholderText(/shared.resourcesInput.labelInput.placeholder/)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/shared.resourcesInput.linkInput.placeholder/)).toBeInTheDocument();
    });

    it('calls remove function when remove button is clicked', async () => {
        const remove = jest.fn();
        render(createTestComponent({ remove }));
        const dropdownTrigger = screen.getByTestId('DOTS_VERTICAL');
        await userEvent.click(dropdownTrigger);

        const removeButton = screen.getByText(/shared.resourcesInput.removeResource/);
        await userEvent.click(removeButton);

        expect(remove).toHaveBeenCalledWith(0);
    });

    it('accepts valid URL format in link input', async () => {
        render(createTestComponent());
        const linkInput = screen.getByPlaceholderText(/shared.resourcesInput.linkInput.placeholder/);

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

        const linkInput = screen.getByPlaceholderText(/shared.resourcesInput.linkInput.placeholder/);

        await userEvent.type(linkInput, 'broken link');
        await userEvent.tab();

        await waitFor(() => {
            expect(screen.getByText('Invalid URL format')).toBeInTheDocument();
        });
    });
});
