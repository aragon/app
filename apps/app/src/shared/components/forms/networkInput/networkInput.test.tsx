import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { FormWrapper } from '@/shared/testUtils';
import { networkUtils } from '@/shared/utils/networkUtils';
import { NetworkInput } from './networkInput';
import type { INetworkInputProps } from './networkInput.api';

describe('<NetworkInput /> component', () => {
    const createTestComponent = (props?: Partial<INetworkInputProps>) => {
        const completeProps: INetworkInputProps = {
            name: 'network',
            ...props,
        };

        return (
            <FormWrapper>
                <NetworkInput {...completeProps} />
            </FormWrapper>
        );
    };

    it('displays the default network on the trigger', () => {
        render(createTestComponent());

        expect(
            screen.getByRole('button', { name: /shared.networkInput.label/ }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(networkDefinitions[Network.ETHEREUM_SEPOLIA].name),
        ).toBeInTheDocument();
    });

    it('displays the network passed as default value', () => {
        render(createTestComponent({ defaultValue: Network.ETHEREUM_MAINNET }));

        expect(
            screen.getByText(networkDefinitions[Network.ETHEREUM_MAINNET].name),
        ).toBeInTheDocument();
    });

    it('updates the trigger and calls onValueChange with the selected network', async () => {
        const onValueChange = jest.fn();
        render(createTestComponent({ onValueChange }));

        await userEvent.click(
            screen.getByRole('button', { name: /shared.networkInput.label/ }),
        );
        await userEvent.click(
            screen.getByRole('menuitem', {
                name: networkDefinitions[Network.POLYGON_MAINNET].name,
            }),
        );

        expect(onValueChange).toHaveBeenCalledWith(Network.POLYGON_MAINNET);
        expect(
            screen.getByRole('button', { name: /shared.networkInput.label/ }),
        ).toHaveTextContent(networkDefinitions[Network.POLYGON_MAINNET].name);
    });

    it('displays the enabled networks ordered as defined on the network definitions', async () => {
        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', { name: /shared.networkInput.label/ }),
        );

        const expectedNetworks = networkUtils
            .getSupportedNetworks()
            .filter((network) => !networkDefinitions[network].disabled)
            .sort(
                (networkA, networkB) =>
                    networkDefinitions[networkA].order -
                    networkDefinitions[networkB].order,
            )
            .map((network) => networkDefinitions[network].name);

        const renderedNetworks = screen
            .getAllByRole('menuitem')
            .map((item) => item.textContent);

        // Items also carry the testnet/beta tag, therefore the name is asserted as a prefix of the item content.
        expect(renderedNetworks).toHaveLength(expectedNetworks.length);
        for (const [index, name] of expectedNetworks.entries()) {
            expect(renderedNetworks[index]).toContain(name);
        }
    });

    it('renders the network items with valid DOM nesting', async () => {
        // Dropdown.Item renders its children inside a paragraph, therefore rendering flow content (e.g. the Tag
        // component, which renders a div) inside an item triggers a React hydration error.
        const consoleSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => null);

        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', { name: /shared.networkInput.label/ }),
        );

        const nestingErrors = consoleSpy.mock.calls
            .map((call) => String(call[0]))
            .filter((message) => message.includes('cannot be a descendant'));
        consoleSpy.mockRestore();

        expect(nestingErrors).toEqual([]);
    });
});
