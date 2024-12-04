import type * as FloatingUi from '@floating-ui/react';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { AutocompleteInputMenu, type IAutocompleteInputMenuProps } from './autocompleteInputMenu';

jest.mock('@floating-ui/react', () => ({
    ...jest.requireActual<typeof FloatingUi>('@floating-ui/react'),
    FloatingFocusManager: (props: { children: ReactNode }) => props.children,
}));

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

    it('renders the children property, the select-item label and the menu footer when open', () => {
        const isOpen = true;
        const children = 'test-children';
        const selectItemLabel = 'select-item';
        render(createTestComponent({ isOpen, children, selectItemLabel }));
        expect(screen.getByText(children)).toBeInTheDocument();
        expect(screen.getByText(/autocompleteInput.menu.select/)).toBeInTheDocument();
        expect(screen.getByText(selectItemLabel)).toBeInTheDocument();
    });
});
