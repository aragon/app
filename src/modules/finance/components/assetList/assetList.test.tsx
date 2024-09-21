import { AssetList, type IAssetListProps } from '@/modules/finance/components/assetList';
import * as useAssetListData from '@/modules/finance/hooks/useAssetListData/useAssetListData';
import { generateAsset, generateToken } from '@/modules/finance/testUtils';
import { Network } from '@/shared/api/daoService';
import { OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';

describe('<AssetList /> component', () => {
    const useAssetListDataSpy = jest.spyOn(useAssetListData, 'useAssetListData');

    beforeEach(() => {
        useAssetListDataSpy.mockReturnValue({
            assetList: undefined,
            onLoadMore: jest.fn(),
            state: 'idle',
            pageSize: 10,
            itemsCount: 0,
            emptyState: { heading: '', description: '' },
            errorState: { heading: '', description: '' },
        });
    });

    afterEach(() => {
        useAssetListDataSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IAssetListProps>) => {
        const completeProps: IAssetListProps = {
            initialParams: { queryParams: {} },
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
                token: generateToken({ address: '0x123', symbol: 'ABC' }),
                amount: '1.23',
            }),
            generateAsset({
                token: generateToken({ address: '0x456', symbol: 'DEF' }),
                amount: '987654321.987654',
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

        expect(screen.getByText('1.23')).toBeInTheDocument();
        expect(screen.getByText(assets[0].token.symbol)).toBeInTheDocument();

        expect(screen.getByText('987.65M')).toBeInTheDocument();
        expect(screen.getByText(assets[1].token.symbol)).toBeInTheDocument();
    });

    it('correctly set the link of the assets', () => {
        const initialParams = { queryParams: { network: Network.POLYGON_MAINNET } };
        const assets = [
            generateAsset({ token: generateToken({ network: initialParams.queryParams.network, address: '0x123' }) }),
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

        render(createTestComponent({ initialParams }));
        expect(screen.getByRole('link').getAttribute('href')).toEqual('https://polygonscan.com/token/0x123');
    });

    it('does not render the data-list pagination when hidePagination is set to true', () => {
        const hidePagination = true;
        useAssetListDataSpy.mockReturnValue({
            assetList: [generateAsset()],
            onLoadMore: jest.fn(),
            state: 'idle',
            pageSize: 10,
            itemsCount: 0,
            emptyState: { heading: '', description: '' },
            errorState: { heading: '', description: '' },
        });
        render(createTestComponent({ hidePagination }));
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('renders the children property', () => {
        const children = 'test-children';
        render(createTestComponent({ children }));
        expect(screen.getByText(children)).toBeInTheDocument();
    });
});
