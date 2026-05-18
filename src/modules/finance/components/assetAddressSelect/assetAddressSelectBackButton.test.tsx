import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import {
    AssetAddressSelectBackButton,
    type IAssetAddressSelectBackButtonProps,
} from './assetAddressSelectBackButton';

describe('<AssetAddressSelectBackButton /> component', () => {
    const createTestComponent = (
        props?: Partial<IAssetAddressSelectBackButtonProps>,
    ) => {
        const completeProps: IAssetAddressSelectBackButtonProps = {
            children: 'All assets',
            ...props,
        };

        return (
            <GukModulesProvider>
                <AssetAddressSelectBackButton {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the provided label', () => {
        render(createTestComponent({ children: 'All assets' }));
        expect(screen.getByText('All assets')).toBeInTheDocument();
    });

    it('forwards the onClick handler', () => {
        const onClick = jest.fn();
        render(createTestComponent({ onClick }));
        screen.getByRole('button').click();
        expect(onClick).toHaveBeenCalled();
    });
});
