import { render } from '@testing-library/react';
import { AutocompleteInputMenu, type IAutocompleteInputMenuProps } from './autocompleteInputMenu';

describe('<AutocompleteInputMenu /> component', () => {
    const createTestComponent = (props?: Partial<IAutocompleteInputMenuProps>) => {
        const completeProps: IAutocompleteInputMenuProps = {
            isOpen: false,
            context: {} as IAutocompleteInputMenuProps['context'],
            selectItemLabel: 'add',
            ...props,
        };

        return <AutocompleteInputMenu {...completeProps} />;
    };

    it('renders empty container when isOpen property is set to false', () => {
        const isOpen = false;
        const { container } = render(createTestComponent({ isOpen }));
        expect(container).toBeEmptyDOMElement();
    });
});
