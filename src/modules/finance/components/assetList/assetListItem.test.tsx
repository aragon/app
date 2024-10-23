import { Network } from '@/shared/api/daoService';
import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { generateAsset, generateToken } from '../../testUtils';
import { AssetListItem, type IAssetListItemProps } from './assetListItem';

describe('<AssetListItem /> component', () => {
    const createTestComponent = (props?: Partial<IAssetListItemProps>) => {
        const completeProps: IAssetListItemProps = {
            asset: generateAsset(),
            ...props,
        };

        return (
            <GukModulesProvider>
                <AssetListItem {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('correctly set the link of the assets', () => {
        const asset = generateAsset({ token: generateToken({ network: Network.POLYGON_MAINNET, address: '0x123' }) });
        render(createTestComponent({ asset }));
        expect(screen.getByRole('link').getAttribute('href')).toEqual('https://polygonscan.com/token/0x123');
    });
});
