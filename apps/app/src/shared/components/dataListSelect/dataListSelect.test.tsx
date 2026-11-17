import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { DataListSelect, type IDataListSelectProps } from './dataListSelect';

interface ITestItem {
    name: string;
    address: string;
}

describe('<DataListSelect /> component', () => {
    const known = '0x1c9EC7A08E3E4bdB4Ff4F1a2CA0B1D0C14A28c9D';
    const unknown = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';

    const items: ITestItem[] = [
        { name: 'Alpha', address: known },
        { name: 'Beta', address: '0x2dB75d8404144CD5918815A44B8ac3f4DB2a7FAf' },
    ];

    const labels = {
        entity: 'Items',
        searchPlaceholder: 'Search items...',
        addAddress: 'Add address',
        addByAddress: 'Add by address',
        emptyHeading: (search: string) => `No results for "${search}"`,
        emptyDescription: 'Try another search',
    };

    const createTestComponent = (
        props?: Partial<IDataListSelectProps<ITestItem>>,
    ) => {
        const completeProps: IDataListSelectProps<ITestItem> = {
            items,
            getItemKey: (item) => item.address,
            filterItem: (item, search) =>
                item.name.toLowerCase().includes(search.toLowerCase()) ||
                item.address.toLowerCase() === search.toLowerCase(),
            renderItem: (item) => <p>{item.name}</p>,
            renderAddressView: ({ initialAddress, onBack }) => (
                <div>
                    <p>address view {initialAddress ?? 'empty'}</p>
                    <button onClick={onBack} type="button">
                        back
                    </button>
                </div>
            ),
            labels,
            hasSearch: true,
            ...props,
        };

        return (
            <GukModulesProvider>
                <DataListSelect {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders every item', () => {
        render(createTestComponent());

        expect(screen.getByText('Alpha')).toBeInTheDocument();
        expect(screen.getByText('Beta')).toBeInTheDocument();
    });

    it('filters the items with the search', async () => {
        render(createTestComponent());

        await userEvent.type(screen.getByRole('searchbox'), 'alp');

        expect(screen.getByText('Alpha')).toBeInTheDocument();
        expect(screen.queryByText('Beta')).not.toBeInTheDocument();
    });

    it('keeps the list when a searched address matches an item', async () => {
        render(createTestComponent());

        await userEvent.type(screen.getByRole('searchbox'), known);

        expect(screen.getByText('Alpha')).toBeInTheDocument();
        expect(screen.queryByText(/address view/)).not.toBeInTheDocument();
    });

    it('switches to the address view with a searched address no item matches', async () => {
        render(createTestComponent());

        await userEvent.type(screen.getByRole('searchbox'), unknown);

        expect(screen.getByText(`address view ${unknown}`)).toBeInTheDocument();
    });

    it('uses the given check to decide what counts as an address search', async () => {
        render(
            createTestComponent({
                isAddressSearch: (value) => value.endsWith('.eth'),
            }),
        );

        await userEvent.type(screen.getByRole('searchbox'), 'vitalik.eth');

        expect(
            screen.getByText('address view vitalik.eth'),
        ).toBeInTheDocument();
    });

    it('opens an empty address view from the add address action and comes back', async () => {
        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', { name: 'Add address' }),
        );
        expect(screen.getByText('address view empty')).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'back' }));
        expect(screen.getByText('Alpha')).toBeInTheDocument();
    });

    it('offers to add by address when the search matches nothing', async () => {
        render(createTestComponent());

        await userEvent.type(screen.getByRole('searchbox'), 'zzz');
        expect(screen.getByText('No results for "zzz"')).toBeInTheDocument();

        await userEvent.click(
            screen.getByRole('button', { name: 'Add by address' }),
        );
        expect(screen.getByText('address view empty')).toBeInTheDocument();
    });

    it('hides the search when hasSearch is false', () => {
        render(createTestComponent({ hasSearch: false }));

        expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    });

    it('renders each item once per list, not again on every keystroke', async () => {
        const renderItem = jest.fn((item: ITestItem) => <p>{item.name}</p>);
        render(createTestComponent({ renderItem }));
        renderItem.mockClear();

        await userEvent.type(screen.getByRole('searchbox'), 'alp');

        expect(renderItem).not.toHaveBeenCalled();
        expect(screen.getByText('Alpha')).toBeInTheDocument();
        expect(screen.queryByText('Beta')).not.toBeInTheDocument();
    });

    it('renders the items again when given a new render function', () => {
        const { rerender } = render(createTestComponent());

        rerender(
            createTestComponent({
                renderItem: (item) => <p>{item.name} updated</p>,
            }),
        );

        expect(screen.getByText('Alpha updated')).toBeInTheDocument();
    });
});
