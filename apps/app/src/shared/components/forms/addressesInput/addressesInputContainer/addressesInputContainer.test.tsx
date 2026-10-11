import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { AddressesInputItem } from '../addressesInputItem';
import {
    AddressesInputContainer,
    type IAddressesInputContainerProps,
} from './addressesInputContainer';

describe('<AddressesInputContainer /> component', () => {
    const createTestComponent = (
        props?: Partial<IAddressesInputContainerProps>,
        rows: ReactNode = <div>row 0</div>,
        members = [{ address: '' }],
    ) => {
        const completeProps: IAddressesInputContainerProps = {
            name: 'members',
            label: 'Members',
            ...props,
        };

        const Harness = () => {
            const form = useForm({ defaultValues: { members } });

            return (
                <FormProvider {...form}>
                    <AddressesInputContainer {...completeProps}>
                        {rows}
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

    it('names each member input by its position in the list', () => {
        render(
            <GukModulesProvider>
                <ReactQueryWrapper>
                    {createTestComponent(
                        undefined,
                        <>
                            <AddressesInputItem index={0} />
                            <AddressesInputItem index={1} />
                        </>,
                        [{ address: '' }, { address: '' }],
                    )}
                </ReactQueryWrapper>
            </GukModulesProvider>,
        );

        const name = 'app.shared.addressesInput.item.input.accessibleName';
        expect(
            screen.getByRole('textbox', { name: `${name} (number=1)` }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('textbox', { name: `${name} (number=2)` }),
        ).toBeInTheDocument();
    });
});
