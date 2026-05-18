import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import {
    AssetAddressSelectAddButton,
    type IAssetAddressSelectAddButtonProps,
} from './assetAddressSelectAddButton';

describe('<AssetAddressSelectAddButton /> component', () => {
    const createTestComponent = (
        props?: Partial<IAssetAddressSelectAddButtonProps>,
    ) => {
        const completeProps: IAssetAddressSelectAddButtonProps = {
            ...props,
        };

        return (
            <GukModulesProvider>
                <AssetAddressSelectAddButton {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the add address label', () => {
        render(createTestComponent());
        expect(
            screen.getByText('app.finance.assetAddressSelect.addButton.label'),
        ).toBeInTheDocument();
    });

    it('forwards the onClick handler', () => {
        const onClick = jest.fn();
        render(createTestComponent({ onClick }));
        screen.getByRole('button').click();
        expect(onClick).toHaveBeenCalled();
    });
});
