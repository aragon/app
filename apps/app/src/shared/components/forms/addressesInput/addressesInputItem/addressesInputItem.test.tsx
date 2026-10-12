import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { AddressesInputContextProvider } from '../addressesInputContext';
import { AddressesInputItem } from './addressesInputItem';

const TestComponent = () => {
    const formMethods = useForm({
        defaultValues: { members: [{ address: '' }] },
    });

    return (
        <FormProvider {...formMethods}>
            <AddressesInputContextProvider
                value={{ fieldName: 'members', onRemoveMember: jest.fn() }}
            >
                <AddressesInputItem index={0} />
            </AddressesInputContextProvider>
        </FormProvider>
    );
};

describe('<AddressesInputItem /> component', () => {
    it('uses the translated label for the remove button', () => {
        render(
            <GukModulesProvider>
                <ReactQueryWrapper>
                    <TestComponent />
                </ReactQueryWrapper>
            </GukModulesProvider>,
        );

        expect(
            screen.getByText('app.shared.addressesInput.item.remove'),
        ).toBeInTheDocument();
    });
});
