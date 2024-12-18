import { IconType } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AutocompleteInput } from './autocompleteInput';
import type { IAutocompleteInputProps } from './autocompleteInput.api';

describe('<AutocompleteInput /> component', () => {
    const createTestComponent = (props?: Partial<IAutocompleteInputProps>) => {
        const completeProps: IAutocompleteInputProps = {
            items: [],
            selectItemLabel: 'select',
            ...props,
        };

        return <AutocompleteInput {...completeProps} />;
    };

    it('renders a text input', () => {
        const placeholder = 'test';
        render(createTestComponent({ placeholder }));
        expect(screen.getByRole('combobox')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
    });

    it('renders the autocomplete items when input is focused', async () => {
        const items = [
            { id: '0', name: 'item-0', icon: IconType.APP_ASSETS },
            { id: '1', name: 'item-1', icon: IconType.APP_ASSETS },
        ];
        render(createTestComponent({ items }));
        expect(screen.queryByText(items[0].name)).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole('combobox'));
        expect(screen.getByRole('listbox')).toBeInTheDocument();
        expect(screen.getByText(items[0].name)).toBeInTheDocument();
        expect(screen.getByText(items[1].name)).toBeInTheDocument();
    });

    it('closes the items menu on item selected', async () => {
        const items = [{ id: '0', name: 'item-0', icon: IconType.APP_ASSETS }];
        render(createTestComponent({ items }));
        await userEvent.click(screen.getByRole('combobox'));
        await userEvent.click(screen.getByRole('option'));
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('correctly render grouped items', async () => {
        const items = [
            { id: '0', name: 'item-0-group-0', icon: IconType.APP_ASSETS, groupId: 'group-0' },
            { id: '2', name: 'item-2-group-1', icon: IconType.APP_ASSETS, groupId: 'group-1' },
            { id: '5', name: 'item-5', icon: IconType.APP_ASSETS },
            { id: '1', name: 'item-1-group-0', icon: IconType.APP_ASSETS, groupId: 'group-0' },
            { id: '3', name: 'item-3-group-1', icon: IconType.APP_ASSETS, groupId: 'group-1' },
            { id: '4', name: 'item-4', icon: IconType.APP_ASSETS },
        ];
        const groups = [
            { id: 'group-0', name: 'group-0', info: '' },
            { id: 'group-1', name: 'group-1', info: '' },
        ];
        render(createTestComponent({ items, groups }));
        await userEvent.click(screen.getByRole('combobox'));
        const renderedItems = screen.getAllByRole('option');

        // Ungrouped items first
        expect(renderedItems[0].id).toEqual('5');
        expect(renderedItems[1].id).toEqual('4');

        // Group 0 items
        expect(screen.getByText(groups[0].name)).toBeInTheDocument();
        expect(renderedItems[2].id).toEqual('0');
        expect(renderedItems[3].id).toEqual('1');

        // Group 1 items
        expect(screen.getByText(groups[1].name)).toBeInTheDocument();
        expect(renderedItems[4].id).toEqual('2');
        expect(renderedItems[5].id).toEqual('3');
    });

    it('filters the items based on the item name, groupName, groupInfo and group index data on search input value change', async () => {
        const items = [
            { id: '0', name: 'item-0', icon: IconType.APP_ASSETS, groupId: 'g-0' },
            { id: '1', name: 'item-1', icon: IconType.APP_ASSETS, groupId: 'g-0' },
            { id: '2', name: 'item-2', icon: IconType.APP_ASSETS, groupId: 'g-1' },
            { id: '3', name: 'item-3', icon: IconType.APP_ASSETS, groupId: 'g-2' },
        ];
        const groups = [
            { id: 'g-0', name: 'group-0', info: 'group-info-0', indexData: ['index-0-0', 'index-0-1'] },
            { id: 'g-1', name: 'group-1', info: 'group-info-1', indexData: ['index-1-0'] },
            { id: 'g-2', name: 'group-2', info: 'group-info-2' },
        ];

        render(createTestComponent({ items, groups }));
        const inputElement = screen.getByRole('combobox');

        await userEvent.click(inputElement);

        await userEvent.type(inputElement, 'item-0');
        expect(screen.getAllByRole('option').length).toEqual(1);

        await userEvent.type(inputElement, 'item-9');
        expect(screen.queryAllByRole('option').length).toEqual(0);

        await userEvent.clear(inputElement);
        await userEvent.type(inputElement, 'item');
        expect(screen.getAllByRole('option').length).toEqual(4);

        await userEvent.clear(inputElement);
        await userEvent.type(inputElement, 'group-0');
        expect(screen.getAllByRole('option').length).toEqual(2);

        await userEvent.clear(inputElement);
        await userEvent.type(inputElement, 'index-1-0');
        expect(screen.getAllByRole('option').length).toEqual(1);

        await userEvent.clear(inputElement);
        await userEvent.type(inputElement, 'group-info-2');
        expect(screen.getAllByRole('option').length).toEqual(1);

        await userEvent.clear(inputElement);
        expect(screen.getAllByRole('option').length).toEqual(4);
    });

    it('triggers the onOpenChange callback on open menu change', async () => {
        const onOpenChange = jest.fn();
        render(createTestComponent({ onOpenChange }));
        await userEvent.click(screen.getByRole('combobox'));
        expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it('closes the menu and triggers the onChange callback with the selected item-id on option click', async () => {
        const onOpenChange = jest.fn();
        const onChange = jest.fn();
        const items = [
            { id: '0', name: 'item-0', icon: IconType.APP_ASSETS },
            { id: '1', name: 'item-1', icon: IconType.APP_ASSETS },
        ];
        render(createTestComponent({ items, onOpenChange, onChange }));
        await userEvent.click(screen.getByRole('combobox'));
        await userEvent.click(screen.getByRole('option', { name: items[1].name }));
        expect(onOpenChange).toHaveBeenCalledWith(false);
        expect(onChange).toHaveBeenCalledWith(items[1].id);
    });

    it('triggers the onFocus callback on input focus', async () => {
        const onFocus = jest.fn();
        render(createTestComponent({ onFocus }));
        await userEvent.click(screen.getByRole('combobox'));
        expect(onFocus).toHaveBeenCalled();
    });

    it('triggers the onKeyDown callback on input keydown', async () => {
        const onKeyDown = jest.fn();
        render(createTestComponent({ onKeyDown }));
        await userEvent.click(screen.getByRole('combobox'));
        await userEvent.keyboard('{ArrowDown}');
        expect(onKeyDown).toHaveBeenCalled();
    });

    it('supports navigation and selection through keydown events', async () => {
        const onChange = jest.fn();
        const items = [
            { id: '0', name: 'item-0', icon: IconType.APP_ASSETS },
            { id: '1', name: 'item-1', icon: IconType.APP_ASSETS },
            { id: '2', name: 'item-2', icon: IconType.APP_ASSETS },
        ];
        render(createTestComponent({ items, onChange }));
        await userEvent.click(screen.getByRole('combobox'));

        await userEvent.keyboard('{ArrowDown}');
        expect(screen.getByRole('option', { name: items[0].name }).getAttribute('aria-selected')).toEqual('true');

        await userEvent.keyboard('{ArrowDown}');
        expect(screen.getByRole('option', { name: items[0].name }).getAttribute('aria-selected')).toEqual('false');
        expect(screen.getByRole('option', { name: items[1].name }).getAttribute('aria-selected')).toEqual('true');

        await userEvent.keyboard('{Enter}');
        expect(onChange).toHaveBeenCalledWith(items[1].id);
    });

    it('correctly select items on enter press when filtered', async () => {
        const onChange = jest.fn();
        const items = [
            { id: '0', name: 'aaa', icon: IconType.APP_ASSETS },
            { id: '1', name: 'bbb', icon: IconType.APP_ASSETS },
            { id: '2', name: 'ccc', icon: IconType.APP_ASSETS },
        ];
        render(createTestComponent({ items, onChange }));

        const inputElement = screen.getByRole('combobox');
        await userEvent.click(inputElement);
        await userEvent.type(inputElement, 'bbb');

        await userEvent.keyboard('{Enter}');
        expect(onChange).toHaveBeenCalledWith(items[1].id);
    });
});
