import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, type UseFormReturn, useForm } from 'react-hook-form';
import { Network } from '@/shared/api/daoService';
import type { ICreateDaoFormData } from '../createDaoFormDefinitions';
import { CreateDaoFormNetwork } from './createDaoFormNetwork';

describe('<CreateDaoFormNetwork /> component', () => {
    let form: UseFormReturn<ICreateDaoFormData>;

    const TestForm = (props: { network?: Network }) => {
        form = useForm<ICreateDaoFormData>({
            defaultValues: { network: props.network },
        });

        return (
            <FormProvider {...form}>
                <CreateDaoFormNetwork />
            </FormProvider>
        );
    };

    it('keeps undisclosed testnets out of keyboard selection', async () => {
        const user = userEvent.setup();
        render(<TestForm />);

        await user.click(
            screen.getByRole('radio', { name: 'Ethereum Sepolia' }),
        );
        await user.keyboard('{ArrowDown>}');

        await waitFor(() => {
            expect(form.getValues('network')).toBe(Network.ETHEREUM_MAINNET);
        });
        await user.keyboard('{/ArrowDown}');
        expect(
            screen.queryByRole('radio', { name: 'Ethereum Hoodi' }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('radio', { name: 'Base Sepolia' }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('radio', { name: 'BNB Smart Chain Testnet' }),
        ).not.toBeInTheDocument();
    });

    it('keeps the selected testnet visible when the other testnets are collapsed', async () => {
        const user = userEvent.setup();
        render(<TestForm />);

        await user.click(
            screen.getByRole('button', { name: /network.showAll.testnets/ }),
        );
        expect(
            screen.getByRole('radio', { name: 'Base Sepolia' }),
        ).toBeVisible();
        expect(
            screen.getByRole('radio', { name: 'BNB Smart Chain Testnet' }),
        ).toBeVisible();

        await user.click(screen.getByRole('radio', { name: 'Ethereum Hoodi' }));
        await user.click(
            screen.getByRole('button', { name: /network.showFewer/ }),
        );

        expect(form.getValues('network')).toBe(Network.ETHEREUM_HOODI);
        expect(
            screen.getByRole('radio', { name: 'Ethereum Hoodi' }),
        ).toBeVisible();
        expect(
            screen.getByRole('radio', { name: 'Ethereum Sepolia' }),
        ).toBeVisible();
        expect(
            screen.queryByRole('radio', { name: 'Base Sepolia' }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('radio', { name: 'BNB Smart Chain Testnet' }),
        ).not.toBeInTheDocument();
    });

    it('shows a previously selected testnet when returning to the network step', () => {
        render(<TestForm network={Network.BASE_SEPOLIA} />);

        expect(form.getValues('network')).toBe(Network.BASE_SEPOLIA);
        expect(
            screen.getByRole('radio', { name: 'Base Sepolia' }),
        ).toBeVisible();
    });
});
