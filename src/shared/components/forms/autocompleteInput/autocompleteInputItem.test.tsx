import { IconType } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { AutocompleteInputItem, type IAutocompleteInputItemProps } from './autocompleteInputItem';

describe('<AutocompleteInputItem /> component', () => {
    const createTestComponent = (props?: Partial<IAutocompleteInputItemProps>) => {
        const completeProps: IAutocompleteInputItemProps = {
            item: { id: 'id', name: 'name', icon: IconType.APP_ASSETS },
            isActive: false,
            ...props,
        };

        return <AutocompleteInputItem {...completeProps} />;
    };

    it('renders an item option with the specified name and icon', () => {
        const item = { id: '0', name: 'option-name', icon: IconType.SETTINGS };
        render(createTestComponent({ item }));

        const optionElement = screen.getByRole('option');
        expect(optionElement).toBeInTheDocument();
        expect(optionElement).toHaveTextContent(item.name);
        expect(screen.getByTestId(item.icon)).toBeInTheDocument();
    });

    it('renders the info on the right side when provided', () => {
        const info = 'Test info';
        const item = { id: '1', name: 'option-with-desc', icon: IconType.SETTINGS, info };
        render(createTestComponent({ item }));
        expect(screen.getByText(info)).toBeInTheDocument();
    });

    it('sets the item option as selected when the isActive property is set to true', () => {
        const isActive = true;
        render(createTestComponent({ isActive }));
        expect(screen.getByRole('option').getAttribute('aria-selected')).toBeTruthy();
    });
});
