import { render, screen } from '@testing-library/react';
import { AutocompleteInputGroup, type IAutocompleteInputGroupProps } from './autocompleteInputGroup';

describe('<AutocompleteInputGroup /> component', () => {
    const createTestComponent = (props?: Partial<IAutocompleteInputGroupProps>) => {
        const completeProps: IAutocompleteInputGroupProps = {
            ...props,
        };

        return <AutocompleteInputGroup {...completeProps} />;
    };

    it('renders the children property', () => {
        const children = 'test-child';
        render(createTestComponent({ children }));
        expect(screen.getByText(children)).toBeInTheDocument();
    });

    it('renders the group info when defined', () => {
        const group = { id: '0', name: 'test-group', info: 'some-info' };
        render(createTestComponent({ group }));
        expect(screen.getByText(group.name)).toBeInTheDocument();
        expect(screen.getByText(group.info)).toBeInTheDocument();
    });
});
