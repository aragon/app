import { AssetList, type IAssetListProps } from '@/modules/finance/components/assetList';
import * as useAssetListData from '@/modules/finance/hooks/useAssetListData/useAssetListData';
import { generateAsset } from '@/modules/finance/testUtils';
import { OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';

describe('<AssetList /> component', () => {
    const useAssetListDataSpy = jest.spyOn(useAssetListData, 'useAssetListData');

    beforeEach(() => {
        useAssetListDataSpy.mockImplementation(jest.fn());
    });

    afterEach(() => {
        useAssetListDataSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IAssetListProps>) => {
        const completeProps: IAssetListProps = {
            initialParams: { queryParams: { daoAddress: '0x123', network: 'mainnet' } },
            hidePagination: false,
            ...props,
        };

        return (
            <OdsModulesProvider>
                <AssetList {...completeProps} />
            </OdsModulesProvider>
        );
    };

    it('renders the asset list with multiple items when data is available', () => {
        const assets = [
            generateAsset({
                token: {
                    symbol: 'ABC',
                    address: '0xABC',
                    network: 'mainnet',
                    name: 'Asset ABC',
                    logo: 'abc.png',
                    type: 'type value',
                    decimals: 0,
                    priceChangeOnDayUsd: '0.00',
                    priceUsd: '0.00',
                },
                amount: '100',
            }),
            generateAsset({
                token: {
                    symbol: 'DEF',
                    address: '0xDEF',
                    network: 'mainnet',
                    name: 'Asset DEF',
                    logo: 'def.png',
                    type: 'type value',
                    decimals: 0,
                    priceChangeOnDayUsd: '0.00',
                    priceUsd: '0.00',
                },
                amount: '200',
            }),
        ];
        useAssetListDataSpy.mockReturnValue({
            onLoadMore: jest.fn(),
            assetList: assets,
            state: 'idle' as const,
            pageSize: 10,
            itemsCount: 2,
            emptyState: { heading: '', description: '' },
            errorState: { heading: '', description: '' },
        });

        render(createTestComponent());

        assets.forEach((balance) => {
            expect(screen.getByText(Number(balance.amount) / 10 ** balance.token.decimals)).toBeInTheDocument();
            expect(screen.getByText(balance.token.symbol)).toBeInTheDocument();
        });
    });

    it('renders empty state when there are no assets', () => {
        useAssetListDataSpy.mockReturnValue({
            onLoadMore: jest.fn(),
            assetList: [],
            state: 'idle' as const,
            pageSize: 10,
            itemsCount: 0,
            emptyState: { heading: 'No assets', description: 'No assets found for the specified criteria.' },
            errorState: { heading: '', description: '' },
        });

        render(createTestComponent());

        expect(screen.getByText('No assets')).toBeInTheDocument();
        expect(screen.getByText('No assets found for the specified criteria.')).toBeInTheDocument();
    });

    it('renders error state when an error occurs', () => {
        useAssetListDataSpy.mockReturnValue({
            onLoadMore: jest.fn(),
            assetList: [],
            state: 'error' as const,
            pageSize: 10,
            itemsCount: 0,
            emptyState: { heading: '', description: '' },
            errorState: { heading: 'Error', description: 'An error occurred while fetching assets.' },
        });

        render(createTestComponent());

        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText('An error occurred while fetching assets.')).toBeInTheDocument();
    });
});
