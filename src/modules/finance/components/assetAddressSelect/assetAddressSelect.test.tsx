import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    AssetAddressSelect,
    type IAssetAddressSelectProps,
} from '@/modules/finance/components/assetAddressSelect';
import * as useAssetListData from '@/modules/finance/hooks/useAssetListData/useAssetListData';
import { generateToken } from '@/modules/finance/testUtils';
import * as useTokenModule from '@/shared/hooks/useToken/useToken';

describe('<AssetAddressSelect /> component', () => {
    const useAssetListDataSpy = jest.spyOn(
        useAssetListData,
        'useAssetListData',
    );
    const useTokenSpy = jest.spyOn(useTokenModule, 'useToken');

    beforeEach(() => {
        useAssetListDataSpy.mockReturnValue({
            assetList: [],
            onLoadMore: jest.fn(),
            state: 'idle',
            pageSize: 10,
            itemsCount: 0,
            emptyState: { heading: '', description: '' },
            errorState: { heading: '', description: '' },
        });
        useTokenSpy.mockReturnValue({
            data: null,
            isLoading: false,
            isError: false,
        });
    });

    afterEach(() => {
        useAssetListDataSpy.mockReset();
        useTokenSpy.mockReset();
    });

    const mockAssetList = (
        assets: Array<{
            token: ReturnType<typeof generateToken>;
            amount: string;
        }>,
    ) => {
        useAssetListDataSpy.mockReturnValue({
            onLoadMore: jest.fn(),
            assetList: assets.map((a) => ({ ...a, amount: a.amount })),
            state: 'idle' as const,
            pageSize: 10,
            itemsCount: assets.length,
            emptyState: { heading: '', description: '' },
            errorState: { heading: '', description: '' },
        });
    };

    const createTestComponent = (props?: Partial<IAssetAddressSelectProps>) => {
        const completeProps: IAssetAddressSelectProps = {
            initialParams: {
                queryParams: { daoId: 'ethereum-mainnet-0x123' },
            },
            ...props,
        };

        return (
            <GukModulesProvider>
                <AssetAddressSelect {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the asset list with multiple items when data is available', () => {
        mockAssetList([
            {
                token: generateToken({ address: '0x123', symbol: 'ABC' }),
                amount: '1.23',
            },
            {
                token: generateToken({ address: '0x456', symbol: 'DEF' }),
                amount: '987654321.987654',
            },
        ]);

        render(createTestComponent());

        expect(screen.getByText('1.23 ABC')).toBeInTheDocument();
        expect(screen.getByText('987.65M DEF')).toBeInTheDocument();
    });

    it('does not render the data-list pagination when hidePagination is set to true', () => {
        mockAssetList([
            {
                token: generateToken(),
                amount: '1',
            },
        ]);
        render(createTestComponent({ hidePagination: true }));
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('renders the children property', () => {
        const children = 'test-children';
        render(createTestComponent({ children }));
        expect(screen.getByText(children)).toBeInTheDocument();
    });

    it('filters list by substring match on token name (case-insensitive)', async () => {
        mockAssetList([
            {
                token: generateToken({
                    address: '0xaaa',
                    name: 'Ethereum',
                    symbol: 'ETH',
                }),
                amount: '1',
            },
            {
                token: generateToken({
                    address: '0xbbb',
                    name: 'Lido Staked ETH',
                    symbol: 'stETH',
                }),
                amount: '2',
            },
            {
                token: generateToken({
                    address: '0xccc',
                    name: 'USD Coin',
                    symbol: 'USDC',
                }),
                amount: '3',
            },
        ]);

        render(createTestComponent({ hasSearch: true }));

        await userEvent.type(screen.getByRole('searchbox'), 'eth');

        expect(screen.getByText('Ethereum')).toBeInTheDocument();
        expect(screen.getByText('Lido Staked ETH')).toBeInTheDocument();
        expect(screen.queryByText('USD Coin')).not.toBeInTheDocument();
    });

    it('filters list by substring match on token symbol (case-insensitive)', async () => {
        mockAssetList([
            {
                token: generateToken({
                    address: '0xaaa',
                    name: 'Ethereum',
                    symbol: 'ETH',
                }),
                amount: '1',
            },
            {
                token: generateToken({
                    address: '0xbbb',
                    name: 'USD Coin',
                    symbol: 'USDC',
                }),
                amount: '2',
            },
        ]);

        render(createTestComponent({ hasSearch: true }));

        await userEvent.type(screen.getByRole('searchbox'), 'usd');

        expect(screen.getByText('USD Coin')).toBeInTheDocument();
        expect(screen.queryByText('Ethereum')).not.toBeInTheDocument();
    });

    it('keeps the matching list item when the searched address equals an item address (no sub-screen jump)', async () => {
        const knownAddress = '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0';
        mockAssetList([
            {
                token: generateToken({
                    address: knownAddress,
                    name: 'wstETH',
                    symbol: 'wstETH',
                }),
                amount: '5',
            },
        ]);

        render(createTestComponent({ hasSearch: true }));

        await userEvent.type(screen.getByRole('searchbox'), knownAddress);

        // The list still renders the matched asset; sub-screen back button is not present.
        expect(screen.getAllByText(/wstETH/).length).toBeGreaterThan(0);
        expect(
            screen.queryByText(
                'app.finance.assetAddressSelect.backButton.label',
            ),
        ).not.toBeInTheDocument();
    });

    it('auto-jumps to the sub-screen when the searched address has no list match', async () => {
        mockAssetList([
            {
                token: generateToken({
                    address: '0xaaa',
                    name: 'Ethereum',
                    symbol: 'ETH',
                }),
                amount: '1',
            },
        ]);

        useTokenSpy.mockReturnValue({
            data: {
                name: 'Wrapped stETH',
                symbol: 'wstETH',
                decimals: 18,
                totalSupply: '0',
            },
            isLoading: false,
            isError: false,
        });

        render(createTestComponent({ hasSearch: true }));

        const unlistedAddress = '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0';
        await userEvent.type(screen.getByRole('searchbox'), unlistedAddress);

        // BackButton (sub-screen marker) is now visible.
        expect(
            screen.getByText('app.finance.assetAddressSelect.backButton.label'),
        ).toBeInTheDocument();

        // useToken was called with the unlisted address.
        const lastTokenCall = useTokenSpy.mock.calls.at(-1);
        expect(lastTokenCall?.[0]?.address?.toLowerCase()).toBe(
            unlistedAddress.toLowerCase(),
        );
    });
});
