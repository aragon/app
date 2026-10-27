import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { FormWrapper } from '@/shared/testUtils';
import { CreateDaoFormNetwork } from './createDaoFormNetwork';

describe('<CreateDaoFormNetwork /> component', () => {
    const createTestComponent = (defaultValues?: { network?: Network }) => (
        <FormWrapper defaultValues={defaultValues}>
            <CreateDaoFormNetwork />
        </FormWrapper>
    );

    const mainnetsCount = Object.values(networkDefinitions).filter(
        ({ testnet }) => !testnet,
    ).length;

    it('renders every mainnet and only the first testnet until expanded', () => {
        render(createTestComponent());

        expect(screen.getAllByRole('radio')).toHaveLength(mainnetsCount + 1);
        expect(
            screen.getByRole('radio', { name: 'Ethereum Sepolia' }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('radio', { name: 'Ethereum Hoodi' }),
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /network.showAllTestnets/ }),
        ).toHaveAttribute('aria-expanded', 'false');
    });

    it('selects the first mainnet when navigating down from the last visible testnet', async () => {
        const user = userEvent.setup();
        render(createTestComponent());

        await user.click(
            screen.getByRole('radio', { name: 'Ethereum Sepolia' }),
        );
        // Radix moves roving focus in a timeout and only checks the focused item while the arrow key is still held
        await user.keyboard('{ArrowDown>}');

        await waitFor(() => {
            expect(
                screen.getByRole('radio', { name: 'Ethereum' }),
            ).toBeChecked();
        });
        await user.keyboard('{/ArrowDown}');
    });

    it('keeps the selected testnet visible when the other testnets are collapsed', async () => {
        const user = userEvent.setup();
        render(createTestComponent());

        await user.click(
            screen.getByRole('button', { name: /network.showAllTestnets/ }),
        );
        expect(
            screen.getByRole('radio', { name: 'Base Sepolia' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('radio', { name: 'BNB Smart Chain Testnet' }),
        ).toBeInTheDocument();

        await user.click(screen.getByRole('radio', { name: 'Ethereum Hoodi' }));
        await user.click(
            screen.getByRole('button', { name: /network.showFewer/ }),
        );

        expect(
            screen.getByRole('radio', { name: 'Ethereum Hoodi' }),
        ).toBeChecked();
        expect(
            screen.getByRole('radio', { name: 'Ethereum Sepolia' }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('radio', { name: 'Base Sepolia' }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('radio', { name: 'BNB Smart Chain Testnet' }),
        ).not.toBeInTheDocument();
    });

    it('shows a previously selected testnet when returning to the network step', () => {
        render(createTestComponent({ network: Network.BASE_SEPOLIA }));

        expect(
            screen.getByRole('radio', { name: 'Base Sepolia' }),
        ).toBeChecked();
    });
});
