import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import { generateAsset, generateToken } from '../../testUtils';
import {
    AssetAddressSelectItem,
    type IAssetAddressSelectItemProps,
} from './assetAddressSelectItem';

describe('<AssetAddressSelectItem /> component', () => {
    const createTestComponent = (
        props?: Partial<IAssetAddressSelectItemProps>,
    ) => {
        const completeProps: IAssetAddressSelectItemProps = {
            asset: generateAsset(),
            ...props,
        };

        return (
            <GukModulesProvider>
                <AssetAddressSelectItem {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('correctly set the link of the assets', () => {
        const asset = generateAsset({
            token: generateToken({
                network: Network.POLYGON_MAINNET,
                address: '0x123',
            }),
        });
        render(createTestComponent({ asset }));
        expect(screen.getByRole('link').getAttribute('href')).toEqual(
            'https://polygonscan.com/token/0x123',
        );
    });
});
