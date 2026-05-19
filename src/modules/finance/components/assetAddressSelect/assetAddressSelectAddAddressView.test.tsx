import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Network } from '@/shared/api/daoService';
import * as useTokenModule from '@/shared/hooks/useToken/useToken';
import {
    AssetAddressSelectAddAddressView,
    type IAssetAddressSelectAddAddressViewProps,
} from './assetAddressSelectAddAddressView';

describe('<AssetAddressSelectAddAddressView /> component', () => {
    const useTokenSpy = jest.spyOn(useTokenModule, 'useToken');

    beforeEach(() => {
        useTokenSpy.mockReturnValue({
            data: null,
            isLoading: false,
            isError: false,
        });
    });

    afterEach(() => {
        useTokenSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IAssetAddressSelectAddAddressViewProps>,
    ) => {
        const completeProps: IAssetAddressSelectAddAddressViewProps = {
            network: Network.ETHEREUM_MAINNET,
            onBack: jest.fn(),
            ...props,
        };

        return (
            <GukModulesProvider>
                <AssetAddressSelectAddAddressView {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the search input and back button', () => {
        render(createTestComponent());
        expect(screen.getByRole('searchbox')).toBeInTheDocument();
        expect(
            screen.getByText('app.finance.assetAddressSelect.groupTab'),
        ).toBeInTheDocument();
    });

    it('calls onBack when the back button is clicked', () => {
        const onBack = jest.fn();
        render(createTestComponent({ onBack }));
        screen
            .getByText('app.finance.assetAddressSelect.groupTab')
            .closest('button')!
            .click();
        expect(onBack).toHaveBeenCalled();
    });

    it('does not enable useToken when input is not a valid address', async () => {
        render(createTestComponent());

        const user = userEvent.setup();
        await user.type(screen.getByRole('searchbox'), 'not-an-address');

        const lastCall = useTokenSpy.mock.calls.at(-1);
        expect(lastCall?.[0].enabled).toBe(false);
    });

    it('enables useToken with the typed address when input is a valid address', async () => {
        render(createTestComponent());

        const validAddress = '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0';
        const user = userEvent.setup();
        await user.type(screen.getByRole('searchbox'), validAddress);

        const lastCall = useTokenSpy.mock.calls.at(-1);
        expect(lastCall?.[0].enabled).toBe(true);
        expect(lastCall?.[0].address.toLowerCase()).toBe(
            validAddress.toLowerCase(),
        );
    });

    it('renders the resolved row using token data when useToken returns', async () => {
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

        render(createTestComponent());

        const user = userEvent.setup();
        await user.type(
            screen.getByRole('searchbox'),
            '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
        );

        expect(screen.getByText('Wrapped stETH')).toBeInTheDocument();
    });
});
