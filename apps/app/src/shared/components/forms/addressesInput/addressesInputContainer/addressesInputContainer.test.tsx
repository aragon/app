import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import {
    AddressesInputContainer,
    type IAddressesInputContainerProps,
} from './addressesInputContainer';

describe('<AddressesInputContainer /> component', () => {
    const createTestComponent = (
        props?: Partial<IAddressesInputContainerProps>,
    ) => {
        const completeProps: IAddressesInputContainerProps = {
            name: 'members',
            label: 'Members',
            ...props,
        };

        const Harness = () => {
            const form = useForm({
                defaultValues: { members: [{ address: '' }] },
            });

            return (
                <FormProvider {...form}>
                    <AddressesInputContainer {...completeProps}>
                        <div>row 0</div>
                    </AddressesInputContainer>
                </FormProvider>
            );
        };

        return <Harness />;
    };

    it('exposes the address list as a group named by the label', () => {
        render(createTestComponent());

        const group = screen.getByRole('group', { name: 'Members' });

        expect(group).toBeInTheDocument();
        expect(group).toHaveTextContent('row 0');
    });
});
