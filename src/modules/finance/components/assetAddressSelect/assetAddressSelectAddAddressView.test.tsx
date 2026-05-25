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
            screen.getByText('app.finance.assetAddressSelect.backButton.label'),
        ).toBeInTheDocument();
    });

    it('calls onBack when the back button is clicked', () => {
        const onBack = jest.fn();
        render(createTestComponent({ onBack }));
        screen
            .getByText('app.finance.assetAddressSelect.backButton.label')
            .closest('button')!
            .click();
        expect(onBack).toHaveBeenCalled();
    });

    it('does not pass an address to useToken when input is not a valid address', async () => {
        render(createTestComponent());

        const user = userEvent.setup();
        await user.type(screen.getByRole('searchbox'), 'not-an-address');

        const lastCall = useTokenSpy.mock.calls.at(-1);
        expect(lastCall?.[0]?.address).toBeUndefined();
    });

    it('passes the typed address to useToken when input is a valid address', async () => {
        render(createTestComponent());

        const validAddress = '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0';
        const user = userEvent.setup();
        await user.type(screen.getByRole('searchbox'), validAddress);

        const lastCall = useTokenSpy.mock.calls.at(-1);
        expect(lastCall?.[0]?.address?.toLowerCase()).toBe(
            validAddress.toLowerCase(),
        );
    });

    it('pre-fills the input and resolves immediately on first render when initialAddress is set', () => {
        const initialAddress =
            '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0' as `0x${string}`;

        render(createTestComponent({ initialAddress }));

        expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe(
            initialAddress,
        );

        const firstCall = useTokenSpy.mock.calls[0];
        expect(firstCall?.[0]?.address).toBe(initialAddress);
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

    it('renders the not-a-token empty state when useToken resolves with no data', async () => {
        useTokenSpy.mockReturnValue({
            data: null,
            isLoading: false,
            isError: true,
        });

        render(createTestComponent());

        const user = userEvent.setup();
        await user.type(
            screen.getByRole('searchbox'),
            '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
        );

        expect(
            screen.getByText(
                'app.finance.assetAddressSelect.addAddressView.notATokenState.heading',
            ),
        ).toBeInTheDocument();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
});
