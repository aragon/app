import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { AddressesInputContextProvider } from '../addressesInputContext';
import {
    AddressesInputItem,
    type IAddressesInputItemProps,
} from './addressesInputItem';

describe('<AddressesInputItem /> component', () => {
    const createTestComponent = (props?: Partial<IAddressesInputItemProps>) => {
        const completeProps: IAddressesInputItemProps = { index: 0, ...props };

        const Harness = () => {
            const form = useForm({
                defaultValues: { members: [{ address: '' }, { address: '' }] },
            });

            return (
                <FormProvider {...form}>
                    <AddressesInputContextProvider
                        value={{
                            fieldName: 'members',
                            inputIdPrefix: 'members',
                            onRemoveMember: jest.fn(),
                        }}
                    >
                        <AddressesInputItem {...completeProps} />
                    </AddressesInputContextProvider>
                </FormProvider>
            );
        };

        return (
            <GukModulesProvider>
                <ReactQueryWrapper>
                    <Harness />
                </ReactQueryWrapper>
            </GukModulesProvider>
        );
    };

    it('names the member input by its position in the list', () => {
        render(createTestComponent({ index: 1 }));

        expect(
            screen.getByRole('textbox', {
                name: 'app.shared.addressesInput.item.input.accessibleName (number=2)',
            }),
        ).toBeInTheDocument();
    });

    it('uses the translated label for the remove button', () => {
        render(createTestComponent());

        expect(
            screen.getByText('app.shared.addressesInput.item.remove'),
        ).toBeInTheDocument();
    });
});
