import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { AddressesInputContextProvider } from '../addressesInputContext';
import { AddressesInputItem } from './addressesInputItem';

const TestComponent = ({ index = 0 }: { index?: number }) => {
    const formMethods = useForm({
        defaultValues: { members: [{ address: '' }, { address: '' }] },
    });

    return (
        <FormProvider {...formMethods}>
            <AddressesInputContextProvider
                value={{
                    fieldName: 'members',
                    inputIdPrefix: 'members',
                    onRemoveMember: jest.fn(),
                }}
            >
                <AddressesInputItem index={index} />
            </AddressesInputContextProvider>
        </FormProvider>
    );
};

describe('<AddressesInputItem /> component', () => {
    it('names the member input by its position in the list', () => {
        render(
            <GukModulesProvider>
                <ReactQueryWrapper>
                    <TestComponent index={1} />
                </ReactQueryWrapper>
            </GukModulesProvider>,
        );

        expect(
            screen.getByRole('textbox', {
                name: 'app.shared.addressesInput.item.input.accessibleName (number=2)',
            }),
        ).toBeInTheDocument();
    });

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
