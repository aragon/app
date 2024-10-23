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
        expect(screen.getByRole('option', { name: item.name })).toBeInTheDocument();
        expect(screen.getByTestId(item.icon)).toBeInTheDocument();
    });

    it('sets the item option as selected when the isActive property is set to true', () => {
        const isActive = true;
        render(createTestComponent({ isActive }));
        expect(screen.getByRole('option').getAttribute('aria-selected')).toBeTruthy();
    });
});
