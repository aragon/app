import { IconType } from '@aragon/gov-ui-kit';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { FormWrapper } from '@/shared/testUtils';
import {
    type IResourcesInputItemProps,
    ResourcesInputItem,
} from './resourcesInputItem';

describe('<ResourcesInputItem /> component', () => {
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

    const SubmitTestComponent: React.FC<
        Partial<IResourcesInputItemProps> & { onSubmit: jest.Mock }
    > = (props) => {
        const { onSubmit, ...componentProps } = props;
        const formMethods = useForm({
            defaultValues: { resources: [{ name: '', url: '' }] },
            mode: 'onBlur',
        });

        return (
            <FormProvider {...formMethods}>
                <form onSubmit={formMethods.handleSubmit(onSubmit)}>
                    <ResourcesInputItem
                        index={0}
                        name="resources"
                        remove={jest.fn()}
                        {...componentProps}
                    />
                    <button type="submit">Submit</button>
                </form>
            </FormProvider>
        );
    };

    it('renders the URL field before the link text field', () => {
        render(createTestComponent());

        const urlInput = screen.getByLabelText(
            /resourcesInput.item.linkInput.title/,
        );
        const labelInput = screen.getByLabelText(
            /resourcesInput.item.labelInput.title/,
        );

        expect(
            urlInput.compareDocumentPosition(labelInput) &
                Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
    });

    it('uses the URL placeholder without prefilling a value', () => {
        render(createTestComponent());

        const urlInput = screen.getByPlaceholderText(
            /resourcesInput.item.linkInput.placeholder/,
        );

        expect(urlInput).toHaveValue('');
    });

    it('calls remove function when remove button is clicked', async () => {
        const remove = jest.fn();
        render(createTestComponent({ remove }));
        const dropdownTrigger = screen.getByTestId(IconType.DOTS_VERTICAL);
        await userEvent.click(dropdownTrigger);

        const removeButton = screen.getByText(
            /resourcesInput.item.removeResource/,
        );
        await userEvent.click(removeButton);

        expect(remove).toHaveBeenCalledWith(0);
    });

    it('accepts valid URL format in link input', async () => {
        render(createTestComponent());
        const urlInput = screen.getByPlaceholderText(
            /resourcesInput.item.linkInput.placeholder/,
        );

        await userEvent.type(urlInput, 'https://example.com');
        await userEvent.tab();

        expect(
            screen.queryByText(/formField.error.pattern/),
        ).not.toBeInTheDocument();
    });

    it('validates URL format in link input', async () => {
        render(<SubmitTestComponent onSubmit={jest.fn()} />);

        const urlInput = screen.getByPlaceholderText(
            /resourcesInput.item.linkInput.placeholder/,
        );

        await userEvent.type(urlInput, 'broken link');
        await userEvent.tab();

        expect(
            await screen.findByText(/formField.error.pattern/),
        ).toBeInTheDocument();
    });

    it('submits with an empty link text when the URL is valid', async () => {
        const onSubmit = jest.fn();
        render(<SubmitTestComponent onSubmit={onSubmit} />);

        const urlInput = screen.getByPlaceholderText(
            /resourcesInput.item.linkInput.placeholder/,
        );

        await userEvent.type(urlInput, 'https://example.com');
        await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

        await waitFor(() => expect(onSubmit).toHaveBeenCalled());
        expect(onSubmit.mock.calls[0][0]).toEqual({
            resources: [{ name: '', url: 'https://example.com' }],
        });
    });

    it('mirrors the URL value as the link text placeholder', async () => {
        render(createTestComponent());

        const urlInput = screen.getByPlaceholderText(
            /resourcesInput.item.linkInput.placeholder/,
        );
        const labelInput = screen.getByLabelText(
            /resourcesInput.item.labelInput.title/,
        );

        await userEvent.type(urlInput, 'https://example.com');

        await waitFor(() =>
            expect(labelInput).toHaveAttribute(
                'placeholder',
                'https://example.com',
            ),
        );
    });

    it('sets a max length requirement for the resource label', () => {
        render(createTestComponent());

        expect(screen.getByText('0/40')).toBeInTheDocument();
    });
});
