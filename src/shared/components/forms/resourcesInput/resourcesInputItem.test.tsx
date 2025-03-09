import * as useFormField from '@/shared/hooks/useFormField';
import { FormWrapper } from '@/shared/testUtils';
import { IconType } from '@aragon/gov-ui-kit';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { type IResourcesInputItemProps, ResourcesInputItem } from './resourcesInputItem';

describe('<ResourcesInputItem /> component', () => {
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

    const createTestComponent = (props?: Partial<IResourcesInputItemProps>) => {
        const completeProps: IResourcesInputItemProps = {
            name: 'resources',
            index: 0,
            remove: jest.fn(),
            ...props,
        };

        return (
            <FormWrapper>
                <ResourcesInputItem {...completeProps} />
            </FormWrapper>
        );
    };

    it('renders the label and link input fields', () => {
        render(createTestComponent());
        expect(screen.getByPlaceholderText(/resourcesInput.item.linkInput.placeholder/)).toBeInTheDocument();
    });

    it('calls remove function when remove button is clicked', async () => {
        const remove = jest.fn();
        render(createTestComponent({ remove }));
        const dropdownTrigger = screen.getByTestId(IconType.DOTS_VERTICAL);
        await userEvent.click(dropdownTrigger);

        const removeButton = screen.getByText(/resourcesInput.item.removeResource/);
        await userEvent.click(removeButton);

        expect(remove).toHaveBeenCalledWith(0);
    });

    it('accepts valid URL format in link input', async () => {
        render(createTestComponent());
        const linkInput = screen.getByPlaceholderText(/resourcesInput.item.linkInput.placeholder/);

        await userEvent.type(linkInput, 'https://example.com');
        await userEvent.tab();

        expect(screen.queryByText(/formField.error.pattern/)).not.toBeInTheDocument();
    });

    it('validates URL format in link input', async () => {
        useFormFieldSpy.mockImplementationOnce((name, options) => ({
            name,
            onChange: jest.fn(),
            onBlur: jest.fn(),
            value: '',
            ref: jest.fn(),
            variant: 'critical',
            alert: { message: 'Invalid URL format', variant: 'critical' },
            label: options?.label,
        }));

        render(createTestComponent());

        const linkInput = screen.getByPlaceholderText(/resourcesInput.item.linkInput.placeholder/);

        await userEvent.type(linkInput, 'broken link');
        await userEvent.tab();

        expect(await screen.findByText('Invalid URL format')).toBeInTheDocument();
    });

    it('sets a max length requirement for the resource label', () => {
        render(createTestComponent());
        /* eslint-disable-next-line testing-library/no-node-access */
        const container = screen.getByPlaceholderText(/labelInput.placeholder/).parentElement?.parentElement;
        expect(within(container!).getByText('0/40')).toBeInTheDocument();
    });
});
